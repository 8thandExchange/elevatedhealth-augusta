import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
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
import PeptideTherapy from "./pages/PeptideTherapy";
import WhatToExpect from "./pages/WhatToExpect";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import HipaaNotice from "./pages/HipaaNotice";
import TermsOfService from "./pages/TermsOfService";
import Consult from "./pages/Consult";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AdminLogin from "./pages/AdminLogin";
import PatientLogin from "./pages/PatientLogin";
import PatientDashboard from "./pages/PatientDashboard";
import PatientIntake from "./pages/PatientIntake";
import SymptomCheckIn from "./pages/SymptomCheckIn";
import ProviderDashboard from "./pages/ProviderDashboard";
import ClinicSettings from "./pages/ClinicSettings";
import SymptomChecker from "./pages/SymptomChecker";
import PaymentSuccess from "./pages/PaymentSuccess";
import ScheduleConsult from "./pages/ScheduleConsult";
import CreateAccount from "./pages/CreateAccount";
import HealthReport from "./pages/HealthReport";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/ketamine" element={<Ketamine />} />
          <Route path="/weightloss" element={<WeightLoss />} />
          <Route path="/hormones" element={<Hormones />} />
          <Route path="/hormones-women" element={<HormonesWomen />} />
          <Route path="/hormones-men" element={<HormonesMen />} />
          {/* Legacy Routes */}
          <Route path="/iv-ketamine" element={<IVKetamine />} />
          <Route path="/spravato" element={<Spravato />} />
          <Route path="/hormone-replacement" element={<HormoneReplacement />} />
          <Route path="/weight-loss" element={<WeightLoss />} />
          {/* Informational Routes */}
          <Route path="/military-veteran" element={<MilitaryVeteran />} />
          <Route path="/how-ketamine-works" element={<HowKetamineWorks />} />
          <Route path="/peptides" element={<PeptideTherapy />} />
          <Route path="/what-to-expect" element={<WhatToExpect />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/hipaa-notice" element={<HipaaNotice />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/consult" element={<Consult />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/schedule-consult" element={<ScheduleConsult />} />
          <Route path="/patient/create-account" element={<CreateAccount />} />
          
          {/* Protected Patient Routes */}
          <Route path="/symptom-checker" element={
            <ProtectedRoute>
              <SymptomChecker />
            </ProtectedRoute>
          } />
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/patient/dashboard" element={
            <ProtectedRoute>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/patient/intake" element={
            <ProtectedRoute>
              <PatientIntake />
            </ProtectedRoute>
          } />
          <Route path="/patient/checkin" element={
            <ProtectedRoute>
              <SymptomCheckIn />
            </ProtectedRoute>
          } />
          <Route path="/patient/health-report" element={
            <ProtectedRoute>
              <HealthReport />
            </ProtectedRoute>
          } />
          
          {/* Admin/Provider Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/provider/dashboard" element={
            <ProtectedRoute requireAdmin>
              <ProviderDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute requireAdmin>
              <ClinicSettings />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;