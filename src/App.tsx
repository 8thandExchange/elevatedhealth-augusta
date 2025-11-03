import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import IVKetamine from "./pages/IVKetamine";
import MilitaryVeteran from "./pages/MilitaryVeteran";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import HipaaNotice from "./pages/HipaaNotice";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/iv-ketamine" element={<IVKetamine />} />
          <Route path="/military-veteran" element={<MilitaryVeteran />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/hipaa-notice" element={<HipaaNotice />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
