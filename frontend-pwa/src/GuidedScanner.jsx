import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { uploadImageAndExtractText } from './api';

export default function GuidedScanner() {
  const webcamRef = useRef(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const [brandName, setBrandName] = useState("");
  const [productName, setProductName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [feedingGuidelines, setFeedingGuidelines] = useState("");
  const [barcodeText, setBarcodeText] = useState("");
  const [productImage, setProductImage] = useState("");

  const [productType, setProductType] = useState("Food");
  const [foodForm, setFoodForm] = useState("Kibble");

  const videoConstraints = {
    facingMode: { ideal: "environment" }
  };

  const handleCapture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setCapturedImage(imageSrc);

    if (step < 6) {
      setLoading(true);
      try {
        const response = await uploadImageAndExtractText(imageSrc);
        const text = response.extracted_texts.productName;
        switch (step) {
          case 1:
            setBrandName(text);
            break;
          case 2:
            setProductName(text);
            break;
          case 3:
            setIngredients(text);
            break;
          case 4:
            setFeedingGuidelines(text);
            break;
          case 5:
            setBarcodeText(text);
            break;
          default:
            break;
        }
      } catch (err) {
        console.error("OCR Error:", err);
      }
      setLoading(false);
    } else {
      // Step 6: Take final photo, no OCR
      setProductImage(imageSrc);
    }
  };

  const handleConfirm = () => {
    setCapturedImage(null);
    if (step < 6) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    const data = {
      brandName,
      productName,
      ingredients,
      feedingGuidelines,
      barcodeText,
      productType,
      foodForm,
      productImage
      // userEmail, userName will be added later
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

  const stepLabels = [
    "Scan Brand",
    "Scan Product Name",
    "Scan Ingredients",
    "Scan Feeding Guidelines",
    "Scan Barcode",
    "Take Product Photo"
  ];

  const stepValues = [
    brandName,
    productName,
    ingredients,
    feedingGuidelines,
    barcodeText
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">{stepLabels[step - 1]}</h1>

      {!capturedImage ? (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="rounded-lg shadow-md"
        />
      ) : (
        <img src={capturedImage} alt="Captured" className="rounded-lg shadow-md max-w-md" />
      )}

      <div className="flex gap-4 mt-4">
        {!capturedImage && (
          <button
            onClick={handleCapture}
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
          >
            {loading ? "Scanning..." : "Capture"}
          </button>
        )}

        {capturedImage && step < 6 && (
          <button
            onClick={handleConfirm}
            className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700"
          >
            Confirm
          </button>
        )}
      </div>

      {step < 6 && capturedImage && (
        <div className="mt-4 bg-white p-4 rounded shadow max-w-md">
          <p className="font-semibold">Detected:</p>
          <p>{stepValues[step - 1]}</p>
        </div>
      )}

      {step === 6 && capturedImage && (
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
