/**
 * Deterministic lab PDF text-layer parsing (no PHI sent to OpenAI).
 * Templates tuned against fixtures in parse-zrt-labs/fixtures/ (synthetic TEST data).
 */

export type LabSource = "zrt" | "labcorp" | "unknown";

export type ParsedLabConfidence = {
  overall: number;
  fields: Record<string, number>;
};

export type ParsedLabResult = {
  collectionDate: string | null;
  patientName: string | null;
  labSource: LabSource;
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
  confidence: ParsedLabConfidence;
  source: "deterministic" | "ai_fallback";
};

/** Extract printable text from PDF base64 (text-layer PDFs only). */
export function extractPdfTextLayer(base64: string): string {
  let raw: string;
  try {
    raw = atob(base64);
  } catch {
    return "";
  }

  const parts: string[] = [];

  // PDF literal strings: ( ... )
  const parenRe = /\((?:\\.|[^\\)])*\)/g;
  for (const match of raw.matchAll(parenRe)) {
    const inner = match[0].slice(1, -1)
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\\\/g, "\\");
    if (/[\w\d]/.test(inner)) parts.push(inner);
  }

  // Some generators emit readable ASCII outside parens
  const asciiRuns = raw.match(/[A-Za-z0-9][A-Za-z0-9\s.,:/\-+%]{3,}/g) ?? [];
  parts.push(...asciiRuns);

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function detectLabFormat(text: string): LabSource | null {
  const upper = text.toUpperCase();
  if (upper.includes("ZRT LABORATORY") || upper.includes("SALIVA PROFILE")) return "zrt";
  if (upper.includes("LABCORP") || upper.includes("LABORATORY CORPORATION")) return "labcorp";
  return null;
}

function pickNumber(text: string, patterns: RegExp[]): number | null {
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1] != null) {
      const n = parseFloat(m[1]);
      if (!Number.isNaN(n)) return n;
    }
  }
  return null;
}

function pickDate(text: string): string | null {
  const iso = text.match(/Collection Date[:\s]+(\d{4}-\d{2}-\d{2})/i);
  if (iso?.[1]) return iso[1];
  const us = text.match(/Collection Date[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i);
  if (us?.[1]) {
    const [mm, dd, yyyy] = us[1].split("/");
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  return null;
}

function emptyResult(labSource: LabSource): ParsedLabResult {
  return {
    collectionDate: null,
    patientName: null,
    labSource,
    estradiol: null,
    progesterone: null,
    testosterone: null,
    dheas: null,
    cortisol: null,
    pgE2Ratio: null,
    hematocrit: null,
    psa: null,
    alt: null,
    ast: null,
    a1c: null,
    tsh: null,
    freeT3: null,
    freeT4: null,
    vitaminD: null,
    fastingInsulin: null,
    triglycerides: null,
    hdl: null,
    ldl: null,
    confidence: { overall: 0, fields: {} },
    source: "deterministic",
  };
}

function withConfidence(result: ParsedLabResult): ParsedLabResult {
  const numericKeys = [
    "estradiol", "progesterone", "testosterone", "dheas", "cortisol", "pgE2Ratio",
    "hematocrit", "psa", "alt", "ast", "a1c", "tsh", "freeT3", "freeT4", "vitaminD",
    "fastingInsulin", "triglycerides", "hdl", "ldl",
  ] as const;
  const fields: Record<string, number> = {};
  let found = 0;
  for (const key of numericKeys) {
    if (result[key] != null) {
      fields[key] = 0.95;
      found++;
    }
  }
  if (result.collectionDate) fields.collectionDate = 0.95;
  const overall = found > 0 ? Math.min(0.98, 0.5 + found * 0.05) : 0;
  return { ...result, confidence: { overall, fields } };
}

/** Parse known ZRT saliva layout from extracted text (patient name intentionally omitted). */
export function parseZrtTextLayer(text: string): ParsedLabResult | null {
  if (detectLabFormat(text) !== "zrt") return null;

  const result = emptyResult("zrt");
  result.collectionDate = pickDate(text);
  result.estradiol = pickNumber(text, [/Estradiol[\s:]+([\d.]+)/i]);
  result.progesterone = pickNumber(text, [/Progesterone[\s:]+([\d.]+)/i]);
  result.testosterone = pickNumber(text, [/Testosterone[\s:]+([\d.]+)/i]);
  result.dheas = pickNumber(text, [/DHEA-?S[\s:]+([\d.]+)/i]);
  result.cortisol = pickNumber(text, [/Cortisol[\s:]+([\d.]+)/i]);
  result.pgE2Ratio = pickNumber(text, [/P\/G\s*Ratio[\s:]+([\d.]+)/i, /PgE2[\s:]+([\d.]+)/i]);

  const parsed = withConfidence(result);
  return parsed.confidence.overall > 0 ? parsed : null;
}

/** Parse known LabCorp layout from extracted text (patient name intentionally omitted). */
export function parseLabcorpTextLayer(text: string): ParsedLabResult | null {
  if (detectLabFormat(text) !== "labcorp") return null;

  const result = emptyResult("labcorp");
  result.collectionDate = pickDate(text);
  result.hematocrit = pickNumber(text, [/Hematocrit[\s:]+([\d.]+)/i]);
  result.psa = pickNumber(text, [/PSA[\s:]+([\d.]+)/i]);
  result.alt = pickNumber(text, [/ALT[\s:]+([\d.]+)/i]);
  result.ast = pickNumber(text, [/AST[\s:]+([\d.]+)/i]);
  result.a1c = pickNumber(text, [/HbA1c[\s:]+([\d.]+)/i, /A1c[\s:]+([\d.]+)/i]);
  result.tsh = pickNumber(text, [/TSH[\s:]+([\d.]+)/i]);
  result.freeT3 = pickNumber(text, [/Free T3[\s:]+([\d.]+)/i]);
  result.freeT4 = pickNumber(text, [/Free T4[\s:]+([\d.]+)/i]);
  result.vitaminD = pickNumber(text, [/Vitamin D[\s:]+([\d.]+)/i]);
  result.fastingInsulin = pickNumber(text, [/Fasting Insulin[\s:]+([\d.]+)/i, /Insulin[\s:]+([\d.]+)/i]);
  result.triglycerides = pickNumber(text, [/Triglycerides[\s:]+([\d.]+)/i]);
  result.hdl = pickNumber(text, [/HDL[\s:]+([\d.]+)/i]);
  result.ldl = pickNumber(text, [/LDL[\s:]+([\d.]+)/i]);

  const parsed = withConfidence(result);
  return parsed.confidence.overall > 0 ? parsed : null;
}

/** Try deterministic parse from PDF base64; null → use AI fallback. */
export function tryDeterministicLabParse(base64: string): ParsedLabResult | null {
  const text = extractPdfTextLayer(base64);
  if (!text || text.length < 40) return null;

  const format = detectLabFormat(text);
  if (format === "zrt") return parseZrtTextLayer(text);
  if (format === "labcorp") return parseLabcorpTextLayer(text);
  return null;
}

/** Test helper — parse pre-extracted fixture text. */
export function parseLabTextFixture(text: string): ParsedLabResult | null {
  const format = detectLabFormat(text);
  if (format === "zrt") return parseZrtTextLayer(text);
  if (format === "labcorp") return parseLabcorpTextLayer(text);
  return null;
}
