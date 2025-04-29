// Updated GuidedScanner.jsx
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

  const handleCapture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setCapturedImage(imageSrc);

    if (step === 3) {
      setLoading(true);
      try {
        const response = await uploadImageAndExtractText(imageSrc, 'feeding');
        const rows = response.extracted_texts.feedingGuidelines || [];
        setScannedValues(prev => ({ ...prev, feedingGuidelines: rows }));
        setLoading(false);
        handleNextStep();
      } catch (err) {
        console.error("OCR Error:", err);
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const response = await uploadImageAndExtractText(imageSrc);
        const text = response.extracted_texts.productName || '';
        setInputValue(text);
      } catch (err) {
        console.error("OCR Error:", err);
      }
      setLoading(false);
    }
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

      {step === 6 && (
        <div className="w-full max-w-md overflow-x-auto">
          <label className="block font-semibold mb-1">Feeding Guidelines (table):</label>
          <table className="min-w-full text-sm border border-gray-300">
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
      )}
    </div>
  );
}
