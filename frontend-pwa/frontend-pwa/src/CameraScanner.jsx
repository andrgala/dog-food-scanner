import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { uploadImageAndExtractText } from './api';

export default function CameraScanner() {
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [facingMode, setFacingMode] = useState("environment"); // Default to back camera
  const [key, setKey] = useState(0); // Key to force re-mounting Webcam

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

  const flipCamera = () => {
    setFacingMode(prev => (prev === "user" ? "environment" : "user"));
    setKey(prev => prev + 1); // Force remount Webcam to apply new facingMode
  };

  const videoConstraints = {
    facingMode: { exact: facingMode }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Dog Food Scanner</h1>
      
      <Webcam
        key={key}
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className="rounded-lg shadow-md"
      />

      <div className="flex space-x-4 mt-4">
        <button
          onClick={capture}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? "Scanning..." : "Capture and Scan"}
        </button>

        <button
          onClick={flipCamera}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Flip Camera
        </button>
      </div>

      {extractedText && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow">
          <p><strong>Extracted Text:</strong></p>
          <p>{extractedText}</p>
        </div>
      )}
    </div>
  );
}
