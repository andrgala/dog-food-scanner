# 🐶 Dog Food Scanner Project

Mobile-first live OCR app to scan dog food package information, confirm details, and save to Firestore, integrated with Wix for user points.

---

## 📦 Project Structure


---

## 🛠 Technologies Used

- Frontend: HTML, CSS, JavaScript, Tesseract.js
- Backend: FastAPI (Python)
- Database: Google Firestore
- Hosting: Netlify / Vercel for frontend
- Hosting: Render.com for backend
- Authentication: Wix Members Area
- Points System: Wix Database + API

---
## 🚀 How to Run Locally

### Frontend (ocr-webapp)

```bash
cd ocr-webapp
# Simply open index.html in your browser

Backend
cd backend-fastapi
python -m venv venv
source venv/bin/activate   # Mac/Linux
# or
venv\Scripts\activate.bat  # Windows

pip install -r requirements.txt
uvicorn main:app --reload

📋 Deployment Notes
Render (backend)
Root Directory: backend-fastapi/

Build Command: pip install -r requirements.txt

Start Command: uvicorn main:app --host=0.0.0.0 --port=10000

Netlify/Vercel (frontend)
Deploy the ocr-webapp folder

No build command needed (pure HTML/CSS/JS)

 Future Plans
Live OCR improvement

Mobile PWA app

Admin dashboard

🤝 Author
Made with ❤️ by Cognitail Team