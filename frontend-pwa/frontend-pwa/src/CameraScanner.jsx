import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { uploadImageAndExtractText } from './api';

export default function CameraScanner() {
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");

  const capture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setLoading(true);
    try {
      const response = await uploadImageAndExtractText(imageSrc);
      setExtractedText(response.extracted_texts.productName);
    } catch (error) {
      console.error("Error extracting text:", error);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Dog Food Scanner</h1>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="rounded-lg shadow-md"
      />
      <button
        onClick={capture}
        disabled={loading}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {loading ? "Scanning..." : "Capture and Scan"}
      </button>
      {extractedText && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow">
          <p><strong>Extracted Text:</strong></p>
          <p>{extractedText}</p>
        </div>
      )}
    </div>
  );
}
