// ManualTableCropper.jsx
import React, { useRef, useState, useEffect } from 'react';

export default function ManualTableCropper({ imageSrc, onCropComplete, onCancel }) {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);

  const handleCanvasClick = (e) => {
    if (points.length >= 4) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPoints(prev => [...prev, { x, y }]);
  };

  const handleReset = () => setPoints([]);

  const handleCrop = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const [tl, tr, br, bl] = points;
    const minX = Math.min(tl.x, bl.x);
    const minY = Math.min(tl.y, tr.y);
    const maxX = Math.max(tr.x, br.x);
    const maxY = Math.max(bl.y, br.y);

    const width = maxX - minX;
    const height = maxY - minY;

    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = width;
    croppedCanvas.height = height;
    const croppedCtx = croppedCanvas.getContext("2d");
    croppedCtx.drawImage(canvas, minX, minY, width, height, 0, 0, width, height);
    const croppedDataUrl = croppedCanvas.toDataURL("image/jpeg");

    onCropComplete(croppedDataUrl);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const image = new Image();
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
    };
    image.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.stroke();
    });
  }, [points]);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-center text-sm text-gray-600">
        Tap/click the 4 corners of the feeding table (Top-Left → Top-Right → Bottom-Right → Bottom-Left)
      </p>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="border border-gray-400 shadow rounded max-w-full"
      />
      <div className="flex gap-4">
        <button
          onClick={handleReset}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Reset Points
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleCrop}
          disabled={points.length !== 4}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Confirm Crop
        </button>
      </div>
    </div>
  );
}
