
import React from 'react';
import { Link } from 'react-router-dom';
import FaceDetection from '@/components/FaceDetection';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const FaceDetectionTest = () => {
  const handleFaceDetected = (face: any) => {
    console.log('Face detected:', face);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-white">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Face Detection Test</h1>
        <p className="mb-6 text-slate-600">
          This page allows you to test the face detection capabilities of the system. 
          Position your face in front of the camera to see if the system can detect it.
        </p>
        
        <FaceDetection 
          onFaceDetected={handleFaceDetected}
          width={640}
          height={480}
        />
        
        <div className="mt-8">
          <p className="text-sm text-slate-500">
            Note: This is just a test page to verify that face detection is working properly. 
            The actual attendance system will include identification of registered members.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FaceDetectionTest;
