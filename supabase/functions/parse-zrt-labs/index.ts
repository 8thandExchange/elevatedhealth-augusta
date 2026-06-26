import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { openaiPdfChat, openaiVisionChat } from "../_shared/openai-chat.ts";
import { requireClinicalStaffRole } from "../_shared/staff-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ParsedLabResult {
  collectionDate: string | null;
  patientName: string | null;
  labSource: "zrt" | "labcorp" | "unknown";
  estradiol: number | null;
  progesterone: number | null;
  testosterone: number | null;
  dheas: number | null;
  cortisol: number | null;
  pgE2Ratio: number | null;
  hematocrit: number | null;
  psa: number | null;
  alt: number | null;
  ast: number | null;
  a1c: number | null;
  tsh: number | null;
  freeT3: number | null;
  freeT4: number | null;
  vitaminD: number | null;
  fastingInsulin: number | null;
  triglycerides: number | null;
  hdl: number | null;
  ldl: number | null;
  confidence: {
    overall: number;
    fields: Record<string, number>;
  };
}

function buildPrompt(): string {
  return `You are a medical lab result extraction system. Analyze this lab report and extract values.

FIRST, determine the lab source:
- If you see "ZRT Laboratory" or "Saliva Profile" → labSource = "zrt"
- If you see "LabCorp" or "Laboratory Corporation" → labSource = "labcorp"
- Otherwise → labSource = "unknown"

Extract ALL available values from the report. Return ONLY valid JSON, no markdown.

For ZRT reports, extract:
- collectionDate, patientName, estradiol (pg/mL), progesterone (pg/mL), testosterone (pg/mL), dheas (ng/mL), cortisol (morning ng/mL), pgE2Ratio

For LabCorp reports, extract:
- collectionDate, patientName, hematocrit (%), psa (ng/mL), alt (U/L), ast (U/L), a1c (%), tsh (mIU/L), freeT3 (pg/mL), freeT4 (ng/dL), vitaminD (ng/mL), fastingInsulin (uIU/mL), triglycerides (mg/dL), hdl (mg/dL), ldl (mg/dL)

Return this JSON structure:
{"labSource":"labcorp","collectionDate":"2026-01-19","patientName":"Name Here","estradiol":null,"progesterone":null,"testosterone":null,"dheas":null,"cortisol":null,"pgE2Ratio":null,"hematocrit":42,"psa":null,"alt":null,"ast":null,"a1c":null,"tsh":null,"freeT3":null,"freeT4":null,"vitaminD":null,"fastingInsulin":null,"triglycerides":null,"hdl":null,"ldl":null,"confidence":{"overall":0.95,"fields":{}}}

Use null for any values not found. Return ONLY the JSON object.`;
}

function repairJson(jsonStr: string): string {
  jsonStr = jsonStr.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  const startIdx = jsonStr.indexOf("{");
  const endIdx = jsonStr.lastIndexOf("}");
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    jsonStr = jsonStr.substring(startIdx, endIdx + 1);
  }
  let braceCount = 0;
  for (const char of jsonStr) {
    if (char === "{") braceCount++;
    if (char === "}") braceCount--;
  }
  if (braceCount > 0) {
    jsonStr = jsonStr.replace(/,\s*$/, "");
    while (braceCount > 0) {
      jsonStr += "}";
      braceCount--;
    }
  }
  return jsonStr;
}

function normalizeMimeType(mimeType: string, filename?: string): string {
  const trimmed = mimeType?.trim().toLowerCase() || "";
  if (trimmed === "application/pdf" || trimmed.endsWith("/pdf")) return "application/pdf";
  if (trimmed.startsWith("image/")) return trimmed;
  const lowerName = filename?.toLowerCase() || "";
  if (lowerName.endsWith(".pdf")) return "application/pdf";
  if (/\.(png|jpe?g|gif|webp)$/.test(lowerName)) {
    const ext = lowerName.split(".").pop() || "jpeg";
    return ext === "jpg" ? "image/jpeg" : `image/${ext === "jpeg" ? "jpeg" : ext}`;
  }
  return trimmed || "application/pdf";
}

function isPdfMime(mimeType: string): boolean {
  return mimeType === "application/pdf" || mimeType.endsWith("/pdf");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const auth = await requireClinicalStaffRole(req);
    if (!auth.ok) {
      return new Response(JSON.stringify({ success: false, error: auth.error }), {
        status: auth.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { pdfBase64, mimeType = "application/pdf", filename } = await req.json();
    if (!pdfBase64) throw new Error("PDF data is required");

    const normalizedMime = normalizeMimeType(mimeType, filename);
    const prompt = buildPrompt();

    // PDFs must use Responses API — vision image_url rejects application/pdf.
    const ai = isPdfMime(normalizedMime)
      ? await openaiPdfChat(prompt, pdfBase64, { filename: filename || "lab-report.pdf" })
      : await openaiVisionChat(prompt, normalizedMime, pdfBase64, { max_tokens: 800 });

    if (!ai.ok) {
      return new Response(JSON.stringify({ success: false, error: ai.error }), {
        status: ai.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsedResult: ParsedLabResult;
    try {
      const jsonStr = repairJson(ai.content.trim());
      parsedResult = JSON.parse(jsonStr);
      if (typeof parsedResult !== "object" || parsedResult === null) {
        throw new Error("Invalid response structure");
      }
      if (!parsedResult.labSource) parsedResult.labSource = "unknown";
      if (!parsedResult.confidence) {
        parsedResult.confidence = { overall: 0.9, fields: {} };
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", ai.content, parseError);
      throw new Error("Failed to parse lab results. Try a PNG/JPEG screenshot or enter values manually.");
    }

    return new Response(JSON.stringify({ success: true, data: parsedResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error parsing labs:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
