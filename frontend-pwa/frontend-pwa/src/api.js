// src/api.js
import axios from "axios";

const BASE_URL = "https://dog-food-scanner.onrender.com";

export async function uploadImageAndExtractText(base64Image) {
  const blob = await fetch(base64Image).then(res => res.blob());

  const formData = new FormData();
  formData.append('file', blob, 'screenshot.jpg');

  try {
    const response = await axios.post(`${BASE_URL}/upload/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}
