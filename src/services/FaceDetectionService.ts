
import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';

class FaceDetectionService {
  private model: faceDetection.FaceDetector | null = null;
  
  async initialize() {
    // Make sure TensorFlow.js is ready
    await tf.ready();
    
    // Set backend to WebGL for better performance
    await tf.setBackend('webgl');
    
    // Load the BlazeFace model which is more reliable
    const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
    const detectorConfig = {
      runtime: 'tfjs' as const,
      modelType: 'short' as const,
    };
    
    this.model = await faceDetection.createDetector(model, detectorConfig);
    console.log('Face detection model loaded successfully');
    return this.model;
  }
  
  async detectFaces(image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement) {
    if (!this.model) {
      throw new Error('Face detection model not initialized');
    }
    
    return await this.model.estimateFaces(image);
  }
}

export const faceDetectionService = new FaceDetectionService();
export default faceDetectionService;
