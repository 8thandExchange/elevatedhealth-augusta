import { supabase } from "@/integrations/supabase/client";
import { readEdgeFunctionError } from "@/lib/edgeFunctionError";
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

async function invokeFunction<T extends Record<string, unknown>>(
  functionName: string,
  body: Record<string, unknown>,
  fallbackMessage: string,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(functionName, { body });

  if (error) {
    throw new Error(await readEdgeFunctionError(error, fallbackMessage));
  }

  if (data && typeof data === "object" && "error" in data && data.error) {
    throw new Error(String(data.error));
  }

  return (data ?? {}) as T;
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

  const checkout = await invokeFunction<{ url?: string }>(
    "create-alacarte-checkout",
    {
      product_key,
      patient_email: patientEmail.trim(),
      patient_name: patientName,
      patient_id: patientId,
      panel_slug: panelSlug,
    },
    "Could not create lab payment link",
  );

  const url = checkout.url;
  if (!url) {
    throw new Error("Stripe did not return a checkout URL. Try again or call the clinic.");
  }

  if (method === "copy") {
    await navigator.clipboard.writeText(url);
    return { url };
  }

  if (method === "email") {
    await invokeFunction(
      "send-alacarte-payment-link",
      {
        patient_email: patientEmail.trim(),
        patient_name: patientName,
        payment_url: url,
        product_name: panelName,
        amount,
      },
      "Could not email the payment link",
    );
    return { url };
  }

  await invokeFunction(
    "send-alacarte-payment-sms",
    {
      patient_phone: patientPhone,
      patient_name: patientName,
      payment_url: url,
      product_name: panelName,
      amount,
    },
    "Could not text the payment link",
  );

  return { url };
}
