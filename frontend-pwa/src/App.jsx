import React from 'react';
import CameraScanner from './CameraScanner';

export default function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <CameraScanner />
    </div>
  );
}
