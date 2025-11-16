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
          {/* Legacy Routes - Redirect to new pages */}
          <Route path="/iv-ketamine" element={<IVKetamine />} />
          <Route path="/spravato" element={<Spravato />} />
          <Route path="/hormone-replacement" element={<HormoneReplacement />} />
          <Route path="/weight-loss" element={<WeightLoss />} />
          {/* Other Routes */}
          <Route path="/military-veteran" element={<MilitaryVeteran />} />
          <Route path="/how-ketamine-works" element={<HowKetamineWorks />} />
          <Route path="/what-to-expect" element={<WhatToExpect />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/hipaa-notice" element={<HipaaNotice />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/consult" element={<Consult />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
