import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';

export default function CameraScanner() {
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [key, setKey] = useState(0);

  const flipCamera = () => {
    setFacingMode(prev => (prev === "user" ? "environment" : "user"));
    setKey(prev => prev + 1);
  };

  const videoConstraints = {
    facingMode: { exact: facingMode }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Camera Test</h1>

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
          onClick={flipCamera}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Flip Camera
        </button>
      </div>
    </div>
  );
}
