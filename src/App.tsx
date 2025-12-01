import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Ketamine from "./pages/Ketamine";
import WeightLoss from "./pages/WeightLoss";
import Hormones from "./pages/Hormones";
import HormonesWomen from "./pages/HormonesWomen";
import HormonesMen from "./pages/HormonesMen";
import IVKetamine from "./pages/IVKetamine";
import Spravato from "./pages/Spravato";
import HormoneReplacement from "./pages/HormoneReplacement";
import MilitaryVeteran from "./pages/MilitaryVeteran";
import HowKetamineWorks from "./pages/HowKetamineWorks";
import WhatToExpect from "./pages/WhatToExpect";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import HipaaNotice from "./pages/HipaaNotice";
import TermsOfService from "./pages/TermsOfService";
import Consult from "./pages/Consult";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import PatientLogin from "./pages/PatientLogin";
import PatientDashboard from "./pages/PatientDashboard";
import SymptomCheckIn from "./pages/SymptomCheckIn";
import ProviderDashboard from "./pages/ProviderDashboard";
import SymptomChecker from "./pages/SymptomChecker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          {/* New Pillar Routes */}
          <Route path="/ketamine" element={<Ketamine />} />
          <Route path="/weightloss" element={<WeightLoss />} />
          <Route path="/hormones" element={<Hormones />} />
          <Route path="/hormones-women" element={<HormonesWomen />} />
          <Route path="/hormones-men" element={<HormonesMen />} />
          {/* Legacy Routes - Redirect to new pages */}
          <Route path="/iv-ketamine" element={<IVKetamine />} />
          <Route path="/spravato" element={<Spravato />} />
          <Route path="/hormone-replacement" element={<HormoneReplacement />} />
          <Route path="/weight-loss" element={<WeightLoss />} />
          {/* Other Routes */}
          <Route path="/symptom-checker" element={<SymptomChecker />} />
          <Route path="/military-veteran" element={<MilitaryVeteran />} />
          <Route path="/how-ketamine-works" element={<HowKetamineWorks />} />
          <Route path="/what-to-expect" element={<WhatToExpect />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/hipaa-notice" element={<HipaaNotice />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/consult" element={<Consult />} />
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* Patient Portal Routes */}
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/check-in" element={<SymptomCheckIn />} />
          {/* Provider Routes */}
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
