
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Save, Upload, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import memberService from "@/services/MemberService";
import FaceDetection from './FaceDetection';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
});

const MemberRegistration = () => {
  const { toast } = useToast();
  const [faceDetected, setFaceDetected] = useState(false);
  const [capturedFace, setCapturedFace] = useState<any>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const handleFaceDetected = (face: any) => {
    setFaceDetected(true);
    setCapturedFace(face);
  };

  const handleCaptureFace = () => {
    if (!faceDetected || !canvasRef.current) {
      toast({
        title: "Error",
        description: "No face detected. Please ensure your face is clearly visible.",
        variant: "destructive",
      });
      return;
    }

    const canvas = canvasRef.current;
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setFaceImage(imageDataUrl);
    setIsCapturing(false);
    
    toast({
      title: "Success",
      description: "Face captured successfully!",
    });
  };

  const startCapturing = () => {
    setIsCapturing(true);
    setFaceImage(null);
    setCapturedFace(null);
    setFaceDetected(false);
  };

  const cancelCapturing = () => {
    setIsCapturing(false);
  };

  const blobFromCanvas = (canvas: HTMLCanvasElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to Blob conversion failed'));
        }
      }, 'image/jpeg', 0.95);
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!faceImage || !capturedFace) {
      toast({
        title: "Error",
        description: "Please capture a face image before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create member in database
      const { data: member, error } = await memberService.createMember({
        name: values.name,
        email: values.email || undefined,
        face_encoding: capturedFace.box,
      });

      if (error) throw new Error(error.message);
      
      // Upload face image if member was created
      if (member && member.id && canvasRef.current) {
        const blob = await blobFromCanvas(canvasRef.current);
        const file = new File([blob], `${member.id}.jpg`, { type: 'image/jpeg' });
        
        const { error: uploadError } = await memberService.uploadMemberPhoto(member.id, file);
        
        if (uploadError) {
          console.error("Error uploading photo:", uploadError);
          toast({
            title: "Warning",
            description: "Member created but photo upload failed.",
            variant: "default",
          });
        }
      }
      
      toast({
        title: "Success",
        description: "Member registered successfully!",
      });
      
      // Reset the form
      form.reset();
      setFaceImage(null);
      setCapturedFace(null);
      setFaceDetected(false);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to register member.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Register New Member</CardTitle>
        <CardDescription>
          Add a new member to the attendance system by capturing their face.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (optional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="johndoe@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      For notifications (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <FormLabel>Face Registration</FormLabel>
              
              {isCapturing ? (
                <div className="relative">
                  <FaceDetection 
                    onFaceDetected={handleFaceDetected}
                    width={640}
                    height={480}
                  />
                  
                  <div className="flex justify-center mt-4 space-x-2">
                    <Button 
                      type="button" 
                      onClick={handleCaptureFace} 
                      disabled={!faceDetected}
                      className="flex items-center"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Face
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={cancelCapturing}
                      className="flex items-center"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  {faceImage ? (
                    <div className="border rounded-md p-2 bg-slate-50">
                      <img 
                        src={faceImage} 
                        alt="Captured face" 
                        className="max-h-96 rounded" 
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center border rounded-md p-8 bg-slate-50 w-full h-64">
                      <Camera className="h-16 w-16 text-slate-300 mb-2" />
                      <p className="text-slate-500">No face captured yet</p>
                    </div>
                  )}
                  
                  <Button 
                    type="button" 
                    variant={faceImage ? "outline" : "default"} 
                    onClick={startCapturing}
                    className="flex items-center"
                  >
                    {faceImage ? (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Retake Photo
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Start Camera
                      </>
                    )}
                  </Button>
                </div>
              )}

              <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480" />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isProcessing || !faceImage}
            >
              {isProcessing ? "Processing..." : "Register Member"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MemberRegistration;
