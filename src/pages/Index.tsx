
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, UserPlus, BookOpen, Clock } from 'lucide-react';

const Index = () => {
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
                  <span className="text-3xl font-bold">0</span>
                  <span className="text-muted-foreground ml-2">/ 0 members</span>
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
                  <span className="text-3xl font-bold">0</span>
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
                  <span className="text-3xl font-bold">0%</span>
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
                  <span className="text-lg font-medium">No check-ins yet</span>
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
                <Button className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" /> Start Attendance
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
                <Button className="w-full" variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" /> Manage Members
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
                <Button className="w-full" variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" /> View Reports
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Activity</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="flex flex-col py-4">
                <p className="text-center text-muted-foreground py-8">
                  No recent activity. Start taking attendance to see records here.
                </p>
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
