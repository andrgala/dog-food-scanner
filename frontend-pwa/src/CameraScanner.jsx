import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { uploadImageAndExtractText } from './api';

export default function CameraScanner() {
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [key, setKey] = useState(0);
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

  const flipCamera = () => {
    setFacingMode(prev => (prev === "user" ? "environment" : "user"));
    setKey(prev => prev + 1);
  };

  const getVideoConstraints = () => {
    if (facingMode === "environment") {
      return { facingMode: { ideal: "environment" } };
    } else {
      return { facingMode: "user" };
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Dog Food Scanner</h1>

      <Webcam
        key={key}
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={getVideoConstraints()}
        className="rounded-lg shadow-md"
      />

      {/* Buttons Section */}
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        <button
          onClick={capture}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
        >
          {loading ? "Scanning..." : "Capture and Scan"}
        </button>

        <button
          onClick={flipCamera}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded"
        >
          Flip Camera
        </button>
      </div>

      {/* Result Section */}
      {extractedText && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow w-full max-w-md">
          <p className="text-lg font-semibold mb-2">Extracted Text:</p>
          <p>{extractedText}</p>
        </div>
      )}
    </div>
  );
}
