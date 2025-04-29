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
    feedingGuidelines: [],
    barcodeText: '',
    productImage: ''
  });
  const [productType, setProductType] = useState('Food');
  const [foodForm, setFoodForm] = useState('Kibble');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
    setStep(prev => prev + 1);
  };

  const handleRetry = () => {
    setCapturedImage(null);
    setInputValue('');
  };

  const handleSkip = () => {
    if (step < 5) {
      const field = keys[step];
      setScannedValues(prev => ({ ...prev, [field]: step === 3 ? [] : '' }));
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
        if (step === 3) {
          const lines = text.split('\n');
          const structured = lines.map(line => {
            const [weight, amount, ...notes] = line.split(/\s+/);
            return {
              weight: weight || '',
              amount: amount || '',
              notes: notes.join(' ') || ''
            };
          });
          setScannedValues(prev => ({ ...prev, feedingGuidelines: structured }));
          handleNextStep();
        } else {
          setInputValue(text);
        }
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
      feedingGuidelines: [],
      barcodeText: '',
      productImage: ''
    });
    setProductType('Food');
    setFoodForm('Kibble');
    setStep(0);
    setSubmitted(false);
  };

  const updateFeedingCell = (index, field, value) => {
    const updated = [...scannedValues.feedingGuidelines];
    updated[index][field] = value;
    setScannedValues(prev => ({ ...prev, feedingGuidelines: updated }));
  };

  const addFeedingRow = () => {
    setScannedValues(prev => ({
      ...prev,
      feedingGuidelines: [...prev.feedingGuidelines, { weight: '', amount: '', notes: '' }]
    }));
  };

  const removeFeedingRow = index => {
    const updated = scannedValues.feedingGuidelines.filter((_, i) => i !== index);
    setScannedValues(prev => ({ ...prev, feedingGuidelines: updated }));
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 p-2 pt-1">
      <h1 className="text-xl font-bold mb-1 text-center mt-2">{steps[step]}</h1>
      <p className="text-sm text-gray-600 mb-2">Step {step + 1} of 7</p>

      {submitted ? (
        <div className="text-center">
          <p className="text-green-600 font-semibold mb-4">✅ Product submitted successfully!</p>
          <button onClick={handleReset} className="bg-blue-600 text-white text-lg w-full px-6 py-3 rounded">Scan Another Product</button>
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
                <button onClick={handleRetry} className="bg-gray-500 text-white text-lg px-6 py-3 rounded w-full">Retry</button>
                <button onClick={handleConfirm} className="bg-green-600 text-white text-lg px-6 py-3 rounded w-full">Confirm</button>
              </div>
            </div>
          )}

          {step === 5 && capturedImage && (
            <div className="mt-4 w-full">
              <img src={capturedImage} alt="Captured" className="rounded-lg shadow-md max-w-full" />
              <button onClick={handleNextStep} className="mt-4 bg-green-600 text-white text-lg px-6 py-3 rounded w-full">Confirm Photo</button>
            </div>
          )}
        </>
      ) : (
        <div className="w-full max-w-md space-y-4">
          {keys.slice(0, 3).concat(keys.slice(4)).map((key, index) => (
            <div key={index}>
              <label className="block font-semibold capitalize mb-1">{key.replace(/([A-Z])/g, ' $1')}:</label>
              <textarea
                value={scannedValues[key]}
                onChange={e => setScannedValues(prev => ({ ...prev, [key]: e.target.value }))}
                rows={2}
                className="w-full p-2 border rounded"
              />
            </div>
          ))}

          <div>
            <label className="block font-semibold mb-1">Feeding Guidelines (editable table):</label>
            <table className="w-full text-sm border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-2 py-1">Weight</th>
                  <th className="border px-2 py-1">Amount</th>
                  <th className="border px-2 py-1">Notes</th>
                  <th className="border px-2 py-1">Remove</th>
                </tr>
              </thead>
              <tbody>
                {scannedValues.feedingGuidelines.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">
                      <input value={row.weight} onChange={e => updateFeedingCell(idx, 'weight', e.target.value)} className="w-full p-1 border rounded" />
                    </td>
                    <td className="border px-2 py-1">
                      <input value={row.amount} onChange={e => updateFeedingCell(idx, 'amount', e.target.value)} className="w-full p-1 border rounded" />
                    </td>
                    <td className="border px-2 py-1">
                      <input value={row.notes} onChange={e => updateFeedingCell(idx, 'notes', e.target.value)} className="w-full p-1 border rounded" />
                    </td>
                    <td className="border px-2 py-1 text-center">
                      <button onClick={() => removeFeedingRow(idx)} className="text-red-600 font-bold">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={addFeedingRow} className="mt-2 text-blue-600 font-semibold underline">+ Add Row</button>
          </div>

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
