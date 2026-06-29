/**
 * Print-ready Staff Complete Reference — full formulary, dosing, multi-peptide strategy.
 */
import {
  MASTER_GUIDE_FILENAME_BASE,
  MASTER_GUIDE_META,
  PEPTIDE_LAYER_RULES,
  CHARGE_CHECKPOINTS,
  COMBO_ADDON_ROWS,
  DO_SAY,
  DONT_SAY,
  HAIR_ROWS,
  LANE_A_IV_STEPS,
  LANE_B_CONSULT_STEPS,
  MEMBERSHIP_ROWS,
  MEMBER_DISCOUNT_PERCENT,
  NOT_INCLUDED,
  PATIENT_JOURNEY_PHASES,
  POLICY_BULLETS,
  QUICK_REFERENCE,
  RECOVERY_STACK,
  SEXUAL_WELLNESS_ROWS,
  STAFF_OPENING_SCRIPT,
  TEAM_ROWS,
  VISIT_LAB_ROWS,
  buildDetailedGlp1Rows,
  buildDetailedIvAddonRows,
  buildDetailedIvDripRows,
  buildDetailedPeptideRows,
  buildHormoneProtocolRows,
  buildLabCompositionRows,
  buildLabFrequencyRows,
  buildLabPricingRows,
  LAB_PANEL_ORDERING_ROWS,
} from "./staffMasterGuideContent";
import { STAFF_PRINT_CSS_ROOT } from "./staffPrintBrand";
import {
  MULTI_SERVICE_PLAYBOOK,
  ENROLLMENT_STEPS,
  STAFF_NEVER,
  STAFF_ALWAYS,
  MARGIN_GUARDRAILS,
  COMBO_SHARED_CARE_BULLETS,
  buildComboMatrixRows,
  buildTripleServiceTableRows,
  buildLayerSummaryRows,
} from "./multiServiceAddonPlaybook";
import {
  COST_MARGIN_META,
  MEMBERSHIP_MARGIN_ROWS,
  MEMBERSHIP_COST_LINES,
  IV_NUTRIENT_COST_ROWS,
  SEXUAL_WELLNESS_COST_ROWS,
  COST_COMPLIANCE_FLAGS,
  SUPPLIER_DIRECTORY,
  confidenceLabel,
} from "./staffCostMarginContent";

export { MASTER_GUIDE_FILENAME_BASE };

export const MASTER_GUIDE_PDF_PATH = `/downloads/${MASTER_GUIDE_FILENAME_BASE}.pdf`;
export const MASTER_GUIDE_HTML_PATH = `/downloads/${MASTER_GUIDE_FILENAME_BASE}.html`;
export const MASTER_GUIDE_PDF_STABLE = `/downloads/EHA-Staff-Complete-Reference.pdf`;

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

const CSS = `
  @page { size: letter portrait; margin: 0.4in; }
  ${STAFF_PRINT_CSS_ROOT}
  * { box-sizing: border-box; }
  body {
    font-family: 'Jost', 'Segoe UI', system-ui, sans-serif;
    color: var(--ink);
    margin: 0;
    font-size: 7.5pt;
    line-height: 1.3;
    background: var(--paper);
  }
  .cover {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: var(--navy);
    color: var(--paper);
    padding: 1.5rem;
    page-break-after: always;
  }
  .cover .mark {
    width: 56px; height: 56px;
    border: 2px solid var(--steel-light);
    border-radius: 3px;
    font-family: 'Playfair Display', Georgia, serif;
    font-style: italic;
    font-size: 2rem;
    line-height: 52px;
    margin-bottom: 0.75rem;
  }
  .cover h1 {
    font-family: 'Playfair Display', Georgia, serif;
    font-weight: 400;
    font-size: 1.65rem;
    margin: 0.2rem 0;
    max-width: 26rem;
  }
  .cover h1 em { font-style: italic; color: var(--steel-light); }
  .cover .sub { font-size: 0.9rem; opacity: 0.9; margin-top: 0.4rem; max-width: 22rem; }
  .cover .meta { margin-top: 1.5rem; font-size: 0.72rem; opacity: 0.75; line-height: 1.6; }
  .cover .version {
    margin-top: 1rem;
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--steel-light);
  }
  .page { padding: 0.05in 0; page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 2px solid var(--steel);
    padding-bottom: 0.3rem;
    margin-bottom: 0.5rem;
    page-break-after: avoid;
  }
  .page-header h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: var(--navy);
  }
  .page-header .tag {
    font-size: 0.58rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
  }
  h3 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 0.78rem;
    margin: 0.5rem 0 0.25rem;
    color: var(--steel);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 6.8pt;
    margin: 0.25rem 0 0.4rem;
  }
  th, td {
    border: 1px solid var(--border);
    padding: 0.18rem 0.28rem;
    text-align: left;
    vertical-align: top;
  }
  th { background: var(--surface); font-weight: 600; color: var(--navy); }
  tr:nth-child(even) td { background: rgba(10, 106, 161, 0.04); }
  ul, ol { margin: 0.2rem 0 0.35rem; padding-left: 1rem; }
  li { margin-bottom: 0.12rem; }
  .callout {
    background: var(--surface);
    border-left: 3px solid var(--steel);
    padding: 0.35rem 0.5rem;
    margin: 0.35rem 0;
    font-size: 7pt;
  }
  .callout.warn { border-left-color: var(--red); background: #fdf8f8; }
  .callout strong { color: var(--navy); }
  .script {
    font-style: italic;
    background: var(--surface);
    padding: 0.35rem 0.5rem;
    border-radius: 2px;
    margin-bottom: 0.4rem;
    font-size: 7pt;
  }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
  .lane-box {
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 0.35rem;
    border-radius: 2px;
  }
  .lane-box h4 { margin: 0 0 0.2rem; font-size: 0.72rem; color: var(--steel); }
  .lane-box ol { margin: 0; padding-left: 1rem; font-size: 6.8pt; }
  .journey { font-size: 6.8pt; }
  .journey-row { display: grid; grid-template-columns: 1.2rem 1fr 4rem; gap: 0.25rem; margin-bottom: 0.15rem; }
  .journey-num { font-weight: 700; color: var(--steel); }
  .say-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; font-size: 6.8pt; }
  .say-do { border-left: 2px solid var(--green); padding-left: 0.35rem; }
  .say-dont { border-left: 2px solid var(--red); padding-left: 0.35rem; }
  .team-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.35rem;
    font-size: 6.8pt;
  }
  .footer {
    font-size: 0.55rem;
    color: var(--muted);
    border-top: 1px solid var(--border);
    padding-top: 0.25rem;
    margin-top: 0.35rem;
  }
  .footer strong { color: var(--navy); font-size: 0.65rem; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;

function page(tag: string, title: string, body: string): string {
  const m = MASTER_GUIDE_META;
  return `
  <section class="page">
    <div class="page-header">
      <h2>${escapeHtml(title)}</h2>
      <span class="tag">${escapeHtml(tag)} · v${m.version}</span>
    </div>
    ${body}
    <div class="footer">
      <strong>${escapeHtml(m.phone)}</strong> · ${escapeHtml(m.address)} · ${escapeHtml(m.domain)}
    </div>
  </section>`;
}

export function buildStaffMasterGuideHtml(): string {
  const m = MASTER_GUIDE_META;

  const cover = `
  <section class="cover">
    <div class="mark">E</div>
    <h1>Staff <em>Complete Reference</em></h1>
    <p class="sub">${escapeHtml(m.subtitle)}</p>
    <p class="meta">${escapeHtml(m.address)}<br/>${escapeHtml(m.phone)} · ${escapeHtml(m.domain)}</p>
    <p class="version">${escapeHtml(m.classification)} · v${m.version} · ${m.effectiveDate}</p>
  </section>`;

  const processPage = page(
    "Process",
    "How we work",
    `
    <div class="script">${escapeHtml(STAFF_OPENING_SCRIPT)}</div>
    <div class="two-col">
      <div class="lane-box">
        <h4>Lane A — IV Lounge (walk-in)</h4>
        <ol>${LANE_A_IV_STEPS.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ol>
      </div>
      <div class="lane-box">
        <h4>Lane B — Consult-gated (Rx · peptides · hormones)</h4>
        <ol>${LANE_B_CONSULT_STEPS.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ol>
      </div>
    </div>
    <h3>Patient journey (9 steps)</h3>
    <div class="journey">
      ${PATIENT_JOURNEY_PHASES.map(
        (p, i) =>
          `<div class="journey-row"><span class="journey-num">${i + 1}</span><span>${escapeHtml(p.title)} — ${escapeHtml(p.goal)}</span><span>${escapeHtml(p.owner)}</span></div>`,
      ).join("")}
    </div>
    <h3>Quick reference</h3>
    <ul>${QUICK_REFERENCE.map((q) => `<li><strong>${escapeHtml(q.label)}:</strong> ${escapeHtml(q.value)}</li>`).join("")}</ul>
    `,
  );

  const multiServicePage = page(
    "Multi-service",
    MULTI_SERVICE_PLAYBOOK.headline,
    `
    <div class="callout"><strong>${escapeHtml(MULTI_SERVICE_PLAYBOOK.tagline)}</strong><br/>${escapeHtml(MULTI_SERVICE_PLAYBOOK.solution)}</div>
    <h3>Three layers — how competitive stacking works</h3>
    ${tableHtml(
      ["Layer", "What it is", "Pricing", "Care included", "How to enroll"],
      buildLayerSummaryRows(),
    )}
    <h3>What one care bundle includes (never duplicate on add-on)</h3>
    <ul>${COMBO_SHARED_CARE_BULLETS.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>
    <h3>Enrollment process (Provider Dashboard)</h3>
    <ol>${ENROLLMENT_STEPS.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
    <div class="two-col">
      <div class="say-do"><h3 style="margin-top:0;color:var(--green)">Always</h3><ul>${STAFF_ALWAYS.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul></div>
      <div class="say-dont"><h3 style="margin-top:0;color:var(--red)">Never</h3><ul>${STAFF_NEVER.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul></div>
    </div>
    <h3>Margin guardrails</h3>
    <ul>${MARGIN_GUARDRAILS.map((g) => `<li>${escapeHtml(g)}</li>`).join("")}</ul>
    `,
  );

  const comboMatrixPage = page(
    "Combo matrix",
    "Dual-lane combos — anchor + medication add-on",
    `
    <p style="font-size:7pt;margin:0 0 0.35rem">Pick one anchor + optional add-on. Totals are symmetric — anchor order does not change the bill. Save $100/mo vs two full programs.</p>
    ${tableHtml(
      ["Combo", "Total/mo", "Add-on line", "Savings", "Onboarding labs"],
      buildComboMatrixRows(),
    )}
    <h3>Triple-service scenarios (combo + peptides)</h3>
    ${tableHtml(
      ["Patient scenario", "Combo/mo", "Peptides", "Steady state", "Staff script"],
      buildTripleServiceTableRows(),
    )}
    <h3>${escapeHtml(PEPTIDE_LAYER_RULES.headline)}</h3>
    <p style="font-size:7pt">${escapeHtml(PEPTIDE_LAYER_RULES.summary)}</p>
    <ul>${PEPTIDE_LAYER_RULES.rules.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>
    `,
  );

  const labPanelsPage = page(
    "Lab panels",
    "Comprehensive & Expanded lab panels — what to order",
    `
    <div class="callout">
      <strong>Comprehensive Wellness Panel ($199)</strong> = Foundation Wellness · 8 tests.<br/>
      <strong>Expanded Panel ($299)</strong> = Hormone (TRT/HRT) or Weight/GLP-1 · 16–18 tests (includes all 8 Foundation tests).<br/>
      Initial labs are paid at onboarding; quarterly panels are included on ELEVATED TRT, HRT, and GLP-1 while active.
    </div>
    <h3>Which panel to order (by program)</h3>
    ${tableHtml(
      ["Program / pathway", "Panel name", "Non-member", "Member (−20%)", "When"],
      LAB_PANEL_ORDERING_ROWS.map((r) => [...r]),
    )}
    <h3>What each panel includes (tests)</h3>
    ${tableHtml(["Panel", "Tests included"], buildLabCompositionRows())}
    <h3>Draw frequency</h3>
    ${tableHtml(["Panel", "When to draw"], buildLabFrequencyRows())}
    <h3>Lab pricing reference</h3>
    ${tableHtml(["Panel", "Walk-in", "Member", "Margin", "LabCorp COGS"], buildLabPricingRows())}
    `,
  );

  const programsPage = page(
    "Programs",
    "ELEVATED memberships & visits",
    `
    <h3>ELEVATED programs (monthly, all-inclusive)</h3>
    ${tableHtml(
      ["Program", "Price", "Medication", "Labs", "Key notes"],
      MEMBERSHIP_ROWS.map((r) => [r.name, r.price, r.medication, r.labs, r.highlight]),
    )}
    <h3>Combo medication add-ons (stack on anchor program)</h3>
    ${tableHtml(["Add-on", "Price", "Note"], COMBO_ADDON_ROWS)}
    <h3>Not included in any membership</h3>
    <ul>${NOT_INCLUDED.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
    <h3>Visits & labs</h3>
    ${tableHtml(["Service", "Price", "Notes"], VISIT_LAB_ROWS)}
    <h3>Charge checkpoints</h3>
    ${tableHtml(["ID", "When", "Amount"], CHARGE_CHECKPOINTS.map((c) => [c[0], c[1], c[2]]))}
    `,
  );

  const hormonesPage = page(
    "Hormones",
    "Hormone optimization — protocols & pricing",
    `
    <p style="font-size:7pt;margin:0 0 0.35rem">Default paths: women → Bi-Est cream + progesterone (ELEVATED HRT). Men → testosterone cream daily (ELEVATED TRT). No injectable TRT, pellets, anastrozole, or HCG.</p>
    ${tableHtml(
      ["Protocol", "What it does", "Dosing summary", "Program price", "À la carte member", "Labs / notes"],
      buildHormoneProtocolRows(),
    )}
    `,
  );

  const glp1Page = page(
    "GLP-1",
    "Weight loss (GLP-1) — dosing & pricing",
    `
    <p style="font-size:7pt;margin:0 0 0.35rem">Program price locked to molecule — titration does not change monthly rate. Retatrutide: physician-gated within GLP-1 lane only — never advertise.</p>
    ${tableHtml(
      ["Product", "Purpose", "Dosing", "Price", "Member", "Notes"],
      buildDetailedGlp1Rows(),
    )}
    `,
  );

  const peptidesPage = page(
    "Peptides",
    "All peptides — purpose, dosing & pricing",
    `
    <p style="font-size:7pt;margin:0 0 0.35rem">Consult-gated. Research Peptide Consent for Cat 2 compounds. Reconstitution: 2 ml bacteriostatic water unless pharmacy label differs.</p>
    ${tableHtml(
      ["Peptide", "What it does", "Dosing", "Non-member", "Member (−20%)", "Billing", "Notes"],
      buildDetailedPeptideRows(),
    )}
    `,
  );

  const ivPage = page(
    "IV Lounge",
    "IV drips & boosters — Lane A walk-in",
    `
    <h3>Signature drips</h3>
    ${tableHtml(
      ["Drip", "What it does", "Ingredients", "Walk-in", "Member", "Category"],
      buildDetailedIvDripRows(),
    )}
    <h3>Boosters & pushes (add to any drip)</h3>
    ${tableHtml(
      ["Add-on", "What it does", "Benefits", "Price", "Member", "Best for"],
      buildDetailedIvAddonRows(),
    )}
    <div class="callout warn"><strong>NAD+:</strong> Only the $50 IV booster push — no peptide NAD+, no standalone NAD+ infusion.</div>
    `,
  );

  const hiddenPage = page(
    "Staff-only SKUs",
    "Sexual wellness & hair (launch-hidden)",
    `
    <p style="font-size:7pt;margin:0 0 0.35rem">Available after consult — do not promote on public storefront or cold outreach.</p>
    <h3>Sexual wellness</h3>
    ${tableHtml(["Product", "Price", "Member", "Notes"], SEXUAL_WELLNESS_ROWS)}
    <h3>Hair restoration</h3>
    ${tableHtml(["Product", "Price", "Member", "Notes"], HAIR_ROWS)}
    `,
  );

  const rulesPage = page(
    "Rules",
    "Staff reminders · team · scripting",
    `
    <h3>Policy reminders</h3>
    <ul>${POLICY_BULLETS.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>
    <div class="say-grid">
      <div class="say-do">
        <h3 style="margin-top:0;color:var(--green)">Do say</h3>
        <ul>${DO_SAY.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
      </div>
      <div class="say-dont">
        <h3 style="margin-top:0;color:var(--red)">Never say</h3>
        <ul>${DONT_SAY.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
      </div>
    </div>
    <h3>Team</h3>
    <div class="team-grid">
      ${TEAM_ROWS.map(
        ([name, role, duties]) =>
          `<div><strong>${escapeHtml(name)}</strong> · ${escapeHtml(role)}<br/><span style="color:var(--muted)">${escapeHtml(duties)}</span></div>`,
      ).join("")}
    </div>
    `,
  );

  const costMarginPage = page(
    "Cost & Margin",
    "Cost & margin — STAFF ONLY (never patient-facing)",
    `
    <div class="callout warn"><strong>Classification:</strong> ${escapeHtml(COST_MARGIN_META.classification)}</div>
    <h3>Membership gross margin (medication line)</h3>
    ${tableHtml(
      ["Program", "Revenue/mo", "Med cost/mo", "Gross on med", "Confidence", "Note"],
      MEMBERSHIP_MARGIN_ROWS.map((r) => [
        r.program,
        r.revenue,
        r.medCost,
        r.grossOnMed,
        confidenceLabel(r.confidence),
        r.note ?? "",
      ]),
    )}
    <h3>Medication cost detail (by supplier)</h3>
    ${tableHtml(
      ["Item", "Supplier", "Unit cost", "Basis", "Monthly", "Confidence"],
      MEMBERSHIP_COST_LINES.map((r) => [
        r.item,
        r.supplier,
        r.unitCost,
        r.basis,
        r.monthlyCost,
        confidenceLabel(r.confidence),
      ]),
    )}
    <h3>IV / injectable nutrient cost — GC network (HYBRID / STLKS)</h3>
    ${tableHtml(
      ["Nutrient", "Supplier", "Wholesale", "Basis", "Confidence"],
      IV_NUTRIENT_COST_ROWS.map((r) => [
        r.item,
        r.supplier,
        r.unitCost,
        r.basis,
        confidenceLabel(r.confidence),
      ]),
    )}
    <h3>Sexual wellness cost — GC network (503A)</h3>
    ${tableHtml(
      ["Product", "Supplier", "Wholesale", "Basis", "Confidence"],
      SEXUAL_WELLNESS_COST_ROWS.map((r) => [
        r.item,
        r.supplier,
        r.unitCost,
        r.basis,
        confidenceLabel(r.confidence),
      ]),
    )}
    <h3>Supplier directory — who fills what</h3>
    ${tableHtml(
      ["Supplier", "Type", "Fills", "Status"],
      SUPPLIER_DIRECTORY.map((r) => [r.name, r.type, r.fills, r.status]),
    )}
    <h3>Cost & sourcing compliance flags</h3>
    <ul>${COST_COMPLIANCE_FLAGS.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>
    <div class="callout warn"><strong>Review trigger:</strong> ${escapeHtml(COST_MARGIN_META.reviewTrigger)}</div>
    `,
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(m.clinic)} — ${escapeHtml(m.title)}</title>
  <style>${CSS}</style>
</head>
<body>
  ${cover}
  ${processPage}
  ${multiServicePage}
  ${comboMatrixPage}
  ${labPanelsPage}
  ${programsPage}
  ${hormonesPage}
  ${glp1Page}
  ${peptidesPage}
  ${ivPage}
  ${hiddenPage}
  ${rulesPage}
  ${costMarginPage}
</body>
</html>`;
}

export function buildStaffMasterGuideMarkdown(): string {
  const m = MASTER_GUIDE_META;
  const tableMd = (headers: readonly string[], rows: readonly (readonly string[])[]) => {
    const head = `| ${headers.join(" | ")} |`;
    const sep = `| ${headers.map(() => "---").join(" | ")} |`;
    const body = rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
    return [head, sep, body].join("\n");
  };

  return [
    `# ${m.clinic} — ${m.title}`,
    "",
    `> v${m.version} · ${m.effectiveDate} · ${m.classification}`,
    "",
    `## ${MULTI_SERVICE_PLAYBOOK.headline}`,
    "",
    MULTI_SERVICE_PLAYBOOK.solution,
    "",
    "### Three layers",
    "",
    tableMd(
      ["Layer", "What it is", "Pricing", "Care included", "How to enroll"],
      buildLayerSummaryRows(),
    ),
    "",
    "### Enrollment steps",
    "",
    ...ENROLLMENT_STEPS.map((s, i) => `${i + 1}. ${s}`),
    "",
    "### Dual-lane combo matrix",
    "",
    tableMd(
      ["Combo", "Total/mo", "Add-on line", "Savings", "Onboarding labs"],
      buildComboMatrixRows(),
    ),
    "",
    "### Triple-service scenarios",
    "",
    tableMd(
      ["Scenario", "Combo/mo", "Peptides", "Steady state", "Staff script"],
      buildTripleServiceTableRows(),
    ),
    "",
    "## Lab panels — Comprehensive & Expanded",
    "",
    "### Which panel to order",
    "",
    tableMd(
      ["Program / pathway", "Panel name", "Non-member", "Member", "When"],
      LAB_PANEL_ORDERING_ROWS.map((r) => [...r]),
    ),
    "",
    "### Panel composition",
    "",
    tableMd(["Panel", "Tests included"], buildLabCompositionRows()),
    "",
    "## Peptides (full)",
    "",
    tableMd(
      ["Peptide", "What it does", "Dosing", "Non-member", "Member", "Billing", "Notes"],
      buildDetailedPeptideRows(),
    ),
    "",
    "## GLP-1",
    "",
    tableMd(["Product", "Purpose", "Dosing", "Price", "Member", "Notes"], buildDetailedGlp1Rows()),
    "",
    "## Hormones",
    "",
    tableMd(
      ["Protocol", "What it does", "Dosing", "Program", "Member", "Notes"],
      buildHormoneProtocolRows(),
    ),
    "",
    "## IV drips",
    "",
    tableMd(["Drip", "Description", "Ingredients", "Walk-in", "Member", "Category"], buildDetailedIvDripRows()),
    "",
    "## IV boosters",
    "",
    tableMd(["Add-on", "Description", "Benefits", "Price", "Member", "Best for"], buildDetailedIvAddonRows()),
    "",
    "## Cost & Margin — STAFF ONLY (never patient-facing)",
    "",
    `> ${COST_MARGIN_META.classification}`,
    "",
    "### Membership gross margin (medication line)",
    "",
    tableMd(
      ["Program", "Revenue/mo", "Med cost/mo", "Gross on med", "Confidence", "Note"],
      MEMBERSHIP_MARGIN_ROWS.map((r) => [
        r.program,
        r.revenue,
        r.medCost,
        r.grossOnMed,
        confidenceLabel(r.confidence),
        r.note ?? "",
      ]),
    ),
    "",
    "### Medication cost detail (by supplier)",
    "",
    tableMd(
      ["Item", "Supplier", "Unit cost", "Basis", "Monthly", "Confidence"],
      MEMBERSHIP_COST_LINES.map((r) => [
        r.item,
        r.supplier,
        r.unitCost,
        r.basis,
        r.monthlyCost,
        confidenceLabel(r.confidence),
      ]),
    ),
    "",
    "### IV / injectable nutrient cost — GC network (HYBRID / STLKS)",
    "",
    tableMd(
      ["Nutrient", "Supplier", "Wholesale", "Basis", "Confidence"],
      IV_NUTRIENT_COST_ROWS.map((r) => [
        r.item,
        r.supplier,
        r.unitCost,
        r.basis,
        confidenceLabel(r.confidence),
      ]),
    ),
    "",
    "### Sexual wellness cost — GC network (503A)",
    "",
    tableMd(
      ["Product", "Supplier", "Wholesale", "Basis", "Confidence"],
      SEXUAL_WELLNESS_COST_ROWS.map((r) => [
        r.item,
        r.supplier,
        r.unitCost,
        r.basis,
        confidenceLabel(r.confidence),
      ]),
    ),
    "",
    "### Supplier directory — who fills what",
    "",
    tableMd(
      ["Supplier", "Type", "Fills", "Status"],
      SUPPLIER_DIRECTORY.map((r) => [r.name, r.type, r.fills, r.status]),
    ),
    "",
    "### Cost & sourcing compliance flags",
    "",
    ...COST_COMPLIANCE_FLAGS.map((f) => `- ${f}`),
    "",
    `> **Review trigger:** ${COST_MARGIN_META.reviewTrigger}`,
    "",
  ].join("\n");
}

async function fetchStablePdf(): Promise<Blob | null> {
  try {
    const res = await fetch(MASTER_GUIDE_PDF_STABLE);
    if (res.ok) return res.blob();
  } catch {
    /* fallback below */
  }
  return null;
}

export async function downloadMasterGuidePdf(): Promise<void> {
  const blob =
    (await fetchStablePdf()) ??
    new Blob([buildStaffMasterGuideHtml()], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    blob.type === "application/pdf"
      ? "EHA-Staff-Complete-Reference.pdf"
      : `${MASTER_GUIDE_FILENAME_BASE}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadMasterGuideHtml(): void {
  const blob = new Blob([buildStaffMasterGuideHtml()], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${MASTER_GUIDE_FILENAME_BASE}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
