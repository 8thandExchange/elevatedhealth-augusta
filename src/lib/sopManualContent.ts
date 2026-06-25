/**
 * EHA Standard Operating Procedures — structured content.
 * Financial figures are resolved at render time via formularyEconomics + stripeConfig.
 */

export const SOP_MANUAL_META = {
  title: "Elevated Health Augusta — Standard Operating Procedures",
  version: "1.1.0",
  effectiveDate: "2026-06-15",
  owner: "Troy Akers, DO / Dennis Williams",
  classification: "Internal — staff & management only",
  address: "7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809",
  phone: "(706) 760-3470",
  domain: "elevatedhealthaugusta.com",
} as const;

export interface AlgorithmStep {
  step: string;
  action: string;
  /** IF condition for decision steps */
  if?: string;
  then?: string;
  else?: string;
  stop?: boolean;
  /** Journey phase label (master algorithm) */
  phase?: string;
  /** Stripe charge to confirm at this step */
  charge?: string;
  /** Ethical upsell / cross-sell opportunity */
  upsell?: string;
}

export interface SOPAlgorithm {
  id: string;
  title: string;
  purpose: string;
  owner: string;
  steps: AlgorithmStep[];
  featured?: boolean;
}

export interface SOPSection {
  id: string;
  number: string;
  title: string;
  summary: string;
  algorithmIds?: string[];
  bullets?: string[];
}

export interface JourneyPhase {
  id: string;
  label: string;
  title: string;
  owner: string;
  goal: string;
}

/** Visual timeline for the master patient journey */
export const PATIENT_JOURNEY_PHASES: JourneyPhase[] = [
  { id: "arrive", label: "0", title: "Arrival", owner: "Front desk", goal: "Warm welcome, identify intent" },
  { id: "counsel", label: "1", title: "Counsel & discover", owner: "Kristen / Caroline", goal: "Educate on EHA services; no price guessing" },
  { id: "consult", label: "2", title: "Wellness Assessment", owner: "Kristen + RN", goal: "Charge $79; intake + lane lock" },
  { id: "labs", label: "3", title: "Labs ordered & drawn", owner: "Caroline", goal: "Correct panel, correct charge" },
  { id: "review", label: "4", title: "Provider review", owner: "Provider MD", goal: "Clinical decision within 5–7 days" },
  { id: "enroll", label: "5", title: "Program enrollment", owner: "Kristen", goal: "Stripe subscription + consents" },
  { id: "rx", label: "6", title: "Prescribe & ship", owner: "Provider + Kristen", goal: "Vendor routing ALGO-003" },
  { id: "followup", label: "7", title: "Follow-up cadence", owner: "Caroline + Kristen", goal: "RN check-ins, quarterly labs" },
  { id: "retain", label: "8", title: "Retain & grow", owner: "All staff", goal: "Verify billing + ethical upsell" },
];

export interface UpsellRow {
  phase: string;
  trigger: string;
  offer: string;
  charge: string;
  script: string;
}

export const UPSELL_MATRIX: UpsellRow[] = [
  {
    phase: "Arrival (IV walk-in)",
    trigger: "Patient books Myers / NAD+ only",
    offer: "Mention ELEVATED Wellness or peptide stacks at results review",
    charge: "IV today + program later",
    script: "Many IV guests eventually join a program once they see their labs — we can start with today’s drip and book a $79 assessment when you’re ready.",
  },
  {
    phase: "Counseling",
    trigger: "Fatigue, weight, libido, or brain fog",
    offer: "ELEVATED program path vs à la carte",
    charge: "$79 consult → program $199–$449/mo",
    script: "Our programs bundle medication, RN check-ins, quarterly labs, and messaging — usually less than piecing fills together à la carte.",
  },
  {
    phase: "Wellness Assessment",
    trigger: "Patient hesitates on labs",
    offer: "Expanded panel if GLP-1 / weight candidacy",
    charge: "$199 Comprehensive vs $299 Expanded",
    script: "For weight or metabolic goals we recommend the Expanded panel so the physician has the full picture — it saves a redraw later.",
  },
  {
    phase: "Lab draw",
    trigger: "Partner or friend waiting",
    offer: "IV Lounge add-on same visit",
    charge: "Myers $185, pushes $25–50",
    script: "While labs process, many members grab a hydration drip in our lounge — walk-ins welcome.",
  },
  {
    phase: "Results review",
    trigger: "Low T + high body fat",
    offer: "TRT + GLP-1 (advanced recomposition support in-program)",
    charge: "$249/mo TRT or $349–$449/mo GLP-1",
    script: "Your labs support hormone optimization; if body composition is also a goal, your physician can layer advanced recomposition support inside the GLP-1 program — reviewed in person.",
  },
  {
    phase: "Results review",
    trigger: "Perimenopause symptoms, normal T",
    offer: "ELEVATED HRT + optional Vitality stack",
    charge: "$229/mo HRT; Vitality $299–399/mo",
    script: "Bi-Est and progesterone are our standard — many women add the Vitality stack for sleep and recovery once stable on hormones.",
  },
  {
    phase: "Enrollment",
    trigger: "Patient on single program",
    offer: "Second program only if clinically indicated",
    charge: "Additional subscription SKU",
    script: "We can layer GLP-1 after TRT stabilizes — physician will confirm timing at your next check-in.",
  },
  {
    phase: "Follow-up (RN)",
    trigger: "Recovery, injury, or athletic goal",
    offer: "BPC-157 / TB-500 recovery stack",
    charge: "$249–329/mo",
    script: "For tissue repair we use a named Healing stack — physician can add it to your plan at the next review.",
  },
  {
    phase: "Follow-up (quarterly)",
    trigger: "Labs due, patient active",
    offer: "In-program labs included; IV add-on",
    charge: "$0 panel if in-program; IV member 20% off add-ons",
    script: "Your quarterly labs are included — while you’re here, members get 20% off IV add-ons.",
  },
  {
    phase: "Renewal / billing",
    trigger: "Stripe payment failed",
    offer: "Resolve card + confirm program still fits",
    charge: "Recurring program charge",
    script: "Your membership renews monthly — let’s update your card and confirm your protocol still matches your goals.",
  },
];

export interface ChargeCheckpoint {
  step: string;
  event: string;
  stripeSku: string;
  amount: string;
  verify: string;
}

export const CHARGE_CHECKPOINTS: ChargeCheckpoint[] = [
  {
    step: "C-01",
    event: "Wellness Assessment booked",
    stripeSku: "CORE_SERVICES.wellnessAssessment",
    amount: "$79",
    verify: "Stripe receipt + patient.elevated_membership_status unchanged until program enroll",
  },
  {
    step: "C-02",
    event: "Lab panel at visit",
    stripeSku: "CORE_SERVICES.comprehensivePanel OR expandedPanel",
    amount: "$199 or $299",
    verify: "Panel matches protocol (TRT/HRT → Comprehensive; GLP-1/weight → Expanded)",
  },
  {
    step: "C-03",
    event: "Program enrollment",
    stripeSku: "ELEVATED_PROGRAMS.*",
    amount: "$199–$449/mo",
    verify: "Correct program SKU; subscription active in Stripe; webhook updated patient record",
  },
  {
    step: "C-04",
    event: "À la carte medication fill",
    stripeSku: "MEDICATION_FILLS.*",
    amount: "Per fill price",
    verify: "If patient has matching program, fill should be $0 incremental — do not double-charge",
  },
  {
    step: "C-05",
    event: "IV Lounge walk-in",
    stripeSku: "IV drip / push checkout",
    amount: "Menu price; member −20% on add-ons",
    verify: "Member discount applied once; receipt matches IV menu",
  },
  {
    step: "C-06",
    event: "Metabolic peptide / gated retatrutide fill",
    stripeSku: "Metabolic à la carte (SS-31, AOD-9604, etc.); retatrutide gated",
    amount: "Per fill price",
    verify: "Provider-directed à la carte; retatrutide gated/physician-selected under GLP-1 consent",
  },
  {
    step: "C-07",
    event: "Quarterly labs (in-program)",
    stripeSku: "Included in program",
    amount: "$0 to patient",
    verify: "Do not run panel checkout if active ELEVATED program covers labs",
  },
  {
    step: "C-08",
    event: "Late cancel / no-show rebooking fee",
    stripeSku: "CORE_SERVICES.rebookingFee",
    amount: "$99",
    verify:
      "Confirm 24-hour rule vs scheduled time. Late cancel or no-show: set rebooking_fee_required, patient pays via create-rebooking-checkout before schedule unlocks. IV refund eligible only if 24+ hr notice and service not rendered — process Stripe refund from original session; note refund ID in chart. Notify patient by email/SMS.",
  },
];

export const SOP_ALGORITHMS: SOPAlgorithm[] = [
  {
    id: "ALGO-000",
    title: "Master patient journey — arrival through follow-up",
    purpose:
      "End-to-end workflow: counsel → labs → review → prescribe → follow-up. Every step includes billing verification and ethical upsell checkpoints.",
    owner: "All staff",
    featured: true,
    steps: [
      // Phase 0 — Arrival
      {
        step: "0.1",
        phase: "Arrival",
        action: "Greet patient. Confirm name, DOB, and reason for visit. Offer water; direct to waiting area if consult not ready.",
      },
      {
        step: "0.2",
        phase: "Arrival",
        if: "Walk-in IV only (no consult)",
        then: "→ Lane A: IV Lounge menu. Skip to ALGO-000 step 8.x for IV billing. Still mention programs softly (upsell).",
        else: "→ Continue Phase 1 counseling",
      },
      // Phase 1 — Counsel
      {
        step: "1.1",
        phase: "Counsel & discover",
        action:
          "Use the PUBLIC MENU (4 ELEVATED programs + IV + 3 peptide stacks). Explain: physician-owned, cash-pay, 503A-sourced compounds, Evans GA location.",
        upsell: "Lead with program value — medication + RN + labs + messaging — not à la carte SKUs.",
      },
      {
        step: "1.2",
        phase: "Counsel & discover",
        action: "Ask open questions: primary goal, timeline, prior treatments, medications, allergies, pregnancy status if relevant.",
      },
      {
        step: "1.3",
        phase: "Counsel & discover",
        if: "Symptoms suggest hormones (fatigue, libido, mood, hot flashes, low T symptoms)",
        then: "Counsel: ELEVATED TRT ($249/mo) or ELEVATED HRT ($229/mo). Path starts with $79 Wellness Assessment.",
        else: "Continue symptom mapping",
      },
      {
        step: "1.4",
        phase: "Counsel & discover",
        if: "Symptoms suggest weight / metabolic (BMI concern, insulin resistance, prior GLP-1)",
        then: "Counsel: ELEVATED GLP-1 (semaglutide $349/mo · tirzepatide $449/mo). $79 consult first.",
        upsell: "Advanced recomposition support (lean-mass/metabolic peptides; gated retatrutide) is layered inside the GLP-1 program at the physician's discretion — reviewed in person.",
      },
      {
        step: "1.5",
        phase: "Counsel & discover",
        if: "Recovery, longevity, cognitive, or athletic performance",
        then: "Counsel: Named stacks (Restore, Healing, Vitality) or ELEVATED Wellness ($199/mo). Requires consult-gated path.",
      },
      {
        step: "1.6",
        phase: "Counsel & discover",
        if: "IV hydration, immunity, hangover, NAD+ interest only",
        then: "Lane A IV menu. No consult required. Mention $79 assessment if they ask about hormones/weight later.",
      },
      {
        step: "1.7",
        phase: "Counsel & discover",
        action: "Do NOT quote legacy tiers, ketamine, or pass-through pharmacy pricing. Use stripeConfig / staff cheatsheet only.",
        stop: false,
      },
      // Phase 2 — Book consult
      {
        step: "2.1",
        phase: "Wellness Assessment",
        if: "Patient ready for Lane B (consult-gated)",
        then: "Book appointment. Run create-consultation-checkout → $79 Wellness Assessment.",
        charge: "C-01: $79 via Stripe before or at check-in",
      },
      {
        step: "2.2",
        phase: "Wellness Assessment",
        action: "Collect intake: contact, pharmacy, emergency contact, consent links (portal). Credit $79 toward program if they enroll within 30 days.",
      },
      {
        step: "2.3",
        phase: "Wellness Assessment",
        action: "RN/Provider Wellness Assessment: vitals, history, physical as indicated, document candidacy for program(s).",
        charge: "Confirm C-01 posted — no duplicate consult charge",
      },
      // Phase 3 — Labs
      {
        step: "3.1",
        phase: "Labs",
        if: "TRT or HRT candidacy",
        then: "Order Comprehensive Wellness Panel ($199). LabCorp requisition in-office draw.",
        charge: "C-02: $199 Comprehensive",
      },
      {
        step: "3.2",
        phase: "Labs",
        if: "GLP-1 candidacy",
        then: "Order Expanded Panel ($299) — metabolic + safety markers.",
        charge: "C-02: $299 Expanded",
      },
      {
        step: "3.3",
        phase: "Labs",
        if: "Advanced recomposition candidacy (GLP-1 lane)",
        then: "Order Expanded Panel ($299). LabCorp requisition — weight-optimization slug.",
        charge: "C-02: $299 Expanded",
      },
      {
        step: "3.4",
        phase: "Labs",
        if: "Peptide-only / Wellness path",
        then: "Comprehensive ($199) unless provider orders Expanded for specific markers.",
      },
      {
        step: "3.5",
        phase: "Labs",
        action: "Caroline draws labs same visit when possible. Label tubes; batch LabCorp pickup per clinic schedule.",
        upsell: "Offer IV drip while waiting if walk-in friendly — Lane A add-on revenue.",
      },
      {
        step: "3.6",
        phase: "Labs",
        action: "Log lab order in chart. Expected turnaround 3–5 business days (LabCorp).",
      },
      // Phase 4 — Review
      {
        step: "4.1",
        phase: "Provider review",
        action: "Provider reviews labs within 5–7 business days of draw. Flag critical values same day.",
      },
      {
        step: "4.2",
        phase: "Provider review",
        if: "Labs contraindicate treatment (e.g., elevated PSA, Hct >54, pregnancy)",
        then: "Phone patient; document deferral or referral. Do NOT enroll or prescribe. Charge: no program SKU.",
        stop: true,
      },
      {
        step: "4.3",
        phase: "Provider review",
        if: "Male — low T pattern + shared decision for TRT",
        then: "Approve ELEVATED TRT enrollment → ALGO-005 protocol.",
        upsell: "If visceral fat elevated, discuss GLP-1 or metabolic stack at results call.",
      },
      {
        step: "4.4",
        phase: "Provider review",
        if: "Female — BHRT candidacy",
        then: "Approve ELEVATED HRT → ALGO-004 protocol.",
        upsell: "Vitality stack if sleep/recovery goals.",
      },
      {
        step: "4.5",
        phase: "Provider review",
        if: "GLP-1 candidacy (semaglutide or tirzepatide)",
        then: "Approve ELEVATED GLP-1 → compound via FCC.",
      },
      {
        step: "4.6",
        phase: "Provider review",
        if: "Advanced recomposition candidacy + consents on file",
        then: "Approve advanced recomposition support within ELEVATED GLP-1 (gated retatrutide per GLP-1 consent Section 11A) → ALGO-006.",
      },
      {
        step: "4.7",
        phase: "Provider review",
        if: "Labs optimal, patient not ready for program",
        then: "Offer ELEVATED Wellness ($199/mo) or retest in 3–6 months. Schedule follow-up.",
      },
      {
        step: "4.8",
        phase: "Provider review",
        action: "Kristen schedules results review call or in-person. Use CORE_SERVICES.phoneFollowUp ($99) only per no-show / extended MD phone policy.",
      },
      // Phase 5 — Enroll
      {
        step: "5.1",
        phase: "Enrollment",
        action: "Present program recommendation with first-month total (consult + labs + month 1 program). See financial appendix.",
        charge: "C-03: correct ELEVATED_PROGRAMS Stripe checkout",
      },
      {
        step: "5.2",
        phase: "Enrollment",
        action: "Patient signs informed consents (hormone, peptide research, GLP-1 as applicable). Portal capture preferred.",
      },
      {
        step: "5.3",
        phase: "Enrollment",
        action: "Run program checkout (create-trt-checkout, membership flow, or program-specific edge function). Confirm webhook updates patient record.",
        charge: "Verify subscription active; elevated_membership_status / program field set",
      },
      {
        step: "5.4",
        phase: "Enrollment",
        if: "Patient declines program",
        then: "Offer à la carte fill pricing with member vs non-member paths. Document shared decision.",
        upsell: "Show first-month economics — program usually wins vs 2–3 à la carte fills.",
      },
      // Phase 6 — Prescribe
      {
        step: "6.1",
        phase: "Prescribe & ship",
        action: "Provider writes protocol per ALGO-004, ALGO-005, or ALGO-006. One default path — escalate only if needed.",
      },
      {
        step: "6.2",
        phase: "Prescribe & ship",
        action: "Route Rx per ALGO-003: Hormones → Custom Pharmacy Evans (fax). Metabolic/GC peptides → GC. IV/core → FCC.",
      },
      {
        step: "6.3",
        phase: "Prescribe & ship",
        action: "Kristen confirms fax/portal submission. Track pharmacy_id on order. GC: confirm COA on file.",
      },
      {
        step: "6.4",
        phase: "Prescribe & ship",
        action: "Notify patient: shipment ETA, injection teaching if TRT, storage for refrigerated items.",
        charge: "C-04: no separate fill charge if medication included in active program",
      },
      // Phase 7 — Follow-up
      {
        step: "7.1",
        phase: "Follow-up",
        action: "Week 2–4 RN check-in (phone or in-office): tolerability, side effects, adherence.",
      },
      {
        step: "7.2",
        phase: "Follow-up",
        action: "Week 8–12 provider review: repeat labs if protocol requires; titrate dose.",
        charge: "C-07: quarterly labs $0 if in-program — do not double bill",
      },
      {
        step: "7.3",
        phase: "Follow-up",
        action: "Ongoing: messaging via portal; schedule quarterly labs + RN visits per program inclusion.",
        upsell: "IV member discount 20% on add-ons; peptide stack add-on if new goals emerge",
      },
      {
        step: "7.4",
        phase: "Follow-up",
        if: "Patient misses follow-up",
        then: "Kristen outreach ×2. Document. Apply rebooking policy if applicable (C-08).",
      },
      // Phase 8 — Retain & grow
      {
        step: "8.1",
        phase: "Retain & grow",
        action: "Monthly: verify Stripe subscription healthy (no failed payments). Resolve before next fill ships.",
        charge: "C-03 renewal — confirm amount matches enrolled program",
      },
      {
        step: "8.2",
        phase: "Retain & grow",
        action: "At every touchpoint, consult UPSELL MATRIX — one ethical offer max; never pressure.",
      },
      {
        step: "8.3",
        phase: "Retain & grow",
        action: "Annual peptide re-consent; protocol changes → re-acknowledgment.",
      },
      {
        step: "8.4",
        phase: "Retain & grow",
        if: "Margin on custom quote <15%",
        then: "ALGO-008 — Dennis approval before discount.",
      },
      {
        step: "8.5",
        phase: "Retain & grow",
        action: "Document outcome in chart. Loop to Phase 7 at next scheduled touchpoint.",
        stop: true,
      },
      // IV Lane branch (8.x)
      {
        step: "8.IV.1",
        phase: "IV Lounge",
        action: "Present IV menu: Myers, NAD+ 250/500, pushes, custom build from add-ons.",
        charge: "C-05: menu price at checkout",
      },
      {
        step: "8.IV.2",
        phase: "IV Lounge",
        action: "Caroline administers per standing orders. Document lot numbers.",
        upsell: "Book $79 Wellness Assessment before they leave if any hormone/weight interest surfaced",
      },
      {
        step: "8.IV.3",
        phase: "IV Lounge",
        if: "Active ELEVATED program member",
        then: "Apply 20% member discount on IV add-ons (not base program meds).",
        charge: "Verify discount applied once",
      },
    ],
  },
  {
    id: "ALGO-001",
    title: "New patient — lane assignment",
    purpose: "Route walk-in vs consult-gated paths within 60 seconds of inquiry.",
    owner: "Front desk / Kristen",
    steps: [
      { step: "1", action: "Ask: What brings you in today?" },
      {
        step: "2",
        if: "Patient wants IV hydration, hangover, immunity, or NAD+ drip only",
        then: "→ Lane A: /iv-lounge. Book IV slot. No $79 consult required.",
        else: "→ Continue to step 3",
      },
      {
        step: "3",
        if: "Patient mentions hormones, weight loss, peptides, or metabolic stack",
        then: "→ Lane B: Book $79 Wellness Assessment (create-consultation-checkout).",
        else: "→ Offer Wellness Assessment or IV menu; do not quote program prices without consult",
      },
      { step: "4", action: "Collect intake contact. Send portal link if consult booked.", stop: true },
    ],
  },
  {
    id: "ALGO-002",
    title: "Post-consult — program enrollment",
    purpose: "Standard path from $79 consult to recurring program after labs.",
    owner: "Kristen + Provider MD",
    steps: [
      { step: "1", action: "Wellness Assessment completed in-office ($79 charged via Stripe)." },
      { step: "2", action: "Draw baseline labs (Comprehensive $199 or Expanded $299 per protocol)." },
      { step: "3", action: "Provider reviews labs within 5–7 business days." },
      {
        step: "4",
        if: "Male + low T pattern + shared decision",
        then: "Enroll ELEVATED TRT ($249/mo) — create-trt-checkout or membership flow.",
      },
      {
        step: "5",
        if: "Female + BHRT candidacy",
        then: "Enroll ELEVATED HRT ($229/mo) — hormone protocol ALGO-004.",
      },
      {
        step: "6",
        if: "GLP-1 candidacy (semaglutide or tirzepatide)",
        then: "Enroll ELEVATED GLP-1 (semaglutide $349/mo · tirzepatide $449/mo).",
      },
      {
        step: "7",
        if: "Advanced recomposition / fat-loss candidacy + consents signed",
        then: "Enroll ELEVATED GLP-1 (semaglutide $349/mo · tirzepatide $449/mo); layer advanced recomposition support per ALGO-006.",
      },
      { step: "8", action: "Document protocol in chart. Route Rx per ALGO-003.", stop: true },
    ],
  },
  {
    id: "ALGO-003",
    title: "Prescription — vendor & fulfillment channel",
    purpose: "Every Rx goes to exactly one vendor. Never guess.",
    owner: "Provider + Kristen",
    steps: [
      {
        step: "1",
        if: "Hormone Rx (Bi-Est, progesterone, test cyp, pellets, anastrozole, HCG)",
        then: "Vendor: Custom Pharmacy of Evans. Channel: fax (send-rx-fax). Default.",
      },
      {
        step: "2",
        if: "Metabolic stack OR retatrutide OR SS-31 OR tesamorelin OR CJC/Ipamorelin (stack line)",
        then: "Vendor: GC Scientific partner 503A. Channel: GC portal / account manager.",
      },
      {
        step: "3",
        if: "IV premix, glutathione, sermorelin, NAD+, healing stack, AOD, SLU, GLP-1 backup",
        then: "Vendor: FCC. Channel: FormuConnect portal.",
      },
      {
        step: "3b",
        if: "Custom Pharmacy or GC backordered on hormone creams/GLP-1, OR patient wants ODT/oral GLP-1 or nasal modality",
        then: "Vendor: Empower Pharmacy (503A backup, patient-specific bill-clinic). NOT for research/recovery/metabolic peptides — those stay GC/PATH.",
      },
      {
        step: "4",
        if: "Patient requests FDA patch/gel (Vivelle, AndroGel, etc.)",
        then: "Vendor: DrFirst Rcopia → retail pharmacy. Not compound.",
      },
      { step: "5", action: "Log pharmacy_id on order row. Confirm COA on file for GC batches.", stop: true },
    ],
  },
  {
    id: "ALGO-004",
    title: "Female BHRT — standard protocol",
    purpose: "One default stack; escalate only on intolerance or patient request.",
    owner: "Provider MD",
    steps: [
      { step: "1", action: "Start Bi-Est transdermal cream (80:20 or 50:50). Custom Pharmacy Evans." },
      { step: "2", action: "Add oral micronized progesterone 100–200 mg at bedtime if uterus intact." },
      {
        step: "3",
        if: "Vitality/libido labs support micro-dose T",
        then: "Add women's testosterone cream 0.5–1 mg/g.",
        else: "Hold T; recheck at 8–12 weeks",
      },
      {
        step: "4",
        if: "Cream intolerance OR patient prefers patch",
        then: "Escalate: DrFirst → FDA patch, OR troches (FCC/Custom).",
      },
      { step: "5", action: "Quarterly labs + RN check-in included in ELEVATED HRT.", stop: true },
    ],
  },
  {
    id: "ALGO-005",
    title: "Male TRT — standard protocol",
    purpose: "Injectable-first; avoid option paralysis.",
    owner: "Provider MD",
    steps: [
      { step: "1", action: "Testosterone cypionate 100–200 mg/mL, weekly IM or subQ. Custom Pharmacy Evans." },
      {
        step: "2",
        if: "Estradiol elevated on labs",
        then: "Add anastrozole 0.25–0.5 mg 2×/week.",
      },
      {
        step: "3",
        if: "Fertility preservation requested",
        then: "Add HCG or discuss enclomiphene alternative (not classic TRT).",
      },
      {
        step: "4",
        if: "Needle refusal",
        then: "Escalate: testosterone cream OR DrFirst brand gel.",
      },
      {
        step: "5",
        if: "Patient requests pellets",
        then: "Shared decision only — document difficulty titrating after placement.",
      },
      { step: "6", action: "Monitor PSA, hematocrit, lipids per TRT safety protocol.", stop: true },
    ],
  },
  {
    id: "ALGO-006",
    title: "Advanced recomposition support (within ELEVATED GLP-1)",
    purpose: "Physician-directed, gated support layered on the GLP-1 program. The standalone $599 metabolic program was retired 2026-06-24.",
    owner: "Provider MD + Kristen",
    steps: [
      { step: "1", action: "Confirm GLP-1 consent (incl. Section 11A retatrutide disclosure) signed in portal." },
      { step: "2", action: "Baseline Expanded Panel ($299) drawn in-office — weight-optimization slug." },
      { step: "3", action: "Enroll ELEVATED GLP-1 (semaglutide $349/mo · tirzepatide $449/mo) via Stripe. Advanced support is à la carte / gated, not a separate program SKU." },
      { step: "4", action: "Anchor: semaglutide or tirzepatide per GLP-1 protocol. Retatrutide ONLY if gated/physician-selected — titrate from 0.5 mg/wk." },
      { step: "5", action: "Add SS-31 + NAD+ when anchor tolerated (à la carte, provider-directed)." },
      { step: "6", action: "Add CJC/Ipamorelin + tesamorelin for lean mass when indicated." },
      { step: "7", action: "Optional: AOD / SLU / 5-amino per physician — mostly FCC lines." },
      { step: "8", action: "Route GC lines through GC network; FCC for adjuncts.", stop: true },
    ],
  },
  {
    id: "ALGO-007",
    title: "Staff pricing quote",
    purpose: "Consistent quotes; member discount applied once.",
    owner: "All staff",
    steps: [
      { step: "1", action: "Lead with ELEVATED program price if patient qualifies for a program." },
      {
        step: "2",
        if: "Patient holds active ELEVATED program (TRT/HRT/GLP-1/Wellness/Metabolic)",
        then: "À la carte add-ons: 20% off per pricing.ts MEMBER_DISCOUNT_PERCENT.",
      },
      {
        step: "3",
        if: "Medication fill matches patient's program (e.g. test fill on TRT)",
        then: "Included — $0 incremental for that fill.",
      },
      { step: "4", action: "Never quote legacy tiers, pass-through pharmacy language, or ketamine." },
      { step: "5", action: "Use /staff-pricing-cheatsheet or live stripeConfig — not memory.", stop: true },
    ],
  },
  {
    id: "ALGO-008",
    title: "Margin review — flag before discounting",
    purpose: "Protect clinic viability on thin-SKU quotes.",
    owner: "Dennis / Kristen",
    steps: [
      { step: "1", action: "Open /formulary-economics before custom pricing or comps." },
      {
        step: "2",
        if: "Primary margin < 15% on quoted SKU",
        then: "Do NOT discount further without physician + Dennis approval.",
      },
      {
        step: "3",
        if: "Metabolic stack",
        then: "GC COGS model required — never price against FCC full-dose COGS.",
      },
      {
        step: "4",
        if: "SS-31 à la carte at therapeutic daily dose",
        then: "Flag: multiple vials/month — prefer bundle or raise quote.",
      },
      { step: "5", action: "Document approval in chart if exception granted.", stop: true },
    ],
  },
];

export const SOP_SECTIONS: SOPSection[] = [
  {
    id: "master",
    number: "1",
    title: "Master patient journey",
    summary:
      "The complete algorithm from front-door greeting through long-term follow-up. Every phase includes what to say, what to charge, and where to ethically upsell. Sub-algorithms ALGO-001–008 are quick-reference extracts.",
    algorithmIds: ["ALGO-000"],
  },
  {
    id: "upsell",
    number: "2",
    title: "Upsell & growth matrix",
    summary:
      "Ethical cross-sell triggers at each touchpoint. One offer per interaction maximum. Never pressure — align offer to stated patient goals.",
  },
  {
    id: "billing",
    number: "3",
    title: "Billing verification checkpoints",
    summary:
      "Eight charge events (C-01 through C-08). Kristen verifies Stripe receipt matches chart before any Rx ships or subscription renews.",
  },
  {
    id: "lanes",
    number: "4",
    title: "Revenue lanes",
    summary: "Two booking lanes — never mix the workflow.",
    bullets: [
      "Lane A — IV Lounge: open booking, cash at checkout, FCC compounds + Henry Schein supplies.",
      "Lane B — Consult-gated: $79 consult → labs → ELEVATED program ($199–$449/mo).",
      "Hidden at launch: sexual wellness, hair restoration.",
      "Not offered: ketamine, Spravato. Retatrutide is gated/physician-only within the GLP-1 consent — never advertised, never the lead.",
    ],
    algorithmIds: ["ALGO-001"],
  },
  {
    id: "enrollment",
    number: "5",
    title: "Enrollment & onboarding",
    summary: "From first visit to first shipment.",
    algorithmIds: ["ALGO-002", "ALGO-006"],
  },
  {
    id: "clinical",
    number: "6",
    title: "Clinical defaults",
    summary: "Reduce option overload — one standard path per sex.",
    algorithmIds: ["ALGO-004", "ALGO-005"],
  },
  {
    id: "vendor",
    number: "7",
    title: "Vendor & fulfillment",
    summary: "GC (peptides/GLP-1) · FCC (IV/core) · Custom Pharmacy Evans (hormones) · Empower (503A backup: creams/GLP-1/ODT, not peptides).",
    algorithmIds: ["ALGO-003"],
  },
  {
    id: "financial",
    number: "8",
    title: "Financial reference",
    summary: "Cost → charge → margin. See live tables in Appendix A.",
    algorithmIds: ["ALGO-007", "ALGO-008"],
  },
  {
    id: "roles",
    number: "9",
    title: "Role responsibilities",
    summary: "Who owns each step.",
    bullets: [
      "Kristen: scheduling, enrollment, fax coordination, patient comms, lab requisitions, billing verification.",
      "Caroline: IV admin, phlebotomy, RN check-ins, standing-order tasks.",
      "Provider MD: protocol approval, lab review, Rx signing, escalations.",
      "Dennis: margin exceptions, vendor contracts, Stripe live mode, GC account.",
    ],
  },
];

export function getAlgorithmById(id: string): SOPAlgorithm | undefined {
  return SOP_ALGORITHMS.find((a) => a.id === id);
}

export function getFeaturedAlgorithm(): SOPAlgorithm | undefined {
  return SOP_ALGORITHMS.find((a) => a.featured);
}
