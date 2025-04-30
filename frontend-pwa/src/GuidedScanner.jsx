// Fixed GuidedScanner.jsx to show feeding guidelines table after capture
import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { uploadImageAndExtractText } from './api';
import ManualTableCropper from './ManualTableCropper';

export default function GuidedScanner() {
  const webcamRef = useRef(null);
  const [step, setStep] = useState(0);
  const [capturedImage, setCapturedImage] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [scannedValues, setScannedValues] = useState({
    brandName: '',
    productName: '',
    ingredients: '',
    feedingGuidelines: [],
    feedingGuidelinesImage: '',
    barcodeText: '',
    productImage: ''
  });
  const [productType, setProductType] = useState('Food');
  const [foodForm, setFoodForm] = useState('Kibble');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [manualCropMode, setManualCropMode] = useState(false);

  const steps = [
    'Capture Brand',
    'Capture Product Name',
    'Capture Ingredients',
    'Capture Feeding Guidelines',
    'Capture Barcode',
    'Take Product Photo',
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
    setManualCropMode(false);
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

  const handleCropComplete = async (croppedDataUrl) => {
    try {
      setScannedValues(prev => ({
        ...prev,
        feedingGuidelinesImage: croppedDataUrl,
        feedingGuidelines: []
      }));
      setManualCropMode(false);
      handleNextStep();
    } catch (err) {
      console.error("Crop complete failed:", err);
    }
  };

  const handleCapture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      alert("Failed to capture image.");
      return;
    }

    setCapturedImage(imageSrc);

    if (step === 3) {
      setLoading(true);
      try {
        const response = await uploadImageAndExtractText(imageSrc, 'feeding');
        const rows = response?.extracted_texts?.feedingGuidelines || [];
        setScannedValues(prev => ({ ...prev, feedingGuidelines: rows }));
      } catch (err) {
        console.error("OCR Error (feeding):", err);
      } finally {
        setLoading(false);
      }
    } else if (step === 5) {
      // Product photo: wait for user to confirm image
    } else {
      setLoading(true);
      try {
        const response = await uploadImageAndExtractText(imageSrc);
        const text = response?.extracted_texts?.productName || '';
        setInputValue(text);
      } catch (err) {
        console.error("OCR Error:", err);
        alert("OCR failed. Try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleConfirm = () => {
    if (step < 5) {
      const field = keys[step];
      if (step === 3) {
        handleNextStep();
        return;
      }
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

  return (
    <div className="flex flex-col items-center bg-gray-100 p-2 pt-1 min-h-screen">
      <h1 className="text-xl font-bold mb-1 text-center mt-2">{steps[step]}</h1>
      <p className="text-sm text-gray-600 mb-2">Step {step + 1} of 7</p>

      {manualCropMode ? (
        <ManualTableCropper
          imageSrc={capturedImage}
          onCropComplete={handleCropComplete}
          onCancel={() => setManualCropMode(false)}
        />
      ) : submitted ? (
        <div className="text-center">
          <p className="text-green-600 font-semibold mb-4">✅ Product submitted successfully!</p>
          <button onClick={() => window.location.reload()} className="bg-blue-600 text-white text-lg w-full px-6 py-3 rounded">Scan Another Product</button>
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
            <div className="flex flex-col gap-4 w-full mt-4">
              <button
                onClick={handleCapture}
                className="bg-blue-600 text-white text-lg font-bold py-3 rounded w-full"
              >
                {loading ? "Scanning..." : "Capture"}
              </button>
              {step < 5 && (
                <button
                  onClick={handleSkip}
                  className="bg-yellow-500 text-white text-lg font-bold py-3 rounded w-full"
                >
                  Skip
                </button>
              )}
            </div>
          )}

          {capturedImage && step === 3 && (
            <div className="w-full max-w-md mt-4 space-y-4">
              {scannedValues.feedingGuidelines.length > 0 && (
                <div className="overflow-x-auto border rounded">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-200 text-gray-700">
                      <tr>
                        <th className="px-3 py-2 border">Weight</th>
                        <th className="px-3 py-2 border">Amount</th>
                        <th className="px-3 py-2 border">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scannedValues.feedingGuidelines.map((row, idx) => (
                        <tr key={idx} className="bg-white border-t">
                          <td className="px-3 py-1 border">{row.weight}</td>
                          <td className="px-3 py-1 border">{row.amount}</td>
                          <td className="px-3 py-1 border">{row.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <button onClick={() => setManualCropMode(true)} className="bg-yellow-600 text-white py-2 px-4 rounded w-full">
                OCR unclear? Crop table manually
              </button>
              <button onClick={handleRetry} className="bg-gray-600 text-white py-2 px-4 rounded w-full">Retry</button>
              <button onClick={handleConfirm} className="bg-green-600 text-white py-2 px-4 rounded w-full">Confirm Table</button>
            </div>
          )}

          {capturedImage && step < 5 && step !== 3 && (
            <div className="w-full max-w-md mt-4">
              <label className="block mb-2 font-semibold">Detected Text (editable):</label>
              <textarea
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                rows={4}
                className="w-full p-2 border rounded"
              />
              <div className="flex flex-col gap-4 mt-4">
                <button onClick={handleRetry} className="bg-gray-600 text-white text-lg py-2 px-4 rounded w-full">Retry</button>
                <button onClick={handleConfirm} className="bg-green-600 text-white text-lg py-2 px-4 rounded w-full">Confirm</button>
              </div>
            </div>
          )}

          {capturedImage && step === 5 && (
            <div className="mt-4 w-full">
              <img src={capturedImage} alt="Captured" className="rounded-lg shadow-md max-w-full" />
              <button onClick={() => {
                setScannedValues(prev => ({ ...prev, productImage: capturedImage }));
                handleNextStep();
              }} className="mt-4 bg-green-600 text-white text-lg px-6 py-3 rounded w-full">
                Confirm Photo
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="w-full max-w-md space-y-4">
          {keys.map((key, index) => (
            <div key={index}>
              <label className="block font-semibold capitalize mb-1">{key.replace(/([A-Z])/g, ' $1')}:</label>
              <textarea
                value={typeof scannedValues[key] === 'string' ? scannedValues[key] : JSON.stringify(scannedValues[key])}
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
            <option value="Supplement">Supplement</option>
            <option value="Other">Other</option>
          </select>

          <label className="block font-semibold mt-4">Form:</label>
          <select value={foodForm} onChange={e => setFoodForm(e.target.value)} className="w-full p-2 border rounded">
            <option value="Kibble">Kibble</option>
            <option value="Wet">Wet</option>
            <option value="Raw">Raw</option>
            <option value="Other">Other</option>
          </select>

          <button
            onClick={handleSubmit}
            className="mt-6 bg-purple-600 text-white text-lg font-bold py-3 rounded hover:bg-purple-700 w-full"
          >
            Submit Product
          </button>
        </div>
      )}
    </div>
  );
}
