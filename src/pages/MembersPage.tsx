
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, UserPlus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import memberService, { Member } from "@/services/MemberService";
import MemberRegistration from '@/components/MemberRegistration';
import FaceRecognitionNav from '@/components/FaceRecognitionNav';

const MembersPage = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  useEffect(() => {
    loadMembers();
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

  const handleAddNewClick = () => {
    setShowRegistrationForm(true);
  };

  const handleBackToListClick = () => {
    setShowRegistrationForm(false);
    loadMembers(); // Refresh the list
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
      <FaceRecognitionNav />
      
      <div className="container mx-auto px-4 py-8">
        {showRegistrationForm ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Add New Member</h1>
              <Button variant="outline" onClick={handleBackToListClick}>
                Back to Members
              </Button>
            </div>
            <MemberRegistration />
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Members</h1>
              <Button onClick={handleAddNewClick}>
                <UserPlus className="h-4 w-4 mr-2" /> Add New Member
              </Button>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Member List</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <p>Loading members...</p>
                  </div>
                ) : members.length === 0 ? (
                  <div className="flex flex-col items-center py-8">
                    <p className="text-slate-500 mb-4">No members registered yet</p>
                    <Button onClick={handleAddNewClick}>
                      <UserPlus className="h-4 w-4 mr-2" /> Register First Member
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Face Data</TableHead>
                        <TableHead>Registered On</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.name}</TableCell>
                          <TableCell>{member.email || '-'}</TableCell>
                          <TableCell>
                            {member.face_encoding ? 
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Registered
                              </span> : 
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                Not registered
                              </span>
                            }
                          </TableCell>
                          <TableCell>{member.created_at ? formatDate(member.created_at) : '-'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 ${member.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'} rounded-full text-xs font-medium`}>
                              {member.status || 'active'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default MembersPage;
