
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
  
  // Compare two face encodings and return a similarity score
  compareFaces(encoding1: any, encoding2: any): number {
    if (!encoding1 || !encoding2) return 0;
    
    // Basic implementation - compare box dimensions and positions
    // In a real system, you'd use proper facial embeddings comparison
    const widthDiff = Math.abs(encoding1.width - encoding2.width);
    const heightDiff = Math.abs(encoding1.height - encoding2.height);
    
    // Calculate similarity score (0-1) where 1 is perfect match
    // This is a simplistic approach - in production you'd use proper face embeddings
    const dimensionSimilarity = 1 - (widthDiff + heightDiff) / (encoding1.width + encoding1.height);
    
    return Math.max(0, dimensionSimilarity);
  }
  
  // Find the best match from a list of members
  findBestMatch(faceEncoding: any, members: any[]): { member: any, score: number } | null {
    if (!faceEncoding || !members.length) return null;
    
    let bestMatch = null;
    let highestScore = 0;
    
    members.forEach(member => {
      if (member.face_encoding) {
        const score = this.compareFaces(faceEncoding, member.face_encoding);
        if (score > highestScore) {
          highestScore = score;
          bestMatch = member;
        }
      }
    });
    
    return bestMatch ? { member: bestMatch, score: highestScore } : null;
  }
}

export const faceDetectionService = new FaceDetectionService();
export default faceDetectionService;
