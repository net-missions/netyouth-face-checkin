
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, UserPlus, BookOpen, Clock } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import memberService from '@/services/MemberService';

const Index = () => {
  const { toast } = useToast();
  const [memberCount, setMemberCount] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState(0);
  const [averageAttendance, setAverageAttendance] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load members count
      const { data: members, error: membersError } = await memberService.getAllMembers();
      if (membersError) throw new Error(membersError.message);
      setMemberCount(members.length);

      // Load today's attendance
      const { data: todayCount, error: todayError } = await memberService.getDailyAttendanceCount();
      if (todayError) throw new Error(todayError.message);
      setTodayAttendance(todayCount);

      // Load recent check-ins
      const { data: recent, error: recentError } = await memberService.getRecentAttendance(1);
      if (recentError) throw new Error(recentError.message);
      setLastCheckIn(recent.length > 0 ? recent[0] : null);

      // Calculate average attendance (simple calculation for demo)
      if (members.length > 0) {
        setAverageAttendance(Math.round((todayCount / members.length) * 100));
      }
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatLastCheckIn = (checkIn: any) => {
    if (!checkIn || !checkIn.check_in_time) return 'No check-ins yet';
    
    const date = new Date(checkIn.check_in_time);
    return `${checkIn.member?.name} at ${date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    })}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Netyouth Attendance</h1>
              <p className="text-slate-300">Face Recognition Attendance System</p>
            </div>
            <div className="mt-4 md:mt-0 space-x-2">
              <Button variant="outline" asChild>
                <Link to="/face-detection">Test Face Detection</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stats Cards */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today's Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                  <span className="text-3xl font-bold">{loading ? '...' : todayAttendance}</span>
                  <span className="text-muted-foreground ml-2">/ {loading ? '...' : memberCount} members</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <UserPlus className="h-6 w-6 text-blue-500 mr-2" />
                  <span className="text-3xl font-bold">{loading ? '...' : memberCount}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BookOpen className="h-6 w-6 text-purple-500 mr-2" />
                  <span className="text-3xl font-bold">{loading ? '...' : `${averageAttendance}%`}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Last Check-in
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-amber-500 mr-2" />
                  <span className="text-lg font-medium">
                    {loading ? '...' : formatLastCheckIn(lastCheckIn)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Quick Access</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Take Attendance</CardTitle>
                <CardDescription>
                  Record member attendance using face recognition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Use the camera to automatically identify and check-in members as they arrive.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link to="/attendance">
                    <CheckCircle className="h-4 w-4 mr-2" /> Start Attendance
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Members</CardTitle>
                <CardDescription>
                  Add, edit or remove members from the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Update member details and their face recognition data.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/members">
                    <UserPlus className="h-4 w-4 mr-2" /> Manage Members
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>View Reports</CardTitle>
                <CardDescription>
                  Access attendance reports and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generate detailed reports for attendance tracking over time.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline" disabled>
                  <BookOpen className="h-4 w-4 mr-2" /> View Reports
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Activity</h2>
            <Button variant="ghost" size="sm" onClick={loadDashboardData}>Refresh</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="flex flex-col py-4">
                {lastCheckIn ? (
                  <div className="px-6 py-4">
                    <p className="text-slate-600">
                      <span className="font-medium">{lastCheckIn.member?.name}</span> checked in at{' '}
                      {new Date(lastCheckIn.check_in_time).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true
                      })}
                      {' '}on{' '}
                      {new Date(lastCheckIn.check_in_time).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No recent activity. Start taking attendance to see records here.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-slate-600">&copy; 2025 Netyouth Attendance. All rights reserved.</p>
            <div className="mt-2 md:mt-0">
              <p className="text-sm text-slate-600">Powered by Face Recognition Technology</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
