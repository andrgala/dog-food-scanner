import axios from 'axios';

const backendUrl = 'https://dog-food-backend.onrender.com';

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
