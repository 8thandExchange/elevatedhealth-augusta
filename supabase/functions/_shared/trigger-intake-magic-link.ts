import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { isWellnessAssessmentServiceType } from "./magic-link-helpers.ts";

/** Fire-and-forget: create + send intake magic link after wellness assessment is scheduled. */
export function triggerIntakeMagicLinkDelivery(
  supabase: SupabaseClient,
  params: {
    patientId: string;
    bookingId?: string | null;
    appointmentTimeIso: string;
    serviceType?: string | null;
  },
): void {
  const { patientId, bookingId, appointmentTimeIso, serviceType } = params;

  if (serviceType && !isWellnessAssessmentServiceType(serviceType)) {
    return;
  }

  (async () => {
    try {
      const { data: created, error: createError } = await supabase.functions.invoke(
        "create-intake-magic-link",
        {
          body: {
            patient_id: patientId,
            booking_id: bookingId ?? undefined,
            appointment_time: appointmentTimeIso,
          },
        },
      );

      if (createError || !created?.token) {
        console.warn("[trigger-intake-magic-link] create failed", createError, created);
        return;
      }

      const { error: sendError } = await supabase.functions.invoke("send-intake-magic-link", {
        body: {
          patient_id: patientId,
          magic_link_token: created.token,
          context: "initial_booking",
        },
      });

      if (sendError) {
        console.warn("[trigger-intake-magic-link] send failed", sendError);
      }
    } catch (e) {
      console.warn("[trigger-intake-magic-link] unexpected error", e);
    }
  })();
}
