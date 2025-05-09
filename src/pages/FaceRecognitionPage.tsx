
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, User, RefreshCw, Camera } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import FaceDetection from "@/components/FaceDetection";
import memberService, { Member } from "@/services/MemberService";
import faceDetectionService from '@/services/FaceDetectionService';

const FaceRecognitionPage = () => {
  const { toast: uiToast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [recognizing, setRecognizing] = useState(false);
  const [recentRecognitions, setRecentRecognitions] = useState<any[]>([]);
  const [recognizedMember, setRecognizedMember] = useState<Member | null>(null);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadMembers();
    loadRecentAttendance();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await memberService.getAllMembers();
      if (error) throw new Error(error.message);
      setMembers(data);
    } catch (error: any) {
      uiToast({
        title: "Error",
        description: error.message || "Failed to load members.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentAttendance = async () => {
    try {
      const { data, error } = await memberService.getRecentAttendance(10);
      if (error) throw new Error(error.message);
      setRecentRecognitions(data);
    } catch (error: any) {
      console.error("Failed to load recent attendance:", error);
    }
  };

  const handleFaceDetected = async (face: any) => {
    // Prevent multiple simultaneous recognition attempts
    if (recognizing) return;
    
    // Simple debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (!members.length) return;
      
      setRecognizing(true);
      
      try {
        // Use the enhanced face recognition service
        const detectedFace = face.box;
        const bestMatch = faceDetectionService.findBestMatch(detectedFace, members);
        
        // Threshold for considering a match valid
        const matchThreshold = 0.7;
        
        if (bestMatch && bestMatch.score > matchThreshold) {
          const { member } = bestMatch;
          
          // Record attendance
          const { error } = await memberService.recordAttendance(member.id as string);
          
          if (error) {
            throw new Error(error.message);
          }
          
          // Update UI with recognized member
          setRecognizedMember(member);
          setMatchScore(bestMatch.score);
          
          // Show toast notification
          toast(`Welcome, ${member.name}!`, {
            description: "Attendance recorded successfully",
            action: {
              label: "View details",
              onClick: () => console.log("Viewed details"),
            },
          });
          
          // Update recent attendance list
          await loadRecentAttendance();
          
          // Reset after a few seconds
          setTimeout(() => {
            setRecognizedMember(null);
            setMatchScore(null);
          }, 5000);
        } else {
          toast("Face not recognized", {
            description: "Please register first or try again",
            duration: 3000,
          });
        }
      } catch (error: any) {
        uiToast({
          title: "Error",
          description: error.message || "Failed to process face.",
          variant: "destructive",
        });
      } finally {
        setRecognizing(false);
      }
    }, 1000);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
        <h1 className="text-3xl font-bold mb-6">Face Recognition</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recognition Camera</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-slate-100 rounded-lg p-2">
                  <FaceDetection 
                    onFaceDetected={handleFaceDetected}
                    width={640}
                    height={480}
                  />
                </div>
                
                {recognizedMember && (
                  <div className="mt-4 p-4 border rounded-md bg-green-50 border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-green-800">{recognizedMember.name}</h3>
                        <p className="text-sm text-green-600">
                          Match confidence: {Math.round((matchScore || 0) * 100)}%
                        </p>
                      </div>
                      <User className="h-10 w-10 text-green-500" />
                    </div>
                  </div>
                )}
                
                <div className="text-center text-sm text-slate-500">
                  <p>Position your face in front of the camera to be recognized.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Recent Check-ins</CardTitle>
              <Button variant="ghost" size="sm" onClick={loadRecentAttendance}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentRecognitions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <User className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-slate-500">No check-ins recorded yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentRecognitions.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.member?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>{formatTime(record.check_in_time)}</TableCell>
                        <TableCell>{formatDate(record.check_in_time)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recognition Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-md bg-blue-50">
                  <p className="text-sm text-blue-600">Total Members</p>
                  <p className="text-2xl font-bold">{members.length}</p>
                </div>
                <div className="p-4 border rounded-md bg-green-50">
                  <p className="text-sm text-green-600">Today's Attendance</p>
                  <p className="text-2xl font-bold">{recentRecognitions.filter(r => 
                    new Date(r.check_in_time).toDateString() === new Date().toDateString()
                  ).length}</p>
                </div>
                <div className="p-4 border rounded-md bg-purple-50">
                  <p className="text-sm text-purple-600">Recognition Rate</p>
                  <p className="text-2xl font-bold">
                    {members.length > 0 ? 
                      `${Math.round((members.filter(m => m.face_encoding).length / members.length) * 100)}%` : 
                      '0%'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FaceRecognitionPage;
