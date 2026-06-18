import { supabase } from "@/integrations/supabase/client";
import {
  labPanelAlacarteProductKey,
  labPanelDisplayPrice,
} from "@/lib/labPanelCheckout";

export type LabPaymentDelivery = "email" | "sms" | "copy";

export interface SendLabPanelPaymentLinkInput {
  panelSlug: string;
  panelName: string;
  patientId: string;
  patientName: string;
  patientEmail?: string | null;
  patientPhone?: string | null;
  isMember?: boolean;
  method: LabPaymentDelivery;
}

export async function sendLabPanelPaymentLink(
  input: SendLabPanelPaymentLinkInput,
): Promise<{ url: string }> {
  const {
    panelSlug,
    panelName,
    patientId,
    patientName,
    patientEmail,
    patientPhone,
    isMember = false,
    method,
  } = input;

  if (method === "email" && !patientEmail) {
    throw new Error("Patient email is required to send a payment link.");
  }
  if (method === "sms" && !patientPhone) {
    throw new Error("Patient phone is required to send a payment link by text.");
  }
  if (!patientEmail?.trim()) {
    throw new Error("Patient email is required on file to create a Stripe payment link.");
  }

  const amount = labPanelDisplayPrice(panelSlug, isMember);
  const product_key = labPanelAlacarteProductKey(panelSlug);

  const { data, error } = await supabase.functions.invoke("create-alacarte-checkout", {
    body: {
      product_key,
      patient_email: patientEmail.trim(),
      patient_name: patientName,
      patient_id: patientId,
      panel_slug: panelSlug,
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error("Could not create payment link");

  const url = data.url as string;

  if (method === "copy") {
    await navigator.clipboard.writeText(url);
    return { url };
  }

  if (method === "email") {
    const { error: emailError } = await supabase.functions.invoke("send-alacarte-payment-link", {
      body: {
        patient_email: patientEmail,
        patient_name: patientName,
        payment_url: url,
        product_name: panelName,
        amount,
      },
    });
    if (emailError) throw emailError;
    return { url };
  }

  const { error: smsError } = await supabase.functions.invoke("send-alacarte-payment-sms", {
    body: {
      patient_phone: patientPhone,
      patient_name: patientName,
      payment_url: url,
      product_name: panelName,
      amount,
    },
  });
  if (smsError) throw smsError;

  return { url };
}
