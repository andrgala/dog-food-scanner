import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { uploadImageAndExtractText } from './api';

export default function CameraScanner() {
  const webcamRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [extractedText, setExtractedText] = useState("");

  const captureAndSend = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      alert("Failed to capture image!");
      return;
    }

    setScanning(true);

    try {
      const text = await uploadImageAndExtractText(imageSrc);
      setExtractedText(text);
    } catch (error) {
      console.error("Error extracting text:", error);
    }

    setScanning(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width="100%"
        height="auto"
        videoConstraints={{
          facingMode: { ideal: "environment" }
        }}
        className="rounded-lg shadow-lg w-full max-w-md"
      />
      <button
        onClick={captureAndSend}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        disabled={scanning}
      >
        {scanning ? "Scanning..." : "Capture"}
      </button>

      {extractedText && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow w-full max-w-md">
          <h2 className="text-xl font-semibold mb-2">Extracted Text:</h2>
          <p>{extractedText}</p>
        </div>
      )}
    </div>
  );
}
