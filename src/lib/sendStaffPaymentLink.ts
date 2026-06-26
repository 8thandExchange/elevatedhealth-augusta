import { supabase } from "@/integrations/supabase/client";
import { readEdgeFunctionError } from "@/lib/edgeFunctionError";
import {
  comboActivationParams,
  comboSlugFromProduct,
  getStaffPaymentProductLabel,
  getStaffPaymentProductPrice,
  isComboProduct,
  type StaffPaymentDelivery,
  type StaffPaymentPatient,
  type StaffPaymentProduct,
} from "@/lib/staffPaymentCatalog";
import { PEPTIDE_PRODUCTS, RECOVERY_PEPTIDE_PRODUCTS, METABOLIC_STACK_ALACARTE } from "@/lib/stripeConfig";

export interface SendStaffPaymentLinkResult {
  url: string;
  smsManualFallback?: boolean;
  deliveryNote?: string;
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

const MEMBERSHIP_PROGRAM: Record<string, "wellness" | "trt" | "hrt"> = {
  elevated_iv: "wellness",
  elevated_trt: "trt",
  elevated_hrt: "hrt",
};

function checkoutFunctionForProduct(product: string): string {
  if (isComboProduct(product)) return "send-activation-sms";
  if (product in MEMBERSHIP_PROGRAM) return "create-membership-checkout";
  if (product === "consultation") return "create-consultation-checkout";
  if (product === "semaglutide") return "create-semaglutide-checkout";
  if (product === "tirzepatide") return "create-tirzepatide-checkout";
  if (product.startsWith("recovery:")) return "create-alacarte-checkout";
  if (product.startsWith("peptide:") || product.startsWith("metabolic:")) return "add-peptide-subscription";
  if (product.startsWith("sexual:")) return "create-sexual-wellness-checkout";
  if (product.startsWith("hair:")) return "create-hair-restoration-checkout";
  return "create-alacarte-checkout";
}

function checkoutBody(product: string, patient: StaffPaymentPatient): Record<string, unknown> {
  const firstName = patient.full_name.split(" ")[0] || patient.full_name;

  if (isComboProduct(product)) {
    const comboSlug = comboSlugFromProduct(product);
    const { comboAnchor, comboAddon, baseMembership } = comboActivationParams(comboSlug);
    return {
      first_name: firstName,
      phone: patient.phone || "",
      base_membership: baseMembership,
      include_hormone_addon: comboAddon === "trt" || comboAddon === "hrt",
      patient_email: patient.email,
      patient_id: patient.id,
      send_email: false,
      combo_slug: comboSlug,
      combo_anchor: comboAnchor,
      combo_addon: comboAddon,
    };
  }

  if (product in MEMBERSHIP_PROGRAM) {
    return {
      program: MEMBERSHIP_PROGRAM[product],
      email: patient.email,
      name: patient.full_name,
      patientId: patient.id,
    };
  }

  if (product.startsWith("recovery:")) {
    const key = product.slice("recovery:".length);
    return {
      product_key: key,
      patient_email: patient.email,
      patient_name: patient.full_name,
      patient_id: patient.id,
    };
  }

  if (product.startsWith("peptide:")) {
    const key = product.slice("peptide:".length) as keyof typeof PEPTIDE_PRODUCTS;
    const peptide = PEPTIDE_PRODUCTS[key];
    if (!peptide) throw new Error(`Unknown peptide product: ${key}`);
    return {
      patient_email: patient.email,
      price_id: peptide.priceId,
      peptide_type: key,
      is_recurring: true,
    };
  }

  if (product.startsWith("metabolic:")) {
    const key = product.slice("metabolic:".length) as keyof typeof METABOLIC_STACK_ALACARTE;
    const item = METABOLIC_STACK_ALACARTE[key];
    if (!item) throw new Error(`Unknown metabolic product: ${key}`);
    return {
      patient_email: patient.email,
      price_id: item.priceId,
      peptide_type: key,
      is_recurring: true,
    };
  }

  if (product.startsWith("sexual:")) {
    const key = product.slice("sexual:".length);
    return {
      product_key: key,
      patient_id: patient.id,
    };
  }

  if (product.startsWith("hair:")) {
    const key = product.slice("hair:".length);
    return {
      product_key: key,
      patient_id: patient.id,
    };
  }

  if (product.startsWith("alacarte_")) {
    const rawKey = product.replace("alacarte_", "");
    const productKey =
      rawKey === "labPanelExpanded"
        ? "labPanelExpanded"
        : rawKey === "labPanel"
          ? "labPanel"
          : rawKey;
    return {
      product_key: productKey,
      patient_email: patient.email,
      patient_name: patient.full_name,
      patient_id: patient.id,
    };
  }

  if (product === "consultation") {
    return { serviceType: "hormone" };
  }

  return {
    email: patient.email,
    name: patient.full_name,
    patientId: patient.id,
  };
}

async function createPaymentUrl(product: string, patient: StaffPaymentPatient): Promise<string> {
  if (!patient.email?.trim()) {
    throw new Error("Patient email is required to create a Stripe payment link.");
  }

  const fn = checkoutFunctionForProduct(product);
  const body = checkoutBody(product, patient);
  const data = await invokeFunction<{ url?: string; payment_link?: string }>(
    fn,
    body,
    "Could not create payment link",
  );

  const url = data.payment_link ?? data.url;
  if (!url) {
    throw new Error("Stripe did not return a checkout URL. Try again or call the clinic.");
  }
  return url;
}

async function deliverPaymentLink(
  method: StaffPaymentDelivery,
  patient: StaffPaymentPatient,
  url: string,
  productName: string,
  amount: string,
): Promise<SendStaffPaymentLinkResult> {
  if (method === "copy") {
    await navigator.clipboard.writeText(url);
    return { url };
  }

  if (method === "email") {
    if (!patient.email) throw new Error("Patient email is required to send a payment link.");
    await invokeFunction(
      "send-alacarte-payment-link",
      {
        patient_email: patient.email.trim(),
        patient_name: patient.full_name,
        payment_url: url,
        product_name: productName,
        amount,
      },
      "Could not email the payment link",
    );
    return { url };
  }

  if (!patient.phone) {
    throw new Error("Patient phone is required to send a payment link by text.");
  }

  try {
    await invokeFunction(
      "send-alacarte-payment-sms",
      {
        patient_phone: patient.phone,
        patient_name: patient.full_name,
        payment_url: url,
        product_name: productName,
        amount,
      },
      "Could not text the payment link",
    );
    return { url };
  } catch {
    await navigator.clipboard.writeText(url);
    return {
      url,
      smsManualFallback: true,
      deliveryNote:
        "SMS is not set up on the server yet. Payment link copied — paste it into Messages for the patient, or use Email.",
    };
  }
}

/** Create checkout URL and deliver via email, SMS, or clipboard. */
export async function sendStaffPaymentLink(input: {
  product: string;
  patient: StaffPaymentPatient;
  method: StaffPaymentDelivery;
  catalog: StaffPaymentProduct[];
}): Promise<SendStaffPaymentLinkResult> {
  const { product, patient, method, catalog } = input;
  const productName = getStaffPaymentProductLabel(product, catalog);
  const amount = getStaffPaymentProductPrice(product, catalog);

  if (isComboProduct(product) && method === "email") {
    const comboSlug = comboSlugFromProduct(product);
    const firstName = patient.full_name.split(" ")[0] || patient.full_name;
    const { comboAnchor, comboAddon, baseMembership } = comboActivationParams(comboSlug);
    const data = await invokeFunction<{ payment_link?: string; email_sent?: boolean }>(
      "send-activation-sms",
      {
        first_name: firstName,
        phone: patient.phone || "",
        base_membership: baseMembership,
        include_hormone_addon: comboAddon === "trt" || comboAddon === "hrt",
        patient_email: patient.email,
        patient_id: patient.id,
        send_email: true,
        combo_slug: comboSlug,
        combo_anchor: comboAnchor,
        combo_addon: comboAddon,
      },
      "Could not send enrollment email",
    );
    const url = data.payment_link ?? "";
    if (!url) throw new Error("Stripe did not return a checkout URL.");
    if (!data.email_sent) {
      await navigator.clipboard.writeText(url);
      return {
        url,
        deliveryNote: "Enrollment email failed — payment link copied to clipboard.",
      };
    }
    return { url };
  }

  const url = await createPaymentUrl(product, patient);
  return deliverPaymentLink(method, patient, url, productName, amount);
}

/** Keys routed through create-alacarte-checkout for recovery fills (for tests/docs). */
export const RECOVERY_PRODUCT_KEYS = Object.keys(RECOVERY_PEPTIDE_PRODUCTS);
