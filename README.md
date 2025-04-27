# 🦴 Dog Food Scanner - Backend API

Welcome to the **Dog Food Scanner** API!

This FastAPI backend powers the mobile scanning app, allowing users to:
- OCR scan dog food packages 📦
- Save products to Firestore 🗃️
- Search products in the database 🔍

---

## 🚀 API Endpoints

| Method | Endpoint | Description |
|:------|:---------|:------------|
| GET    | `/`             | Health check ("API is live") |
| POST   | `/upload/`       | Upload an image URL and extract text using Google Vision OCR |
| POST   | `/add-product/`  | Save extracted product data to Firestore |
| GET    | `/search-products/` | Search for products by name |

---

## 🛠️ Technologies Used

- [FastAPI](https://fastapi.tiangolo.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Google Cloud Vision API](https://cloud.google.com/vision)
- [Render.com](https://render.com) for deployment
- [Firestore](https://firebase.google.com/products/firestore) for database

---

## 📦 Project Structure


---

## 🌍 Deployment

The app is deployed on Render:

> Production URL: [https://dog-food-backend.onrender.com](https://dog-food-backend.onrender.com)

API Docs automatically available at:

> [https://dog-food-backend.onrender.com/docs](https://dog-food-backend.onrender.com/docs)

---

## 📋 Environment Variables

| Variable | Purpose |
|:---------|:--------|
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | JSON contents of the Google Cloud service account (for Firestore + Vision) |

---

## 📜 License

MIT License — free for personal or commercial use.

---

### 🔥 Built with ❤️ to make dogs happier!
