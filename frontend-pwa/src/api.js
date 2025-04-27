import axios from 'axios';

// 👉 IMPORTANT: use your real backend Render URL here
const backendUrl = 'https://dog-food-scanner.onrender.com'; 

export async function uploadImageAndExtractText(imageBase64) {
  try {
    const response = await axios.post(`${backendUrl}/upload/`, {
      imageUrl: imageBase64,
    });
    return response.data.extracted_texts?.productName || "";
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}
