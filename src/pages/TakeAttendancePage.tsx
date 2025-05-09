
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import FaceDetection from "@/components/FaceDetection";
import memberService, { Member } from "@/services/MemberService";

const TakeAttendancePage = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [identifying, setIdentifying] = useState(false);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
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
      toast({
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
      setRecentAttendance(data);
    } catch (error: any) {
      console.error("Failed to load recent attendance:", error);
    }
  };

  const handleFaceDetected = async (face: any) => {
    // Prevent multiple simultaneous identification attempts
    if (identifying) return;
    
    // Simple debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (!members.length) return;
      
      setIdentifying(true);
      
      try {
        // Very simple face matching based on face box position and size (for demo)
        // In a real app, you would use proper face recognition algorithms
        
        // Find closest match - this is just a demo approximation
        const detectedFace = face.box;
        let bestMatch = null;
        let smallestDiff = Infinity;
        
        for (const member of members) {
          if (!member.face_encoding) continue;
          
          const storedFace = member.face_encoding;
          
          // Compare face coordinates and dimensions
          // This is a very simplified comparison and not accurate for real face recognition
          const sizeDiff = Math.abs(detectedFace.width - storedFace.width) + 
                          Math.abs(detectedFace.height - storedFace.height);
          
          if (sizeDiff < smallestDiff) {
            smallestDiff = sizeDiff;
            bestMatch = member;
          }
        }
        
        // For demo purposes, use a threshold to simulate matching
        // In a real app, you would use proper face recognition algorithms
        const matchThreshold = 50; // Adjust this threshold as needed
        
        if (bestMatch && smallestDiff < matchThreshold) {
          // Record attendance
          const { error } = await memberService.recordAttendance(bestMatch.id as string);
          
          if (error) {
            throw new Error(error.message);
          }
          
          toast({
            title: "Attendance Recorded",
            description: `Welcome, ${bestMatch.name}!`,
          });
          
          // Update recent attendance list
          await loadRecentAttendance();
        } else {
          toast({
            title: "No Match Found",
            description: "Face not recognized. Please register first.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to process face.",
          variant: "destructive",
        });
      } finally {
        setIdentifying(false);
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
        <h1 className="text-3xl font-bold mb-6">Take Attendance</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Face Recognition</CardTitle>
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
                
                <div className="text-center text-sm text-slate-500">
                  <p>Position your face in front of the camera to check in.</p>
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
              {recentAttendance.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="h-8 w-8 text-slate-300 mb-2" />
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
                    {recentAttendance.map((record) => (
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
      </div>
    </div>
  );
};

export default TakeAttendancePage;
