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
  const [submitted, setSubmitted] = useState(false);

  const steps = [
    'Scan the brand name',
    'Scan the product name',
    'Scan the ingredients list',
    'Scan the feeding guidelines',
    'Scan the barcode text',
    'Take a picture of the product',
    'Review and Submit'
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

  const handleSkip = () => {
    if (step < 5) {
      const field = keys[step];
      setScannedValues(prev => ({ ...prev, [field]: '' }));
    }
    handleNextStep();
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
    } else if (step === 5) {
      setScannedValues(prev => ({ ...prev, productImage: imageSrc }));
      handleNextStep();
    }
  };

  const handleConfirm = () => {
    if (step < 5) {
      const field = keys[step];
      setScannedValues(prev => ({ ...prev, [field]: inputValue }));
      handleNextStep();
    }
  };

  const handleSubmit = async () => {
    const data = {
      ...scannedValues,
      productType,
      foodForm
    };

    try {
      const res = await fetch('https://dog-food-scanner.onrender.com/add-product/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      console.log("✅ Product submitted:", json);
      setSubmitted(true);
    } catch (err) {
      console.error("Submit Error:", err);
    }
  };

  const handleReset = () => {
    setScannedValues({
      brandName: '',
      productName: '',
      ingredients: '',
      feedingGuidelines: '',
      barcodeText: '',
      productImage: ''
    });
    setProductType('Food');
    setFoodForm('Kibble');
    setStep(0);
    setSubmitted(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">{steps[step]}</h1>

      {submitted ? (
        <div className="text-center">
          <p className="text-green-600 font-semibold mb-4">✅ Product submitted successfully!</p>
          <button onClick={handleReset} className="bg-blue-600 text-white px-4 py-2 rounded">Scan Another Product</button>
        </div>
      ) : step < 6 ? (
        <>
          {!capturedImage && (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="rounded-lg shadow-md"
              style={{ maxHeight: '50vh', width: '100%', objectFit: 'cover' }}
            />
          )}

          {!capturedImage && (
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleCapture}
                className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700"
              >
                {loading ? "Scanning..." : "Capture"}
              </button>
              {step < 5 && (
                <button
                  onClick={handleSkip}
                  className="bg-yellow-500 text-white font-bold py-2 px-6 rounded hover:bg-yellow-600"
                >
                  Skip
                </button>
              )}
            </div>
          )}

          {capturedImage && step < 5 && (
            <div className="w-full max-w-md mt-4">
              <label className="block mb-2 font-semibold">Detected Text (editable):</label>
              <textarea
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                rows={4}
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
              <img src={capturedImage} alt="Captured" className="rounded-lg shadow-md max-w-full" />
              <button onClick={handleNextStep} className="mt-4 bg-green-600 text-white px-6 py-2 rounded">Confirm Photo</button>
            </div>
          )}
        </>
      ) : (
        <div className="w-full max-w-md space-y-4">
          {keys.map((key, index) => (
            <div key={index}>
              <label className="block font-semibold capitalize mb-1">{key.replace(/([A-Z])/g, ' $1')}:</label>
              <textarea
                value={scannedValues[key]}
                onChange={e => setScannedValues(prev => ({ ...prev, [key]: e.target.value }))}
                rows={key === 'feedingGuidelines' ? 6 : 2}
                className="w-full p-2 border rounded"
              />
            </div>
          ))}

          <label className="block font-semibold mt-4">Type:</label>
          <select value={productType} onChange={e => setProductType(e.target.value)} className="w-full p-2 border rounded">
            <option value="Food">Food</option>
            <option value="Treat">Treat</option>
          </select>

          <label className="block font-semibold mt-4">Form:</label>
          <select value={foodForm} onChange={e => setFoodForm(e.target.value)} className="w-full p-2 border rounded">
            <option value="Kibble">Kibble</option>
            <option value="Wet">Wet</option>
            <option value="Raw">Raw</option>
          </select>

          <button
            onClick={handleSubmit}
            className="mt-6 bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 w-full"
          >
            Submit Product
          </button>
        </div>
      )}
    </div>
  );
}
