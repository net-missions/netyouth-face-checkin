
import React from 'react';
import FaceDetection from '@/components/FaceDetection';

const FaceDetectionTest = () => {
  const handleFaceDetected = (face: any) => {
    console.log('Face detected:', face);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Netyouth Attendance - Face Detection Test</h1>
      <FaceDetection 
        onFaceDetected={handleFaceDetected}
        width={640}
        height={480}
      />
    </div>
  );
};

export default FaceDetectionTest;
