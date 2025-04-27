import axios from 'axios';

// ⚡ Correct backend URL
const BASE_URL = "https://dog-food-backend.onrender.com";

// ⚡ Updated function to send real image (binary) as FormData
export async function uploadImageAndExtractText(base64Image) {
  try {
    const formData = new FormData();
    formData.append("file", base64ToBlob(base64Image), "snapshot.jpg");

    const response = await axios.post(`${BASE_URL}/upload/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}

// Helper to convert base64 to Blob
function base64ToBlob(base64Data) {
  const byteCharacters = atob(base64Data.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: 'image/jpeg' });
}
