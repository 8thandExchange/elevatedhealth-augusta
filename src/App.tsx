import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { BookingProvider } from "@/contexts/BookingContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ConsultationModal from "@/components/ConsultationModal";
import { useBooking } from "@/contexts/BookingContext";
import SecurePatientRoute from "@/components/auth/SecurePatientRoute";
import CookieConsent from "@/components/CookieConsent";
import MarketingPixel from "@/components/MarketingPixel";
import FloatingFinancingBanner from "@/components/FloatingFinancingBanner";
import { ServiceWorkerUpdater } from "@/components/ServiceWorkerUpdater";
import { CACHE_VERSION } from "@/lib/cacheVersion";
import Index from "./pages/Index";
import WeightLoss from "./pages/WeightLoss";
import Hormones from "./pages/Hormones";
import HormonesWomen from "./pages/HormonesWomen";
import HormonesMen from "./pages/HormonesMen";
import IVLounge from "./pages/IVLounge";
import PeptideTherapy from "./pages/PeptideTherapy";
import Membership from "./pages/Membership";

import About from "./pages/About";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import PricingComparison from "./pages/PricingComparison";
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
import ProviderSchedule from "./pages/ProviderSchedule";
import OfficeManagerDashboard from "./pages/OfficeManagerDashboard";
import BusinessDashboard from "./pages/BusinessDashboard";
import ClinicSettings from "./pages/ClinicSettings";
import SymptomChecker from "./pages/SymptomChecker";
import MedicationConfirmed from "./pages/MedicationConfirmed";

import PatientResources from "./pages/PatientResources";
import ScheduleConsult from "./pages/ScheduleConsult";
import CreateAccount from "./pages/CreateAccount";
import HealthReport from "./pages/HealthReport";
import PatientServices from "./pages/PatientServices";
import ConsultationConfirmed from "./pages/ConsultationConfirmed";
import HormoneJourneyPage from "./pages/HormoneJourneyPage";
import IVPaymentSuccess from "./pages/IVPaymentSuccess";
import Affordability from "./pages/Affordability";
import AlaCartePaymentSuccess from "./pages/AlaCartePaymentSuccess";
import ProviderLayout from "./components/provider/ProviderLayout";
import StaffPricingCheatsheet from "./pages/StaffPricingCheatsheet";
import StaffQuickCard from "./pages/StaffQuickCard";
import EmailTemplates from "./pages/EmailTemplates";
import PublicIntake from "./pages/PublicIntake";
import OfficeSchedule from "./pages/OfficeSchedule";
import ClinicalProtocolLibrary from "./pages/ClinicalProtocolLibrary";
import ClinicalProtocolDetail from "./pages/ClinicalProtocolDetail";
import ClinicalProtocolEditor from "./components/provider/ClinicalProtocolEditor";
import InventoryDashboard from "./pages/InventoryDashboard";
import FormularyDashboard from "./pages/FormularyDashboard";
import EligibilityReviewQueue from "./pages/EligibilityReviewQueue";
import SchedulingSettings from "./pages/admin/SchedulingSettings";
import ProviderSchedules from "./pages/admin/ProviderSchedules";
import IntakeFollowUps from "./pages/admin/IntakeFollowUps";
import ConsentVersionsAdmin from "./pages/admin/ConsentVersionsAdmin";
import SubstanceAcknowledgmentsAdmin from "./pages/admin/SubstanceAcknowledgmentsAdmin";
import FAQ from "./pages/FAQ";
import ConsentPreview from "./pages/_dev/ConsentPreview";
import PatientIntakeConsents from "./pages/PatientIntakeConsents";
import PatientTreatmentConsents from "./pages/PatientTreatmentConsents";
import PatientReconsent from "./pages/PatientReconsent";
import PatientSubstanceAcknowledgment from "./pages/PatientSubstanceAcknowledgment";
import IntakeKiosk from "./pages/IntakeKiosk";
import IntakeStart from "./pages/IntakeStart";
import ProviderAppointmentRoute from "./pages/provider/ProviderAppointmentRoute";
import SetNewPassword from "./pages/SetNewPassword";
import IVScreening from "./pages/IVScreening";
import IVScreeningWarnings from "./pages/IVScreeningWarnings";
import IVScreeningBlocked from "./pages/IVScreeningBlocked";
import IVSlotSelection from "./pages/IVSlotSelection";
import SafetyConsultRequest from "./pages/SafetyConsultRequest";

const queryClient = new QueryClient();

const GlobalBookingModal = () => {
  const { isBookingOpen, closeBooking } = useBooking();
  return <ConsultationModal isOpen={isBookingOpen} onClose={closeBooking} />;
};

// Clear outdated caches on version mismatch
const clearOutdatedCaches = async () => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    } catch (e) {
      console.error('[App] Error clearing caches:', e);
    }
  }
};

const App = () => {
  // Version check on app load
  useEffect(() => {
    const storedVersion = localStorage.getItem('app-cache-version');
    if (storedVersion !== CACHE_VERSION) {
      console.log(`[App] Cache version mismatch: ${storedVersion} → ${CACHE_VERSION}`);
      clearOutdatedCaches().then(() => {
        localStorage.setItem('app-cache-version', CACHE_VERSION);
      });
    }
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
      <BookingProvider>
        <Toaster />
        <Sonner />
        <ServiceWorkerUpdater />
        <BrowserRouter>
          <ScrollToTop />
          <a href="#main-content" className="skip-to-main">
            Skip to main content
          </a>
          <CookieConsent />
          <MarketingPixel />
          <FloatingFinancingBanner />
          <GlobalBookingModal />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<SetNewPassword />} />
          <Route path="/weightloss" element={<WeightLoss />} />
          <Route path="/weight-loss" element={<WeightLoss />} />
          <Route path="/hormones" element={<Hormones />} />
          <Route path="/hormones-women" element={<HormonesWomen />} />
          <Route path="/hormones-men" element={<HormonesMen />} />
          <Route path="/iv-lounge" element={<IVLounge />} />
          <Route path="/book/iv" element={<IVLounge />} />
          <Route path="/book/iv/screening" element={<IVScreening />} />
          <Route path="/book/iv/warnings/:intake_id" element={<IVScreeningWarnings />} />
          <Route path="/book/iv/blocked/:intake_id" element={<IVScreeningBlocked />} />
          <Route path="/book/iv/slots" element={<IVSlotSelection />} />
          <Route path="/book/consult/request" element={<SafetyConsultRequest />} />
          <Route path="/peptides" element={<PeptideTherapy />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/care-membership" element={<Navigate to="/membership" replace />} />
          <Route path="/about" element={<About />} />
          {/* Legacy routes */}
          <Route path="/hormone-replacement" element={<Hormones />} />
          <Route path="/hair-restoration" element={<NotFound />} />
          <Route path="/sexual-wellness" element={<NotFound />} />
          {/* Sunsetted ketamine/SPRAVATO routes — redirect old SEO links and bookmarks to home */}
          <Route path="/ketamine" element={<Navigate to="/" replace />} />
          <Route path="/iv-ketamine" element={<Navigate to="/" replace />} />
          <Route path="/spravato" element={<Navigate to="/" replace />} />
          <Route path="/how-ketamine-works" element={<Navigate to="/" replace />} />
          <Route path="/military-veteran" element={<Navigate to="/" replace />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/pricing-comparison" element={<PricingComparison />} />
          <Route path="/affordability" element={<Affordability />} />
          <Route path="/what-to-expect" element={<Navigate to="/" replace />} />
          <Route path="/insurance" element={<Navigate to="/pricing" replace />} />
          <Route path="/insurance-reimbursement" element={<Navigate to="/pricing" replace />} />
          <Route path="/services" element={<Services />} />
          <Route path="/book" element={<Navigate to="/" replace />} />
          <Route path="/how-it-works" element={<Navigate to="/membership" replace />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/hipaa-notice" element={<HipaaNotice />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="/mental-wellness" element={<Navigate to="/" replace />} />
          <Route path="/mental-wellness-page" element={<Navigate to="/" replace />} />
          <Route path="/consult" element={<Consult />} />
          {/* Per-flow medication confirmation (replaces legacy /payment-success which served 6 flows) */}
          <Route path="/medication-confirmed" element={<MedicationConfirmed />} />
          {/* Legacy /payment-success — preserved as redirect so old emails / bookmarks don't 404 */}
          <Route path="/payment-success" element={<Navigate to="/patient/dashboard" replace />} />
          
          <Route path="/patient-resources" element={<PatientResources />} />
          <Route path="/schedule-consult" element={<ScheduleConsult />} />
          <Route path="/book/consult" element={<ScheduleConsult />} />
          {/* Public intake form (no auth required, token-validated) */}
          <Route path="/intake" element={<PublicIntake />} />
          <Route path="/intake/start" element={<IntakeStart />} />
          <Route path="/consultation-confirmed" element={<ConsultationConfirmed />} />
          <Route path="/iv-payment-success" element={<IVPaymentSuccess />} />
          <Route path="/alacarte-success" element={<AlaCartePaymentSuccess />} />
          <Route path="/staff-pricing-cheatsheet" element={
            <ProviderLayout title="Staff Quick Reference" subtitle="Internal Use Only" showNavbar={false}>
              <StaffPricingCheatsheet />
            </ProviderLayout>
          } />
          <Route path="/staff-quick-card" element={
            <ProviderLayout title="Quick Reference Card" subtitle="Internal Use Only" showNavbar={false}>
              <StaffQuickCard />
            </ProviderLayout>
          } />
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
          <Route path="/patient/mental-wellness" element={<Navigate to="/consult" replace />} />
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
          <Route path="/intake/consents" element={
            <SecurePatientRoute>
              <PatientIntakeConsents />
            </SecurePatientRoute>
          } />
          <Route path="/intake/treatment-consents" element={
            <SecurePatientRoute>
              <PatientTreatmentConsents />
            </SecurePatientRoute>
          } />
          <Route path="/intake/reconsent" element={
            <SecurePatientRoute>
              <PatientReconsent />
            </SecurePatientRoute>
          } />
          <Route path="/intake/substance-acknowledgment" element={
            <SecurePatientRoute>
              <PatientSubstanceAcknowledgment />
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
            <ProviderLayout
              title="Provider Dashboard"
              subtitle="Clinical Operations"
              showNavbar={false}
              allowedRoles={["admin", "staff", "business_admin", "provider"]}
            >
              <ProviderDashboard />
            </ProviderLayout>
          } />
          <Route path="/provider/schedule" element={
            <ProviderLayout
              title="My Schedule"
              subtitle="Clinical scheduling"
              allowedRoles={["admin", "staff", "business_admin", "provider"]}
            >
              <ProviderSchedule />
            </ProviderLayout>
          } />
          <Route path="/provider/appointments/:appointmentId" element={
            <ProviderLayout
              title="Appointment"
              subtitle="Clinical Operations"
              showNavbar={false}
              allowedRoles={["admin", "staff", "business_admin", "provider"]}
            >
              <ProviderAppointmentRoute />
            </ProviderLayout>
          } />
          <Route path="/admin/settings" element={
            <ProviderLayout title="Clinic Settings" subtitle="Configuration" showNavbar={false}>
              <ClinicSettings />
            </ProviderLayout>
          } />
          <Route path="/admin/scheduling" element={
            <ProviderLayout title="Scheduling Settings" subtitle="Practice Settings" showNavbar={false}>
              <SchedulingSettings />
            </ProviderLayout>
          } />
          <Route path="/admin/provider-schedules" element={
            <ProviderLayout title="Provider Schedules" subtitle="Practice Scheduling" showNavbar={false}>
              <ProviderSchedules />
            </ProviderLayout>
          } />
          <Route path="/admin/intake-follow-ups" element={
            <ProviderLayout
              title="Intake Follow-ups"
              subtitle="Safety Intake Follow-up Queue"
              showNavbar={false}
              allowedRoles={["admin", "business_admin", "provider"]}
            >
              <IntakeFollowUps />
            </ProviderLayout>
          } />
          <Route path="/admin/intake-follow-ups/:id" element={
            <ProviderLayout
              title="Intake Follow-ups"
              subtitle="Safety Intake Follow-up Queue"
              showNavbar={false}
              allowedRoles={["admin", "business_admin", "provider"]}
            >
              <IntakeFollowUps />
            </ProviderLayout>
          } />
          <Route path="/office/dashboard" element={
            <ProviderLayout
              title="Office Manager"
              subtitle="Patient Overview"
              showNavbar={false}
              allowedRoles={["admin", "staff", "business_admin", "provider"]}
            >
              <OfficeManagerDashboard />
            </ProviderLayout>
          } />
          <Route path="/office/schedule" element={
            <ProviderLayout
              title="Schedule"
              subtitle="Office-wide calendar"
              allowedRoles={["admin", "staff", "business_admin", "provider"]}
            >
              <OfficeSchedule />
            </ProviderLayout>
          } />
          <Route path="/schedule" element={
            <ProviderLayout
              title="Schedule"
              subtitle="Office-wide calendar"
              allowedRoles={["admin", "staff", "business_admin", "provider"]}
            >
              <OfficeSchedule />
            </ProviderLayout>
          } />
          <Route path="/kiosk/intake" element={
            <ProviderLayout title="Intake kiosk" subtitle="Front desk iPad" showNavbar={false}>
              <IntakeKiosk />
            </ProviderLayout>
          } />
          <Route path="/admin/business" element={
            <ProviderLayout title="Business Dashboard" subtitle="Revenue & Operations" showNavbar={false}>
              <BusinessDashboard />
            </ProviderLayout>
          } />
          <Route path="/admin/email-templates" element={
            <ProviderLayout title="Email Templates" subtitle="Template Management" showNavbar={false}>
              <EmailTemplates />
            </ProviderLayout>
          } />
          <Route path="/admin/consent-versions" element={<ConsentVersionsAdmin />} />
          <Route path="/admin/substance-acknowledgments" element={<SubstanceAcknowledgmentsAdmin />} />
          <Route path="/clinical-protocols" element={
            <ProviderLayout title="Clinical Protocols" subtitle="Standing orders & SOPs" showNavbar={true}>
              <ClinicalProtocolLibrary />
            </ProviderLayout>
          } />
          <Route path="/clinical-protocols/:slug/edit" element={
            <ProviderLayout title="Edit clinical protocol" subtitle="Admin only" showNavbar={true}>
              <ClinicalProtocolEditor />
            </ProviderLayout>
          } />
          <Route path="/clinical-protocols/:slug" element={
            <ProviderLayout title="Clinical protocol" subtitle="Standing order" showNavbar={true}>
              <ClinicalProtocolDetail />
            </ProviderLayout>
          } />
          <Route path="/inventory" element={
            <ProviderLayout title="Inventory" subtitle="Lot tracking · FEFO" showNavbar={true}>
              <InventoryDashboard />
            </ProviderLayout>
          } />
          <Route
            path="/formulary"
            element={
              <ProviderLayout
                title="Formulary"
                subtitle="Pricing · supplier · dose"
                showNavbar={true}
                allowedRoles={["admin", "staff", "business_admin", "provider"]}
              >
                <FormularyDashboard />
              </ProviderLayout>
            }
          />
          {import.meta.env.DEV && (
            <Route path="/_dev/consent-preview" element={<ConsentPreview />} />
          )}

          <Route path="/admin/eligibility-reviews" element={
            <ProviderLayout title="Eligibility Reviews" subtitle="Safety-flagged patients" showNavbar={false}>
              <EligibilityReviewQueue />
            </ProviderLayout>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </BookingProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;