import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import { uploadImageAndExtractText } from "./api";

export default function CameraScanner() {
  const webcamRef = useRef(null);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);

  const captureAndScan = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setLoading(true);
    try {
      const result = await uploadImageAndExtractText(imageSrc);
      setExtractedText(result.extracted_texts.productName || "No text found");
    } catch (error) {
      console.error("Error extracting text:", error);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center">
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="rounded-lg shadow-lg mb-4"
        width={300}
      />
      <button
        onClick={captureAndScan}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        {loading ? "Scanning..." : "Capture and Scan"}
      </button>
      {extractedText && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow">
          <p className="font-semibold">Extracted Text:</p>
          <p>{extractedText}</p>
        </div>
      )}
    </div>
  );
}
