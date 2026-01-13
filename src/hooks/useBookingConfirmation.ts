import { useState, useCallback } from "react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import { SITE_CONFIG } from "@/lib/siteConfig";
import { supabase } from "@/integrations/supabase/client";

interface BookingDetails {
  name: string;
  email: string;
  phone: string;
}

export function useBookingConfirmation() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCalendarInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      // Show confirmation button after 3 seconds of interaction
      setTimeout(() => {
        setShowConfirmation(true);
      }, 3000);
    }
  }, [hasInteracted]);

  const openDetailsModal = useCallback(() => {
    setShowDetailsModal(true);
  }, []);

  const closeDetailsModal = useCallback(() => {
    setShowDetailsModal(false);
  }, []);

  const sendBookingConfirmation = useCallback(async (details: BookingDetails) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-booking-confirmation', {
        body: {
          name: details.name,
          email: details.email,
          phone: details.phone,
          source: 'portal'
        }
      });

      if (error) {
        console.error('Booking confirmation error:', error);
        // Still show success toast even if notification fails
        toast.success("Booking Request Submitted!", {
          description: `You'll receive a confirmation shortly. Questions? Call ${SITE_CONFIG.phone}`,
          duration: 8000,
        });
      } else {
        const emailSent = data?.results?.email?.success;
        const smsSent = data?.results?.sms?.success;
        
        let description = "Your Clinical Strategy Session is confirmed!";
        if (emailSent && smsSent) {
          description = "Confirmation sent to your email and phone!";
        } else if (emailSent) {
          description = "Confirmation sent to your email!";
        } else if (smsSent) {
          description = "Confirmation sent to your phone!";
        }
        
        toast.success("Booking Confirmed! 🎉", {
          description,
          duration: 8000,
          action: {
            label: "Got it",
            onClick: () => {},
          },
        });
      }

      trackEvent("booking_confirmed", { 
        source: "calendar_embed",
        email_sent: data?.results?.email?.success || false,
        sms_sent: data?.results?.sms?.success || false,
      });

      setShowDetailsModal(false);
      setShowConfirmation(false);
      setHasInteracted(false);
    } catch (err) {
      console.error('Booking confirmation error:', err);
      toast.success("Booking Request Submitted!", {
        description: `You'll receive a confirmation email shortly. Questions? Call ${SITE_CONFIG.phone}`,
        duration: 8000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const showBookingSuccessToast = useCallback(() => {
    // Open modal to collect details
    setShowDetailsModal(true);
  }, []);

  const resetConfirmation = useCallback(() => {
    setShowConfirmation(false);
    setHasInteracted(false);
    setShowDetailsModal(false);
    setIsSubmitting(false);
  }, []);

  return {
    showConfirmation,
    hasInteracted,
    showDetailsModal,
    isSubmitting,
    handleCalendarInteraction,
    showBookingSuccessToast,
    openDetailsModal,
    closeDetailsModal,
    sendBookingConfirmation,
    resetConfirmation,
  };
}
