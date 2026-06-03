/**
 * LabCorp blood-work interpretation for provider chart (Phase B).
 * Units match lab_results columns: testosterone_t in ng/dL, estradiol_e2 in pg/mL, etc.
 */

export type LabValueStatus = "low" | "optimal" | "high" | "critical" | "unknown";
export type FindingPriority = "high" | "medium" | "low";
export type ProtocolConfidence = "standard" | "variable" | "high_stakes";

export type ClinicalProgramHint = "trt" | "bhrt" | "glp1" | "thyroid" | "monitoring";

export interface LabcorpLabValues {
  estradiol_e2?: number | null;
  progesterone_pg?: number | null;
  testosterone_t?: number | null;
  dhea_s?: number | null;
  tsh?: number | null;
  free_t3?: number | null;
  free_t4?: number | null;
  fasting_insulin?: number | null;
  a1c?: number | null;
  vitamin_d?: number | null;
  triglycerides?: number | null;
  hdl?: number | null;
  ldl?: number | null;
  hematocrit?: number | null;
  psa?: number | null;
  alt?: number | null;
  ast?: number | null;
  cortisol_morning?: number | null;
}

export interface LabFinding {
  field: string;
  label: string;
  value: number | null;
  unit: string;
  status: LabValueStatus;
  pattern: string;
  priority: FindingPriority;
  rationale: string;
}

export interface ProtocolSuggestion {
  key: string;
  title: string;
  confidence: ProtocolConfidence;
  rationale: string;
}

export interface LabcorpInterpretation {
  story: string;
  findings: LabFinding[];
  monitoringAlerts: string[];
  programHints: ClinicalProgramHint[];
  protocolSuggestions: ProtocolSuggestion[];
}

function isMale(gender: string): boolean {
  return gender.toLowerCase() === "male";
}

function pushFinding(
  findings: LabFinding[],
  args: Omit<LabFinding, "pattern"> & { pattern: string },
): void {
  findings.push(args);
}

function classify(
  value: number | null,
  low: number,
  high: number,
  criticalHigh?: number,
): LabValueStatus {
  if (value === null || Number.isNaN(value)) return "unknown";
  if (criticalHigh !== undefined && value >= criticalHigh) return "critical";
  if (value < low) return "low";
  if (value > high) return "high";
  return "optimal";
}

/** Build normalized values from a lab_results row. */
export function labResultRowToValues(row: Record<string, unknown>): LabcorpLabValues {
  const num = (k: string) => {
    const v = row[k];
    return typeof v === "number" ? v : v != null ? Number(v) : null;
  };
  return {
    estradiol_e2: num("estradiol_e2"),
    progesterone_pg: num("progesterone_pg"),
    testosterone_t: num("testosterone_t"),
    dhea_s: num("dhea_s"),
    tsh: num("tsh"),
    free_t3: num("free_t3"),
    free_t4: num("free_t4"),
    fasting_insulin: num("fasting_insulin"),
    a1c: num("a1c"),
    vitamin_d: num("vitamin_d"),
    triglycerides: num("triglycerides"),
    hdl: num("hdl"),
    ldl: num("ldl"),
    hematocrit: num("hematocrit"),
    psa: num("psa"),
    alt: num("alt"),
    ast: num("ast"),
    cortisol_morning: num("cortisol_morning"),
  };
}

export function analyzeLabcorpResults(
  values: LabcorpLabValues,
  gender: string,
  primaryProgram?: string | null,
): LabcorpInterpretation {
  const findings: LabFinding[] = [];
  const monitoringAlerts: string[] = [];
  const programHints = new Set<ClinicalProgramHint>();
  const protocolSuggestions: ProtocolSuggestion[] = [];
  const male = isMale(gender);

  if (male) {
    programHints.add("trt");
    const tStatus = classify(values.testosterone_t ?? null, 300, 900, 1200);
    if (tStatus === "low" || tStatus === "critical") {
      pushFinding(findings, {
        field: "testosterone_t",
        label: "Total Testosterone",
        value: values.testosterone_t ?? null,
        unit: "ng/dL",
        status: tStatus,
        pattern: "Low Testosterone (TRT candidate)",
        priority: "high",
        rationale:
          "Total testosterone below typical therapeutic range for men on optimization protocols. Consider compounded transdermal TRT after shared decision-making.",
      });
      protocolSuggestions.push({
        key: "male_trt_initiation",
        title: "Male TRT — transdermal testosterone",
        confidence: "standard",
        rationale: "Lab pattern supports TRT evaluation; confirm symptoms, sleep, and contraindications before prescribing.",
      });
    } else if (tStatus === "optimal") {
      pushFinding(findings, {
        field: "testosterone_t",
        label: "Total Testosterone",
        value: values.testosterone_t ?? null,
        unit: "ng/dL",
        status: "optimal",
        pattern: "Testosterone in range",
        priority: "low",
        rationale: "Total testosterone within common optimization window. Titrate based on symptoms and follow-up labs.",
      });
    } else if (tStatus === "high") {
      pushFinding(findings, {
        field: "testosterone_t",
        label: "Total Testosterone",
        value: values.testosterone_t ?? null,
        unit: "ng/dL",
        status: "high",
        pattern: "Elevated Testosterone",
        priority: "medium",
        rationale: "Elevated total testosterone — review dose, application site, and timing of draw if on therapy.",
      });
    }

    const e2Status = classify(values.estradiol_e2 ?? null, 20, 45, 60);
    if (e2Status === "high" || e2Status === "critical") {
      pushFinding(findings, {
        field: "estradiol_e2",
        label: "Estradiol",
        value: values.estradiol_e2 ?? null,
        unit: "pg/mL",
        status: e2Status,
        pattern: "Elevated Estradiol on TRT",
        priority: "high",
        rationale:
          "Estradiol elevation on TRT may warrant dose adjustment, aromatase strategy, or repeat timed labs — physician judgment required.",
      });
      protocolSuggestions.push({
        key: "trt_e2_management",
        title: "TRT — estradiol management review",
        confidence: "variable",
        rationale: "High-stakes hormone balance decision; do not auto-prescribe aromatase inhibitors.",
      });
    } else if (e2Status === "low") {
      pushFinding(findings, {
        field: "estradiol_e2",
        label: "Estradiol",
        value: values.estradiol_e2 ?? null,
        unit: "pg/mL",
        status: "low",
        pattern: "Low Estradiol",
        priority: "medium",
        rationale: "Very low estradiol on TRT can correlate with joint symptoms and mood changes; evaluate clinically.",
      });
    }

    const hctStatus = classify(values.hematocrit ?? null, 38, 52, 54);
    if (hctStatus === "high" || hctStatus === "critical") {
      monitoringAlerts.push(
        "Hematocrit elevated — TRT safety monitoring: consider dose reduction, therapeutic phlebotomy per protocol, repeat CBC.",
      );
      pushFinding(findings, {
        field: "hematocrit",
        label: "Hematocrit",
        value: values.hematocrit ?? null,
        unit: "%",
        status: hctStatus,
        pattern: "Polycythemia risk (TRT)",
        priority: "high",
        rationale: "Elevated hematocrit is a primary TRT safety endpoint.",
      });
    }

    if (values.psa != null && values.psa > 4) {
      monitoringAlerts.push("PSA > 4 ng/mL — urology discussion before intensifying TRT.");
      pushFinding(findings, {
        field: "psa",
        label: "PSA",
        value: values.psa,
        unit: "ng/mL",
        status: "high",
        pattern: "Elevated PSA",
        priority: "high",
        rationale: "Screening PSA above common threshold; clinical correlation required.",
      });
    }
  } else {
    programHints.add("bhrt");
    const e2Status = classify(values.estradiol_e2 ?? null, 30, 120);
    if (e2Status === "low") {
      pushFinding(findings, {
        field: "estradiol_e2",
        label: "Estradiol",
        value: values.estradiol_e2 ?? null,
        unit: "pg/mL",
        status: "low",
        pattern: "Low Estradiol (BHRT candidate)",
        priority: "high",
        rationale:
          "Estradiol below typical postmenopausal therapy targets for symptomatic women — consider Bi-Est or estradiol strategy per signed BHRT protocol.",
      });
      protocolSuggestions.push({
        key: "female_biest",
        title: "Female BHRT — Bi-Est cream",
        confidence: "variable",
        rationale: "Align dose with symptoms, age, and uterine status; progesterone protection if indicated.",
      });
    }

    const progStatus = classify(values.progesterone_pg ?? null, 50, 400);
    if (progStatus === "low") {
      pushFinding(findings, {
        field: "progesterone_pg",
        label: "Progesterone",
        value: values.progesterone_pg ?? null,
        unit: "pg/mL",
        status: "low",
        pattern: "Low Progesterone",
        priority: "medium",
        rationale: "Low progesterone may support sleep/anxiety-focused progesterone cream when clinically appropriate.",
      });
      protocolSuggestions.push({
        key: "female_progesterone",
        title: "Female BHRT — progesterone support",
        confidence: "standard",
        rationale: "Often paired with estrogen therapy when uterus intact or for sleep stack goals.",
      });
    }

    const ftStatus = classify(values.testosterone_t ?? null, 15, 70);
    if (ftStatus === "low") {
      pushFinding(findings, {
        field: "testosterone_t",
        label: "Total Testosterone",
        value: values.testosterone_t ?? null,
        unit: "ng/dL",
        status: "low",
        pattern: "Low Testosterone (female)",
        priority: "medium",
        rationale: "Low female testosterone may support micro-dose transdermal testosterone for vitality symptoms.",
      });
      protocolSuggestions.push({
        key: "female_testosterone_vitality",
        title: "Female vitality — low-dose testosterone cream",
        confidence: "variable",
        rationale: "Off-label micro-dosing; monitor lipids and voice changes.",
      });
    }
  }

  // Thyroid (both sexes)
  const tshStatus = classify(values.tsh ?? null, 0.5, 4.5, 8);
  if (tshStatus === "high") {
    programHints.add("thyroid");
    pushFinding(findings, {
      field: "tsh",
      label: "TSH",
      value: values.tsh ?? null,
      unit: "mIU/L",
      status: tshStatus,
      pattern: "Elevated TSH",
      priority: "medium",
      rationale: "TSH elevation suggests hypothyroid physiology — evaluate Free T4/T3 and symptoms before thyroid Rx.",
    });
    protocolSuggestions.push({
      key: "thyroid_evaluation",
      title: "Thyroid — further evaluation",
      confidence: "variable",
      rationale: "May need levothyroxine or compounded thyroid per protocol; repeat labs in 6–8 weeks if treating.",
    });
  }

  // GLP-1 / metabolic
  const a1cStatus =
    values.a1c == null
      ? "unknown"
      : values.a1c >= 6.5
        ? "high"
        : values.a1c >= 5.7
          ? "high"
          : "optimal";
  const insulinHigh = values.fasting_insulin != null && values.fasting_insulin > 15;

  if (a1cStatus === "high" || insulinHigh) {
    programHints.add("glp1");
    if (values.a1c != null && values.a1c >= 5.7) {
      pushFinding(findings, {
        field: "a1c",
        label: "HbA1c",
        value: values.a1c,
        unit: "%",
        status: values.a1c >= 6.5 ? "high" : "high",
        pattern: "Glycemic risk (GLP-1 consideration)",
        priority: values.a1c >= 6.5 ? "high" : "medium",
        rationale:
          values.a1c >= 6.5
            ? "HbA1c in diabetes range — GLP-1 therapy may be appropriate if no contraindications."
            : "HbA1c in prediabetes range — lifestyle plus GLP-1 may be discussed for weight/metabolic goals.",
      });
    }
    if (insulinHigh) {
      pushFinding(findings, {
        field: "fasting_insulin",
        label: "Fasting Insulin",
        value: values.fasting_insulin ?? null,
        unit: "µIU/mL",
        status: "high",
        pattern: "Insulin resistance pattern",
        priority: "medium",
        rationale: "Elevated fasting insulin supports insulin-resistance framing and GLP-1/shared lifestyle planning.",
      });
    }
    protocolSuggestions.push({
      key: "glp1_weight_optimization",
      title: "Weight optimization — compounded GLP-1",
      confidence: "standard",
      rationale:
        "Order semaglutide or tirzepatide via FCC after glp1 + off-label consents; titrate per clinic weight-loss protocol.",
    });
  }

  if (values.vitamin_d != null && values.vitamin_d < 30) {
    pushFinding(findings, {
      field: "vitamin_d",
      label: "Vitamin D",
      value: values.vitamin_d,
      unit: "ng/mL",
      status: "low",
      pattern: "Vitamin D insufficiency",
      priority: "low",
      rationale: "Vitamin D below 30 ng/mL — repletion may support mood, immunity, and bone health.",
    });
  }

  if (values.alt != null && values.alt > 40) {
    monitoringAlerts.push("ALT elevated — review medications, alcohol, and hepatic panel before GLP-1 or TRT intensification.");
  }
  if (values.ast != null && values.ast > 40) {
    monitoringAlerts.push("AST elevated — correlate with ALT and clinical context.");
  }

  if (primaryProgram === "weight_loss" || primaryProgram === "glp1") {
    programHints.add("glp1");
  }
  if (primaryProgram === "hormones" || primaryProgram === "hormone") {
    programHints.add(male ? "trt" : "bhrt");
  }

  findings.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  const story = buildStory(findings, monitoringAlerts, male);

  return {
    story,
    findings,
    monitoringAlerts,
    programHints: [...programHints],
    protocolSuggestions: dedupeProtocols(protocolSuggestions),
  };
}

function dedupeProtocols(protocols: ProtocolSuggestion[]): ProtocolSuggestion[] {
  const seen = new Set<string>();
  return protocols.filter((p) => {
    if (seen.has(p.key)) return false;
    seen.add(p.key);
    return true;
  });
}

function buildStory(findings: LabFinding[], alerts: string[], male: boolean): string {
  const high = findings.filter((f) => f.priority === "high");
  if (high.length === 0 && alerts.length === 0) {
    return male
      ? "Lab pattern is broadly within expected optimization windows. Continue current plan and repeat labs per protocol."
      : "Lab pattern does not show major hormone or metabolic flags. Continue shared decision-making and routine monitoring.";
  }
  const parts = high.slice(0, 3).map((f) => f.pattern);
  let s = `Key patterns: ${parts.join("; ")}.`;
  if (alerts.length > 0) {
    s += ` Safety: ${alerts[0]}`;
  }
  s += " All treatment decisions require physician review.";
  return s;
}

/** Persisted snapshot stored on lab_results.treatment_plan */
export interface LabInterpretationSnapshot {
  version: 1;
  engine: "labcorp";
  interpreted_at: string;
  interpretation: LabcorpInterpretation;
}

export function parseInterpretationSnapshot(
  treatmentPlan: unknown,
): LabInterpretationSnapshot | null {
  if (!treatmentPlan || typeof treatmentPlan !== "object") return null;
  const o = treatmentPlan as Record<string, unknown>;
  if (o.engine !== "labcorp" || o.version !== 1) return null;
  if (!o.interpretation || typeof o.interpretation !== "object") return null;
  return treatmentPlan as LabInterpretationSnapshot;
}
