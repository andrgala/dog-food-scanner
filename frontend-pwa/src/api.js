import axios from "axios";

// Your backend API URL
const BASE_URL = "https://dog-food-backend.onrender.com";

export async function uploadImageAndExtractText(base64Image) {
  try {
    const response = await axios.post(`${BASE_URL}/upload/`, {
      imageUrl: base64Image,
    });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}
