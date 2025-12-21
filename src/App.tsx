import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import SecurePatientRoute from "@/components/auth/SecurePatientRoute";
import CookieConsent from "@/components/CookieConsent";
import FloatingFinancingBanner from "@/components/FloatingFinancingBanner";
import { ServiceWorkerUpdater } from "@/components/ServiceWorkerUpdater";
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
import HairRestoration from "./pages/HairRestoration";
import SexualWellness from "./pages/SexualWellness";
import IVLounge from "./pages/IVLounge";
import Pricing from "./pages/Pricing";
import PricingComparison from "./pages/PricingComparison";
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
import MentalWellnessPage from "./pages/MentalWellnessPage";
import HormoneJourneyPage from "./pages/HormoneJourneyPage";
import IVPaymentSuccess from "./pages/IVPaymentSuccess";
import Affordability from "./pages/Affordability";
import AlaCartePaymentSuccess from "./pages/AlaCartePaymentSuccess";
import ProviderLayout from "./components/provider/ProviderLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ServiceWorkerUpdater />
      <BrowserRouter>
        <ScrollToTop />
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        <CookieConsent />
        <FloatingFinancingBanner />
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
          <Route path="/hair-restoration" element={<HairRestoration />} />
          <Route path="/sexual-wellness" element={<SexualWellness />} />
          <Route path="/iv-lounge" element={<IVLounge />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/pricing-comparison" element={<PricingComparison />} />
          <Route path="/affordability" element={<Affordability />} />
          <Route path="/what-to-expect" element={<WhatToExpect />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/hipaa-notice" element={<HipaaNotice />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="/consult" element={
            <SecurePatientRoute>
              <Consult />
            </SecurePatientRoute>
          } />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/ketamine-payment-success" element={<KetaminePaymentSuccess />} />
          <Route path="/patient-resources" element={<PatientResources />} />
          <Route path="/schedule-consult" element={<ScheduleConsult />} />
          <Route path="/consultation-confirmed" element={<ConsultationConfirmed />} />
          <Route path="/iv-payment-success" element={<IVPaymentSuccess />} />
          <Route path="/alacarte-success" element={<AlaCartePaymentSuccess />} />
          <Route path="/patient/create-account" element={<CreateAccount />} />
          
          {/* Protected Patient Routes */}
          <Route path="/symptom-checker" element={
            <SecurePatientRoute>
              <SymptomChecker />
            </SecurePatientRoute>
          } />
          <Route path="/patient/login" element={<PatientLogin />} />
          {/* Patient Dashboard = Services Hub (main entry point) */}
          <Route path="/patient/dashboard" element={
            <SecurePatientRoute>
              <PatientServices />
            </SecurePatientRoute>
          } />
          {/* Legacy route redirect */}
          <Route path="/patient/services" element={
            <SecurePatientRoute>
              <PatientServices />
            </SecurePatientRoute>
          } />
          {/* Service-specific journey pages */}
          <Route path="/patient/mental-wellness" element={
            <SecurePatientRoute>
              <MentalWellnessPage />
            </SecurePatientRoute>
          } />
          <Route path="/patient/hormone-journey" element={
            <SecurePatientRoute>
              <HormoneJourneyPage />
            </SecurePatientRoute>
          } />
          <Route path="/patient/intake" element={
            <SecurePatientRoute>
              <PatientIntake />
            </SecurePatientRoute>
          } />
          <Route path="/patient/checkin" element={
            <SecurePatientRoute>
              <SymptomCheckIn />
            </SecurePatientRoute>
          } />
          <Route path="/patient/health-report" element={
            <SecurePatientRoute>
              <HealthReport />
            </SecurePatientRoute>
          } />
          
          {/* Admin/Provider Routes - Wrapped with ProviderLayout */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/provider/dashboard" element={
            <ProviderLayout title="Provider Dashboard" subtitle="Clinical Operations" showNavbar={false}>
              <ProviderDashboard />
            </ProviderLayout>
          } />
          <Route path="/admin/settings" element={
            <ProviderLayout title="Clinic Settings" subtitle="Configuration" showNavbar={false}>
              <ClinicSettings />
            </ProviderLayout>
          } />
          <Route path="/office/dashboard" element={
            <ProviderLayout title="Office Manager" subtitle="Patient Overview" showNavbar={false}>
              <OfficeManagerDashboard />
            </ProviderLayout>
          } />
          <Route path="/admin/business" element={
            <ProviderLayout title="Business Dashboard" subtitle="Revenue & Operations" showNavbar={false}>
              <BusinessDashboard />
            </ProviderLayout>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;