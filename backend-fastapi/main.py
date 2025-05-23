from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud import vision
from google.oauth2 import service_account

from firestore_helper import save_product, search_products
from vision_helper import extract_text_from_image

app = FastAPI()

# Global Firestore and Vision clients
db = None
vision_client = None

def initialize_services():
    firebase_creds_json = os.getenv('GOOGLE_APPLICATION_CREDENTIALS_JSON')
    if not firebase_creds_json:
        raise Exception("Missing GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable.")

    creds_dict = json.loads(firebase_creds_json)
    cred = credentials.Certificate(creds_dict)

    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)

    global db
    db = firestore.client()

    vision_credentials = service_account.Credentials.from_service_account_info(creds_dict)
    global vision_client
    vision_client = vision.ImageAnnotatorClient(credentials=vision_credentials)

    return db, vision_client

@app.on_event("startup")
async def startup_event():
    initialize_services()
    print("✅ Services initialized")

@app.on_event("shutdown")
async def shutdown_event():
    print("🛑 Shutting down...")

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProductData(BaseModel):
    productName: str
    brandName: str = ""
    ingredients: str = ""
    feedingGuidelines: str = ""

@app.get("/")
async def root():
    return {"message": "API is live"}

@app.post("/upload/")
async def upload_image_file(
    file: UploadFile = File(...),
    type: str = Query("generic", description="Type of scan: 'generic' or 'feeding'")
):
    """
    Upload an image and extract text. If type='feeding', returns structured table data.
    """
    try:
        contents = await file.read()

        if type == "feeding":
            structured = extract_text_from_image(contents, vision_client, extract_feeding_table=True)
            return {"extracted_texts": {"feedingGuidelines": structured}}
        else:
            full_text = extract_text_from_image(contents, vision_client)
            return {"extracted_texts": {"productName": full_text.strip()}}

    except Exception as e:
        print("Error in upload_image_file:", str(e))
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/add-product/")
async def add_product(data: dict):
    try:
        save_product(data, db)
        return {"message": "Product saved successfully"}
    except Exception as e:
        print("Error saving product:", str(e))
        raise HTTPException(status_code=500, detail="Failed to save product")

@app.get("/search-products/")
async def search_products_endpoint(query: str):
    try:
        products = search_products(query, db)
        return {"products": products}
    except Exception as e:
        print("Error searching products:", str(e))
        raise HTTPException(status_code=500, detail="Failed to search products")
