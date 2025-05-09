
import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import faceDetectionService from '@/services/FaceDetectionService';

interface FaceDetectionProps {
  onFaceDetected?: (face: any) => void;
  width?: number;
  height?: number;
}

const FaceDetection = ({ onFaceDetected, width = 640, height = 480 }: FaceDetectionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionMessage, setDetectionMessage] = useState("Initialize face detection");
  
  // Initialize the face detection model
  const initFaceDetection = async () => {
    try {
      setDetectionMessage("Loading face detection model...");
      await faceDetectionService.initialize();
      setIsInitialized(true);
      setDetectionMessage("Model loaded. Start camera to begin detection.");
    } catch (error) {
      console.error('Failed to initialize face detection:', error);
      setDetectionMessage("Failed to initialize face detection. Please try again.");
    }
  };
  
  // Start the camera stream
  const startCamera = async () => {
    if (!isInitialized) {
      await initFaceDetection();
    }
    
    if (videoRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width, height, facingMode: "user" }
        });
        videoRef.current.srcObject = stream;
        setDetectionMessage("Camera started. Face detection active.");
        setIsDetecting(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setDetectionMessage("Error accessing camera. Please check permissions.");
      }
    }
  };
  
  // Stop the camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsDetecting(false);
      setDetectionMessage("Face detection stopped. Click 'Start Camera' to begin again.");
    }
  };
  
  // Detect faces in the video stream
  const detectFaces = async () => {
    if (!isDetecting || !videoRef.current || !canvasRef.current) return;
    
    try {
      const faces = await faceDetectionService.detectFaces(videoRef.current);
      
      // Draw the results on canvas
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        
        // Draw video frame first
        ctx.drawImage(videoRef.current, 0, 0, width, height);
        
        // Draw boxes around faces
        faces.forEach(face => {
          const box = face.box;
          ctx.strokeStyle = '#00FF00';
          ctx.lineWidth = 2;
          ctx.strokeRect(box.xMin, box.yMin, box.width, box.height);
          
          // Call the callback if provided
          if (onFaceDetected) {
            onFaceDetected(face);
          }
        });
        
        if (faces.length > 0) {
          setDetectionMessage(`Detected ${faces.length} face(s)`);
        } else {
          setDetectionMessage("No faces detected. Please position yourself in front of the camera.");
        }
      }
    } catch (error) {
      console.error('Face detection error:', error);
    }
    
    // Continue detection in the next frame
    requestAnimationFrame(detectFaces);
  };
  
  // Effect to run detection when active
  useEffect(() => {
    let animationId: number;
    
    if (isDetecting) {
      animationId = requestAnimationFrame(detectFaces);
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      // Cleanup camera on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isDetecting]);
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video 
              ref={videoRef}
              width={width} 
              height={height} 
              autoPlay 
              playsInline 
              muted 
              className="mx-auto"
              style={{ display: isDetecting ? 'block' : 'none' }}
            />
            <canvas 
              ref={canvasRef}
              width={width} 
              height={height} 
              className="absolute top-0 left-0"
            />
            {!isDetecting && (
              <div className="flex items-center justify-center bg-slate-800 w-full" style={{ height }}>
                <p className="text-white">{detectionMessage}</p>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2 justify-center">
            {!isInitialized && (
              <Button onClick={initFaceDetection}>Initialize Face Detection</Button>
            )}
            {isInitialized && !isDetecting && (
              <Button onClick={startCamera}>Start Camera</Button>
            )}
            {isDetecting && (
              <Button onClick={stopCamera} variant="destructive">Stop Camera</Button>
            )}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">{detectionMessage}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FaceDetection;
