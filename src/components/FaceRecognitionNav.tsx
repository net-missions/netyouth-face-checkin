
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Camera, User, ArrowLeft } from 'lucide-react';

const FaceRecognitionNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <header className="bg-slate-900 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-white">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <nav className="flex space-x-2">
            <Link to="/members">
              <Button 
                variant={currentPath === '/members' ? "default" : "ghost"} 
                size="sm" 
                className={currentPath === '/members' ? "bg-white text-slate-900" : "text-white"}
              >
                <User className="h-4 w-4 mr-2" /> Members
              </Button>
            </Link>
            
            <Link to="/face-recognition">
              <Button 
                variant={currentPath === '/face-recognition' ? "default" : "ghost"} 
                size="sm" 
                className={currentPath === '/face-recognition' ? "bg-white text-slate-900" : "text-white"}
              >
                <Camera className="h-4 w-4 mr-2" /> Recognition
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default FaceRecognitionNav;
