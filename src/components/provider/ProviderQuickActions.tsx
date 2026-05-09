import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CreditCard, CheckCircle, MessageSquare, Mail, FileText, UserPlus, BookOpen, Boxes, CalendarPlus } from "lucide-react";
import QuickPaymentModal from "./QuickPaymentModal";
import QuickLabsReviewedModal from "./QuickLabsReviewedModal";
import QuickMessageModal from "./QuickMessageModal";
import QuickEmailModal from "./QuickEmailModal";
import EncounterFormModal from "./EncounterFormModal";
import AddPatientModal from "./AddPatientModal";
import StaffBookingModal from "@/components/booking/StaffBookingModal";
import { supabase } from "@/integrations/supabase/client";

interface ProviderQuickActionsProps {
  onRefresh?: () => void;
}

const ProviderQuickActions = ({ onRefresh }: ProviderQuickActionsProps) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLabsModalOpen, setIsLabsModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (cancelled) return;
      setIsAdmin((roles || []).some((r) => r.role === "admin"));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="bg-secondary/30 border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto">
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap mr-2">
            QUICK ACTIONS:
          </span>

          <Button
            variant="default"
            size="sm"
            className="whitespace-nowrap"
            onClick={() => setIsBookingModalOpen(true)}
          >
            <CalendarPlus className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>

          <AddPatientModal
            onPatientAdded={onRefresh}
            trigger={
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
            }
          />

          <Button variant="outline" size="sm" className="whitespace-nowrap" asChild>
            <Link to="/clinical-protocols">
              <BookOpen className="w-4 h-4 mr-2" />
              Clinical Protocols
            </Link>
          </Button>

          <Button variant="outline" size="sm" className="whitespace-nowrap" asChild>
            <Link to="/inventory">
              <Boxes className="w-4 h-4 mr-2" />
              Inventory
            </Link>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaymentModalOpen(true)}
            className="whitespace-nowrap"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Payment
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLabsModalOpen(true)}
            className="whitespace-nowrap"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Labs
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMessageModalOpen(true)}
            className="whitespace-nowrap"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Message
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEmailModalOpen(true)}
            className="whitespace-nowrap"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          
          <EncounterFormModal
            trigger={
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                <FileText className="w-4 h-4 mr-2" />
                Encounter
              </Button>
            }
            onSuccess={onRefresh}
          />
        </div>
      </div>

      <QuickPaymentModal 
        open={isPaymentModalOpen} 
        onOpenChange={setIsPaymentModalOpen}
        onSuccess={onRefresh}
      />
      
      <QuickLabsReviewedModal 
        open={isLabsModalOpen} 
        onOpenChange={setIsLabsModalOpen}
        onSuccess={onRefresh}
      />
      
      <QuickMessageModal 
        open={isMessageModalOpen} 
        onOpenChange={setIsMessageModalOpen}
      />
      
      <QuickEmailModal 
        open={isEmailModalOpen} 
        onOpenChange={setIsEmailModalOpen}
        onSuccess={onRefresh}
      />

      <StaffBookingModal
        open={isBookingModalOpen}
        onOpenChange={(open) => {
          setIsBookingModalOpen(open);
          if (!open) onRefresh?.();
        }}
        isAdmin={isAdmin}
      />
    </>
  );
};

export default ProviderQuickActions;
