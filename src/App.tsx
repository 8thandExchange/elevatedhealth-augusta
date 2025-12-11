import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CookieConsent from "@/components/CookieConsent";
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
import IVLounge from "./pages/IVLounge";
import Pricing from "./pages/Pricing";
import WhatToExpect from "./pages/WhatToExpect";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import HipaaNotice from "./pages/HipaaNotice";
import TermsOfService from "./pages/TermsOfService";
import Accessibility from "./pages/Accessibility";
import Consult from "./pages/Consult";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AdminLogin from "./pages/AdminLogin";
import PatientLogin from "./pages/PatientLogin";
import PatientDashboard from "./pages/PatientDashboard";
import PatientIntake from "./pages/PatientIntake";
import SymptomCheckIn from "./pages/SymptomCheckIn";
import ProviderDashboard from "./pages/ProviderDashboard";
import OfficeManagerDashboard from "./pages/OfficeManagerDashboard";
import BusinessDashboard from "./pages/BusinessDashboard";
import ClinicSettings from "./pages/ClinicSettings";
import SymptomChecker from "./pages/SymptomChecker";
import PaymentSuccess from "./pages/PaymentSuccess";
import KetaminePaymentSuccess from "./pages/KetaminePaymentSuccess";
import PatientResources from "./pages/PatientResources";
import ScheduleConsult from "./pages/ScheduleConsult";
import CreateAccount from "./pages/CreateAccount";
import HealthReport from "./pages/HealthReport";
import PatientServices from "./pages/PatientServices";
import ConsultationConfirmed from "./pages/ConsultationConfirmed";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        <CookieConsent />
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
          <Route path="/iv-lounge" element={<IVLounge />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/what-to-expect" element={<WhatToExpect />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/hipaa-notice" element={<HipaaNotice />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="/consult" element={<Consult />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/ketamine-payment-success" element={<KetaminePaymentSuccess />} />
          <Route path="/patient-resources" element={<PatientResources />} />
          <Route path="/schedule-consult" element={<ScheduleConsult />} />
          <Route path="/consultation-confirmed" element={<ConsultationConfirmed />} />
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
          <Route path="/patient/services" element={
            <ProtectedRoute>
              <PatientServices />
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
          <Route path="/office/dashboard" element={
            <ProtectedRoute requireAdmin>
              <OfficeManagerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/business" element={
            <ProtectedRoute requireAdmin>
              <BusinessDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;