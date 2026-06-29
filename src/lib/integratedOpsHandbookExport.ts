/**
 * Integrated Clinical Operations Handbook — business ops + SOPs + staff quick reference.
 * Generates downloadable Markdown and print-ready HTML.
 */
import {
  MEMBERSHIP_CALLOUTS,
  MEMBERSHIP_PLAN_ROWS,
  MEMBER_DISCOUNT_EXAMPLE_ROWS,
  OFFER_POLICY_ROWS,
  OPS_GUIDE_META,
  OPS_GUIDE_STATS,
  PROGRAM_ECONOMICS_ROWS,
  GLP1_FILL_ROWS,
  PEPTIDE_ALACARTE_ROWS,
  RECOVERY_PEPTIDE_ROWS,
  IV_DRIP_ROWS,
  IV_ADDON_ROWS,
  HORMONE_SOURCING_ROWS,
  LAB_PRICING_ROWS,
  LAB_COMPOSITION_ROWS,
  LAB_FREQUENCY_ROWS,
  VENDOR_SOURCING_ROWS,
  RECENT_CHANGE_ROWS,
  TIER_INCLUSION_ROWS,
} from "./businessOpsGuideContent";
import { CORE_SERVICES, ELEVATED_PROGRAMS, GLP1_PROGRAM_VARIANTS } from "./stripeConfig";
import {
  CHARGE_CHECKPOINTS,
  PATIENT_JOURNEY_PHASES,
  SOP_ALGORITHMS,
  SOP_MANUAL_META,
  SOP_SECTIONS,
  UPSELL_MATRIX,
  getAlgorithmById,
} from "./sopManualContent";
import {
  buildGoalLabTable,
  buildVendorRoutingTable,
  CHARGE_CHECKPOINTS as STAFF_CHARGE_CHECKPOINTS,
  CONSENT_CHECKLIST,
  LAB_REDIRECT_EXAMPLES,
  LANE_A_IV_STEPS,
  LANE_B_CONSULT_STEPS,
  NEVER_DO,
  NEVER_SAY,
  PATIENT_JOURNEY_STEPS,
  PRINTABLE_CHECKLIST,
  STAFF_OPENING_SCRIPT,
} from "./staffSystemGuideContent";
import { allEconomicsRows, fmtPct, fmtUsd } from "./formularyEconomics";
import { buildSOPManualMarkdown } from "./sopManualExport";

export const HANDBOOK_FILENAME_BASE = `EHA-Clinical-Operations-Handbook-v${OPS_GUIDE_META.version}-${OPS_GUIDE_META.effectiveDate}`;

export const HANDBOOK_PDF_PATH = `/downloads/${HANDBOOK_FILENAME_BASE}.pdf`;

function tableMd(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  const head = `| ${headers.join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
  return [head, sep, body].join("\n");
}

function buildBusinessOpsMarkdown(): string {
  const parts = [
    "# Part I — Business Operations Reference",
    "",
    OPS_GUIDE_META.marginNote,
    "",
    `**At a glance:** ${OPS_GUIDE_STATS.membershipPlans} ELEVATED plans · ${OPS_GUIDE_STATS.priceRange}/mo · ${OPS_GUIDE_STATS.memberDiscount} member discount on à la carte · ${OPS_GUIDE_STATS.ivMenu}`,
    "",
    "## 1. The four membership plans",
    "",
    `> ${MEMBERSHIP_CALLOUTS.planIsProgram}`,
    "",
    tableMd(["Plan", "Price / mo", "Medication included", "Labs"], MEMBERSHIP_PLAN_ROWS),
    "",
    "### Exactly what each plan includes",
    "",
    tableMd(["Plan", "Included every month"], TIER_INCLUSION_ROWS),
    "",
    "### Shared by every plan",
    "",
    MEMBERSHIP_CALLOUTS.sharedBenefits,
    "",
    "### Paid separately (not in the membership)",
    "",
    MEMBERSHIP_CALLOUTS.paidSeparately,
    "",
    "### How the member discount works",
    "",
    `> ${MEMBERSHIP_CALLOUTS.memberDiscount}`,
    "",
    tableMd(["À la carte item", "Normal price", "Member pays", "Why"], MEMBER_DISCOUNT_EXAMPLE_ROWS),
    "",
    "### What happens if they cancel",
    "",
    `> ${MEMBERSHIP_CALLOUTS.cancelPolicy}`,
    "",
    "## 2. What we offer (and what we don't)",
    "",
    tableMd(["Topic", "What we do", "What we don't"], OFFER_POLICY_ROWS),
    "",
    "## 3. Plan economics (leadership view)",
    "",
    tableMd(
      ["Plan", "Price/mo", "Med cost", "+Labs/mo", "Total cost", "Gross", "Margin"],
      PROGRAM_ECONOMICS_ROWS,
    ),
    "",
    "## 4. Weight-loss (GLP-1) — per fill",
    "",
    tableMd(["Item", "Our cost", "Price", "Margin", "Role"], GLP1_FILL_ROWS),
    "",
    "## 5. Peptides à la carte",
    "",
    "### Standalone peptides",
    "",
    tableMd(["Item", "Our cost", "Price", "Margin"], PEPTIDE_ALACARTE_ROWS),
    "",
    "### Recovery (non-member / member)",
    "",
    tableMd(["Item", "Our cost", "Non-mbr", "Member", "NM %", "Mbr %"], RECOVERY_PEPTIDE_ROWS),
    "",
    "## 6. IV Lounge",
    "",
    "### Signature drips (walk-in, no consult — screening still required)",
    "",
    tableMd(["Drip", "Category", "What's in it", "Price"], IV_DRIP_ROWS),
    "",
    "### Add-on boosters",
    "",
    tableMd(["Add-on", "Our cost", "Price", "Margin"], IV_ADDON_ROWS),
    "",
    `> **NAD+ booster:** ${MEMBERSHIP_CALLOUTS.nadBooster}`,
    "",
    "## 7. Hormones & creams (what they cost us)",
    "",
    tableMd(["Item", "Where we get it", "Monthly cost", "Backup source"], HORMONE_SOURCING_ROWS),
    "",
    `> **Men's TRT delivery:** ${MEMBERSHIP_CALLOUTS.trtDelivery}`,
    "",
    "## 8. Lab panels",
    "",
    "### Pricing & margin",
    "",
    tableMd(
      ["Panel (tests)", "Our cost", "Non-mbr", "NM margin", "Member", "Mbr margin"],
      LAB_PRICING_ROWS,
    ),
    "",
    "### What's actually in each panel",
    "",
    tableMd(["Panel", "Tests included"], LAB_COMPOSITION_ROWS),
    "",
    "### How often each panel is run",
    "",
    tableMd(["Panel", "Frequency"], LAB_FREQUENCY_ROWS),
    "",
    `> ${MEMBERSHIP_CALLOUTS.labBundling}`,
    "",
    "## 9. Who we buy from",
    "",
    tableMd(["Category", "Primary source", "Backup"], VENDOR_SOURCING_ROWS),
    "",
    "## 10. What changed recently",
    "",
    tableMd(["Change", "What it means", "Status"], RECENT_CHANGE_ROWS),
    "",
    "---",
    "",
  ];
  return parts.join("\n");
}

function buildStaffQuickRefMarkdown(): string {
  const goalLab = buildGoalLabTable();
  const vendors = buildVendorRoutingTable();

  return [
    "# Part III — Staff Quick Reference",
    "",
    "## Opening script (front desk / RN)",
    "",
    `> "${STAFF_OPENING_SCRIPT}"`,
    "",
    "## Two booking lanes",
    "",
    "### Lane A — IV Lounge (walk-in)",
    "",
    ...LANE_A_IV_STEPS.map((s, i) => `${i + 1}. ${s}`),
    "",
    "### Lane B — Consult-gated (hormones, weight, peptides)",
    "",
    ...LANE_B_CONSULT_STEPS.map((s, i) => `${i + 1}. ${s}`),
    "",
    "## Patient journey (staff view)",
    "",
    tableMd(
      ["Phase", "Step", "Detail"],
      PATIENT_JOURNEY_STEPS.map((s) => [s.phase, s.title, s.detail]),
    ),
    "",
    "## Visual journey phases (SOP)",
    "",
    tableMd(
      ["#", "Phase", "Owner", "Goal"],
      PATIENT_JOURNEY_PHASES.map((p) => [p.label, p.title, p.owner, p.goal]),
    ),
    "",
    "## Goal → lab panel routing",
    "",
    tableMd(
      ["Patient goal", "Panel", "Patient charge", "Checkout tier"],
      goalLab.map((r) => [r.goalLabel, r.panelName, r.patientCharge, r.checkoutTier ?? "—"]),
    ),
    "",
    "## Lab safety redirects",
    "",
    tableMd(
      ["Goal", "Trigger", "Action"],
      LAB_REDIRECT_EXAMPLES.map((r) => [r.goal, r.trigger, r.action]),
    ),
    "",
    "## Vendor routing by lane",
    "",
    tableMd(
      ["Lane", "Vendor", "Note"],
      vendors.map((r) => [r.lane, r.vendor, r.note]),
    ),
    "",
    "## Consent checklist",
    "",
    tableMd(
      ["Consent", "When required"],
      CONSENT_CHECKLIST.map((r) => [r.consent, r.when]),
    ),
    "",
    "## Charge checkpoints (staff summary)",
    "",
    tableMd(
      ["When", "Item", "Amount", "Note"],
      STAFF_CHARGE_CHECKPOINTS.map((r) => [r.when, r.item, r.amount, r.note]),
    ),
    "",
    "## Never say",
    "",
    ...NEVER_SAY.map((s) => `- ${s}`),
    "",
    "## Never do",
    "",
    ...NEVER_DO.map((s) => `- ${s}`),
    "",
    "## Printable visit checklist",
    "",
    ...PRINTABLE_CHECKLIST.map((s, i) => `${i + 1}. ${s}`),
    "",
    "---",
    "",
  ].join("\n");
}

export function buildIntegratedOpsHandbookMarkdown(): string {
  const cover = [
    `# ${OPS_GUIDE_META.title}`,
    "",
    `> ${OPS_GUIDE_META.classification}`,
    "",
    "| Field | Value |",
    "|-------|-------|",
    `| Version | ${OPS_GUIDE_META.version} |`,
    `| Effective | ${OPS_GUIDE_META.effectiveDate} |`,
    `| Owner | ${OPS_GUIDE_META.owner} |`,
    `| Clinic | ${OPS_GUIDE_META.address} |`,
    `| Phone | ${OPS_GUIDE_META.phone} |`,
    `| Website | ${OPS_GUIDE_META.domain} |`,
    "",
    "**Contents:** Part I Business Operations · Part II Clinical SOPs & Algorithms · Part III Staff Quick Reference",
    "",
    "---",
    "",
  ].join("\n");

  const sopBody = buildSOPManualMarkdown()
    .replace(/^# .+\n/m, "# Part II — Clinical Operations & SOPs\n")
    .replace(/^> .+\n/m, "");

  return [cover, buildBusinessOpsMarkdown(), sopBody, buildStaffQuickRefMarkdown()].join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tableHtml(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  const th = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
  const trs = rows
    .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`)
    .join("");
  return `<table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
}

function calloutHtml(title: string, body: string, tone: "info" | "success" | "warning" = "info"): string {
  return `<div class="callout callout-${tone}"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(body)}</p></div>`;
}

function algorithmToHtml(algo: (typeof SOP_ALGORITHMS)[0]): string {
  let lastPhase = "";
  const steps = algo.steps
    .map((s) => {
      let phaseHtml = "";
      if (s.phase && s.phase !== lastPhase) {
        phaseHtml = `<h4>Phase: ${escapeHtml(s.phase)}</h4>`;
        lastPhase = s.phase;
      }
      let body = "";
      if (s.if) {
        body = `<strong>IF</strong> ${escapeHtml(s.if)}`;
        if (s.then) body += `<br><span class="phase">THEN →</span> ${escapeHtml(s.then)}`;
        if (s.else) body += `<br><span>ELSE →</span> ${escapeHtml(s.else)}`;
      } else {
        body = escapeHtml(s.action);
        if (s.stop) body += " <strong>[STOP]</strong>";
      }
      const charge = s.charge ? `<div class="charge">Charge: ${escapeHtml(s.charge)}</div>` : "";
      const upsell = s.upsell ? `<div class="upsell">Upsell: ${escapeHtml(s.upsell)}</div>` : "";
      return `${phaseHtml}<div class="algo-step"><strong>${escapeHtml(s.step)}.</strong> ${body}${charge}${upsell}</div>`;
    })
    .join("");
  return `<div class="algo"><div class="algo-head"><div class="id">${escapeHtml(algo.id)}</div><strong>${escapeHtml(algo.title)}</strong><br><small>${escapeHtml(algo.purpose)}</small></div><div class="algo-body">${steps}</div></div>`;
}

const HANDBOOK_CSS = `
  :root { --charcoal: #00477E; --camel: #0B7BB8; --bone: #FFFFFF; --surface: #F4F8FB; --muted: #5B6770; --border: #C9D4DD; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; color: var(--charcoal); background: var(--bone); margin: 0; padding: 2rem; line-height: 1.55; font-size: 11pt; }
  .cover { text-align: center; padding: 3rem 2rem; background: var(--charcoal); color: var(--bone); margin: -2rem -2rem 2rem; border-bottom: 4px solid var(--camel); page-break-after: always; }
  .cover .mark { display: inline-block; width: 64px; height: 64px; border: 2px solid var(--camel); border-radius: 4px; font-family: Georgia, serif; font-style: italic; font-size: 2.5rem; line-height: 64px; margin-bottom: 1rem; }
  .cover h1 { font-family: Georgia, serif; font-weight: 400; font-size: 1.85rem; margin: 0.5rem 0; }
  .cover h1 em { font-style: italic; }
  .cover .meta { font-size: 0.85rem; opacity: 0.85; margin-top: 1.5rem; line-height: 1.6; }
  .badge { display: inline-block; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--camel); margin-bottom: 0.5rem; }
  .part { page-break-before: always; }
  .part:first-of-type { page-break-before: avoid; }
  h2 { font-family: Georgia, serif; font-size: 1.35rem; border-bottom: 2px solid var(--camel); padding-bottom: 0.35rem; margin-top: 2rem; page-break-after: avoid; }
  h3 { font-family: Georgia, serif; font-size: 1.05rem; margin-top: 1.25rem; }
  h4 { font-size: 0.9rem; color: var(--camel); margin: 1rem 0 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
  table { width: 100%; border-collapse: collapse; font-size: 0.82rem; margin: 1rem 0; page-break-inside: avoid; }
  th, td { border: 1px solid #ccc; padding: 0.4rem 0.6rem; text-align: left; vertical-align: top; }
  th { background: var(--charcoal); color: var(--bone); }
  tr:nth-child(even) { background: rgba(184,149,106,0.08); }
  .callout { border-left: 4px solid var(--camel); padding: 0.75rem 1rem; margin: 1rem 0; background: rgba(255,255,255,0.5); page-break-inside: avoid; }
  .callout-success { border-color: #2d6a2d; }
  .callout-warning { border-color: #a67c00; }
  .callout p { margin: 0.35rem 0 0; font-size: 0.9rem; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin: 1rem 0; }
  .stat { background: white; border: 1px solid #ddd; padding: 0.75rem; text-align: center; border-radius: 4px; }
  .stat .val { font-size: 1.25rem; font-weight: 600; color: var(--camel); }
  .stat .lbl { font-size: 0.7rem; color: var(--muted); margin-top: 0.25rem; }
  .algo { border: 1px solid #ccc; border-radius: 6px; margin: 1rem 0; overflow: hidden; page-break-inside: avoid; }
  .algo-head { background: var(--charcoal); color: var(--bone); padding: 0.75rem 1rem; }
  .algo-head .id { font-size: 0.7rem; opacity: 0.7; text-transform: uppercase; }
  .algo-step { padding: 0.6rem 1rem; border-bottom: 1px solid #eee; font-size: 0.88rem; }
  .algo-step:last-child { border-bottom: none; }
  .charge { color: #1a5f1a; font-size: 0.8rem; margin-top: 0.25rem; }
  .upsell { color: #8b6914; font-size: 0.8rem; margin-top: 0.25rem; }
  .phase { font-weight: 600; color: var(--camel); }
  ul, ol { font-size: 0.9rem; }
  blockquote { border-left: 3px solid var(--camel); margin: 1rem 0; padding: 0.5rem 1rem; background: rgba(255,255,255,0.4); font-style: italic; }
  @media print {
    body { background: white; padding: 0; }
    .cover { margin: 0 0 1rem; }
    .no-print { display: none; }
  }
`;

export function buildIntegratedOpsHandbookHtml(): string {
  const master = getAlgorithmById("ALGO-000");
  const economics = allEconomicsRows().filter((r) => r.clientPriceCents > 0);
  const goalLab = buildGoalLabTable();
  const vendors = buildVendorRoutingTable();

  const sopSections = SOP_SECTIONS.map((sec) => {
    let html = `<h3>${escapeHtml(sec.number)}. ${escapeHtml(sec.title)}</h3><p>${escapeHtml(sec.summary)}</p>`;
    if (sec.bullets?.length) {
      html += `<ul>${sec.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`;
    }
    if (sec.algorithmIds?.length) {
      for (const id of sec.algorithmIds) {
        if (id === "ALGO-000") continue;
        const algo = getAlgorithmById(id);
        if (algo) html += algorithmToHtml(algo);
      }
    }
    return html;
  }).join("");

  const subAlgos = SOP_ALGORITHMS.filter((a) => a.id !== "ALGO-000").map(algorithmToHtml).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(OPS_GUIDE_META.title)} v${OPS_GUIDE_META.version}</title>
  <style>${HANDBOOK_CSS}</style>
</head>
<body>
  <div class="cover">
    <div class="mark">e</div>
    <div class="badge">${escapeHtml(OPS_GUIDE_META.classification)}</div>
    <h1>Clinical Operations<br><em>Handbook</em></h1>
    <p>Elevated Health Augusta · Evans, Georgia</p>
    <div class="meta">
      Version ${OPS_GUIDE_META.version} · Effective ${OPS_GUIDE_META.effectiveDate}<br>
      ${escapeHtml(OPS_GUIDE_META.owner)}<br>
      ${escapeHtml(OPS_GUIDE_META.address)} · ${escapeHtml(OPS_GUIDE_META.phone)}
    </div>
    <p class="no-print" style="margin-top:1.5rem;font-size:0.8rem;opacity:0.9">
      Open in browser → Print → Save as PDF for a meeting handout.
    </p>
  </div>

  <div class="part">
    <h2>Part I — Business Operations Reference</h2>
    <p>${escapeHtml(MEMBERSHIP_CALLOUTS.marginNote)}</p>
    <div class="stats">
      <div class="stat"><div class="val">${OPS_GUIDE_STATS.membershipPlans}</div><div class="lbl">ELEVATED plans</div></div>
      <div class="stat"><div class="val">${OPS_GUIDE_STATS.priceRange}</div><div class="lbl">Price range / mo</div></div>
      <div class="stat"><div class="val">${OPS_GUIDE_STATS.memberDiscount}</div><div class="lbl">Member à la carte discount</div></div>
      <div class="stat"><div class="val">5 + 6</div><div class="lbl">IV drips + boosters</div></div>
    </div>

    <h3>1. The four membership plans</h3>
    ${calloutHtml("A membership IS the program", MEMBERSHIP_CALLOUTS.planIsProgram)}
    ${tableHtml(["Plan", "Price / mo", "Medication", "Labs"], MEMBERSHIP_PLAN_ROWS)}
    <h3>Exactly what each plan includes</h3>
    ${tableHtml(["Plan", "Included every month"], TIER_INCLUSION_ROWS)}
    <h3>Shared by every plan</h3>
    <p>${escapeHtml(MEMBERSHIP_CALLOUTS.sharedBenefits)}</p>
    <h3>Paid separately</h3>
    <p>${escapeHtml(MEMBERSHIP_CALLOUTS.paidSeparately)}</p>
    <h3>Member discount examples</h3>
    ${calloutHtml("20% off à la carte at checkout", MEMBERSHIP_CALLOUTS.memberDiscount, "success")}
    ${tableHtml(["Item", "Normal", "Member pays", "Why"], MEMBER_DISCOUNT_EXAMPLE_ROWS)}
    ${calloutHtml("If they cancel", MEMBERSHIP_CALLOUTS.cancelPolicy, "warning")}

    <h3>2. What we offer (and what we don't)</h3>
    ${tableHtml(["Topic", "What we do", "What we don't"], OFFER_POLICY_ROWS)}

    <h3>3. Plan economics</h3>
    ${tableHtml(["Plan", "Price/mo", "Med", "+Labs", "Total", "Gross", "Margin"], PROGRAM_ECONOMICS_ROWS)}

    <h3>4. GLP-1 fills</h3>
    ${tableHtml(["Item", "Cost", "Price", "Margin", "Role"], GLP1_FILL_ROWS)}

    <h3>5. Peptides</h3>
    ${tableHtml(["Item", "Cost", "Price", "Margin"], PEPTIDE_ALACARTE_ROWS)}
    ${tableHtml(["Item", "Cost", "Non-mbr", "Member", "NM %", "Mbr %"], RECOVERY_PEPTIDE_ROWS)}

    <h3>6. IV Lounge</h3>
    ${tableHtml(["Drip", "Category", "Ingredients", "Price"], IV_DRIP_ROWS)}
    ${tableHtml(["Add-on", "Cost", "Price", "Margin"], IV_ADDON_ROWS)}
    ${calloutHtml("NAD+ booster only", MEMBERSHIP_CALLOUTS.nadBooster)}

    <h3>7. Hormones</h3>
    ${tableHtml(["Item", "Source", "Monthly cost", "Backup"], HORMONE_SOURCING_ROWS)}
    ${calloutHtml("Men's TRT", MEMBERSHIP_CALLOUTS.trtDelivery)}

    <h3>8. Lab panels</h3>
    ${tableHtml(["Panel", "Cost", "Non-mbr", "NM %", "Member", "Mbr %"], LAB_PRICING_ROWS)}
    ${tableHtml(["Panel", "Tests included"], LAB_COMPOSITION_ROWS)}
    ${tableHtml(["Panel", "Frequency"], LAB_FREQUENCY_ROWS)}
    ${calloutHtml("Member labs bundled", MEMBERSHIP_CALLOUTS.labBundling)}

    <h3>9. Sourcing</h3>
    ${tableHtml(["Category", "Primary", "Backup"], VENDOR_SOURCING_ROWS)}

    <h3>10. Recent changes</h3>
    ${tableHtml(["Change", "Meaning", "Status"], RECENT_CHANGE_ROWS)}
  </div>

  <div class="part">
    <h2>Part II — Clinical Operations &amp; SOPs</h2>
    <h3>Master patient journey (ALGO-000)</h3>
    ${master ? algorithmToHtml(master) : ""}

    <h3>Upsell &amp; growth matrix</h3>
    ${tableHtml(
      ["Phase", "Trigger", "Offer", "Charge", "Script"],
      UPSELL_MATRIX.map((r) => [r.phase, r.trigger, r.offer, r.charge, r.script]),
    )}

    <h3>Billing verification checkpoints</h3>
    ${tableHtml(
      ["Step", "Event", "Stripe SKU", "Amount", "Verify"],
      CHARGE_CHECKPOINTS.map((c) => [c.step, c.event, c.stripeSku, c.amount, c.verify]),
    )}

    ${sopSections}
    <h3>Sub-algorithms (quick reference)</h3>
    ${subAlgos}

    <h3>Appendix — ELEVATED programs</h3>
    ${tableHtml(
      ["Program", "Charge/mo"],
      Object.values(ELEVATED_PROGRAMS).map((p) => [p.name, p.displayPrice]),
    )}

    <h3>Appendix — Line-item economics</h3>
    ${tableHtml(
      ["Item", "Vendor", "COGS", "Charge", "Margin"],
      economics.map((r) => [
        r.label,
        r.primarySupplier,
        fmtUsd(r.primaryCostCents),
        fmtUsd(r.clientPriceCents),
        fmtPct(r.marginPrimaryPct),
      ]),
    )}

    <h3>Appendix — First-month economics</h3>
    ${tableHtml(
      ["Path", "Consult", "Labs", "Month 1 program", "Total"],
      [
        [
          "TRT",
          CORE_SERVICES.wellnessAssessment.displayPrice,
          CORE_SERVICES.comprehensivePanel.displayPrice,
          ELEVATED_PROGRAMS.trt.displayPrice,
          fmtUsd(
            CORE_SERVICES.wellnessAssessment.amount +
              CORE_SERVICES.comprehensivePanel.amount +
              ELEVATED_PROGRAMS.trt.amount,
          ),
        ],
        [
          "HRT",
          CORE_SERVICES.wellnessAssessment.displayPrice,
          CORE_SERVICES.comprehensivePanel.displayPrice,
          ELEVATED_PROGRAMS.hrt.displayPrice,
          fmtUsd(
            CORE_SERVICES.wellnessAssessment.amount +
              CORE_SERVICES.comprehensivePanel.amount +
              ELEVATED_PROGRAMS.hrt.amount,
          ),
        ],
        [
          "GLP-1 sema",
          CORE_SERVICES.wellnessAssessment.displayPrice,
          CORE_SERVICES.expandedPanel.displayPrice,
          GLP1_PROGRAM_VARIANTS.semaglutide.displayPrice,
          fmtUsd(
            CORE_SERVICES.wellnessAssessment.amount +
              CORE_SERVICES.expandedPanel.amount +
              GLP1_PROGRAM_VARIANTS.semaglutide.amount,
          ),
        ],
        [
          "GLP-1 tirz",
          CORE_SERVICES.wellnessAssessment.displayPrice,
          CORE_SERVICES.expandedPanel.displayPrice,
          GLP1_PROGRAM_VARIANTS.tirzepatide.displayPrice,
          fmtUsd(
            CORE_SERVICES.wellnessAssessment.amount +
              CORE_SERVICES.expandedPanel.amount +
              GLP1_PROGRAM_VARIANTS.tirzepatide.amount,
          ),
        ],
      ],
    )}
  </div>

  <div class="part">
    <h2>Part III — Staff Quick Reference</h2>
    <blockquote>${escapeHtml(STAFF_OPENING_SCRIPT)}</blockquote>

    <h3>Lane A — IV Lounge</h3>
    <ol>${LANE_A_IV_STEPS.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>

    <h3>Lane B — Consult-gated</h3>
    <ol>${LANE_B_CONSULT_STEPS.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>

    <h3>Goal → lab routing</h3>
    ${tableHtml(
      ["Goal", "Panel", "Charge", "Tier"],
      goalLab.map((r) => [r.goalLabel, r.panelName, r.patientCharge, r.checkoutTier ?? "—"]),
    )}

    <h3>Lab safety redirects</h3>
    ${tableHtml(
      ["Goal", "Trigger", "Action"],
      LAB_REDIRECT_EXAMPLES.map((r) => [r.goal, r.trigger, r.action]),
    )}

    <h3>Vendor routing</h3>
    ${tableHtml(
      ["Lane", "Vendor", "Note"],
      vendors.map((r) => [r.lane, r.vendor, r.note]),
    )}

    <h3>Consents</h3>
    ${tableHtml(
      ["Consent", "When"],
      CONSENT_CHECKLIST.map((r) => [r.consent, r.when]),
    )}

    <h3>Never say / never do</h3>
    <ul>${NEVER_SAY.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
    <ul>${NEVER_DO.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>

    <h3>Printable visit checklist</h3>
    <ol>${PRINTABLE_CHECKLIST.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
  </div>

  <p style="text-align:center;font-size:0.75rem;color:var(--muted);margin-top:3rem">
    ${escapeHtml(OPS_GUIDE_META.title)} · v${OPS_GUIDE_META.version} · ${OPS_GUIDE_META.effectiveDate}
  </p>
</body>
</html>`;
}

function triggerDownload(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadIntegratedOpsHandbookMarkdown(): void {
  triggerDownload(
    buildIntegratedOpsHandbookMarkdown(),
    `${HANDBOOK_FILENAME_BASE}.md`,
    "text/markdown",
  );
}

export function downloadIntegratedOpsHandbookHtml(): void {
  triggerDownload(
    buildIntegratedOpsHandbookHtml(),
    `${HANDBOOK_FILENAME_BASE}.html`,
    "text/html",
  );
}
