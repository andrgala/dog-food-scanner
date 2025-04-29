import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { uploadImageAndExtractText } from './api';

export default function GuidedScanner() {
  const webcamRef = useRef(null);
  const [step, setStep] = useState(0);
  const [capturedImage, setCapturedImage] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [scannedValues, setScannedValues] = useState({
    brandName: '',
    productName: '',
    ingredients: '',
    feedingGuidelines: '',
    barcodeText: '',
    productImage: ''
  });
  const [productType, setProductType] = useState('Food');
  const [foodForm, setFoodForm] = useState('Kibble');
  const [loading, setLoading] = useState(false);

  const steps = [
    'Scan the brand name',
    'Scan the product name',
    'Scan the ingredients list',
    'Scan the feeding guidelines',
    'Scan the barcode text',
    'Take a picture of the product'
  ];

  const keys = [
    'brandName',
    'productName',
    'ingredients',
    'feedingGuidelines',
    'barcodeText'
  ];

  const videoConstraints = {
    facingMode: { ideal: 'environment' }
  };

  const handleNextStep = () => {
    setCapturedImage(null);
    setInputValue('');
    setStep(prev => prev + 1);
  };

  const handleRetry = () => {
    setCapturedImage(null);
    setInputValue('');
  };

  const handleCapture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setCapturedImage(imageSrc);

    if (step < 5) {
      setLoading(true);
      try {
        const response = await uploadImageAndExtractText(imageSrc);
        const text = response.extracted_texts.productName || '';
        setInputValue(text);
      } catch (err) {
        console.error("OCR Error:", err);
        setInputValue('');
      }
      setLoading(false);
    } else {
      setScannedValues(prev => ({ ...prev, productImage: imageSrc }));
    }
  };

  const handleConfirm = () => {
    if (step < 5) {
      const field = keys[step];
      setScannedValues(prev => ({ ...prev, [field]: inputValue }));
    }
    handleNextStep();
  };

  const handleSubmit = async () => {
    const data = {
      ...scannedValues,
      productType,
      foodForm
    };

    try {
      const res = await fetch('https://your-backend-url/add-product/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      console.log("✅ Product submitted:", json);
    } catch (err) {
      console.error("Submit Error:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">{steps[step]}</h1>

      {step < 6 && !capturedImage && (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="rounded-lg shadow-md"
        />
      )}

      {step < 6 && !capturedImage && (
        <button
          onClick={handleCapture}
          className="mt-4 bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700"
        >
          {loading ? "Scanning..." : "Capture"}
        </button>
      )}

      {capturedImage && step < 5 && (
        <div className="w-full max-w-md mt-4">
          <label className="block mb-2 font-semibold">Detected Text (editable):</label>
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <div className="flex gap-4 mt-4">
            <button onClick={handleRetry} className="bg-gray-500 text-white px-4 py-2 rounded">Retry</button>
            <button onClick={handleConfirm} className="bg-green-600 text-white px-4 py-2 rounded">Confirm</button>
          </div>
        </div>
      )}

      {step === 5 && capturedImage && (
        <div className="mt-4">
          <img src={capturedImage} alt="Captured" className="rounded-lg shadow-md max-w-md" />
          <button onClick={handleConfirm} className="mt-4 bg-green-600 text-white px-6 py-2 rounded">Confirm Photo</button>
        </div>
      )}

      {step === 6 && (
        <div className="mt-6 w-full max-w-md">
          <h2 className="font-bold mb-2">Product Metadata</h2>
          <label className="block mb-2">
            Type:
            <select value={productType} onChange={e => setProductType(e.target.value)} className="w-full mt-1 p-2 border rounded">
              <option value="Food">Food</option>
              <option value="Treat">Treat</option>
            </select>
          </label>
          <label className="block mb-4">
            Form:
            <select value={foodForm} onChange={e => setFoodForm(e.target.value)} className="w-full mt-1 p-2 border rounded">
              <option value="Kibble">Kibble</option>
              <option value="Wet">Wet</option>
              <option value="Raw">Raw</option>
            </select>
          </label>
          <button
            onClick={handleSubmit}
            className="bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 w-full"
          >
            Submit Product
          </button>
        </div>
      )}
    </div>
  );
}
