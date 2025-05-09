
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FaceDetectionTest from "./pages/FaceDetectionTest";
import MembersPage from "./pages/MembersPage";
import TakeAttendancePage from "./pages/TakeAttendancePage";
import FaceRecognitionPage from "./pages/FaceRecognitionPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/face-detection" element={<FaceDetectionTest />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/attendance" element={<TakeAttendancePage />} />
          <Route path="/face-recognition" element={<FaceRecognitionPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
