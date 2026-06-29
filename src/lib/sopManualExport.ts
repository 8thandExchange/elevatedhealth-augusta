/**
 * Export SOP manual to Markdown / HTML for offline download.
 */
import { CORE_SERVICES, ELEVATED_PROGRAMS, GLP1_PROGRAM_VARIANTS } from "./stripeConfig";
import { STAFF_PRINT_CSS_ROOT } from "./staffPrintBrand";
import {
  CHARGE_CHECKPOINTS,
  SOP_ALGORITHMS,
  SOP_MANUAL_META,
  SOP_SECTIONS,
  UPSELL_MATRIX,
  getAlgorithmById,
} from "./sopManualContent";
import { allEconomicsRows, fmtPct, fmtUsd } from "./formularyEconomics";

function algorithmToMarkdown(algo: (typeof SOP_ALGORITHMS)[0]): string {
  const lines = [
    `### ${algo.id}: ${algo.title}`,
    `**Purpose:** ${algo.purpose}  `,
    `**Owner:** ${algo.owner}`,
    "",
  ];
  let lastPhase = "";
  for (const s of algo.steps) {
    if (s.phase && s.phase !== lastPhase) {
      lines.push(`#### Phase: ${s.phase}`);
      lines.push("");
      lastPhase = s.phase;
    }
    if (s.if) {
      lines.push(`${s.step}. **IF** ${s.if}`);
      if (s.then) lines.push(`   - **THEN** ${s.then}`);
      if (s.else) lines.push(`   - **ELSE** ${s.else}`);
    } else {
      lines.push(`${s.step}. ${s.action}${s.stop ? " **[STOP]**" : ""}`);
    }
    if (s.charge) lines.push(`   - 💳 **Charge:** ${s.charge}`);
    if (s.upsell) lines.push(`   - ↗ **Upsell:** ${s.upsell}`);
    lines.push("");
  }
  return lines.join("\n");
}

export function buildSOPManualMarkdown(): string {
  const economics = allEconomicsRows();
  const master = getAlgorithmById("ALGO-000");

  const header = [
    `# ${SOP_MANUAL_META.title}`,
    "",
    `> ${SOP_MANUAL_META.classification}`,
    "",
    `| Field | Value |`,
    `|-------|-------|`,
    `| Version | ${SOP_MANUAL_META.version} |`,
    `| Effective | ${SOP_MANUAL_META.effectiveDate} |`,
    `| Owner | ${SOP_MANUAL_META.owner} |`,
    `| Clinic | ${SOP_MANUAL_META.address} |`,
    `| Phone | ${SOP_MANUAL_META.phone} |`,
    "",
    "---",
    "",
  ].join("\n");

  const masterBlock = master
    ? [
        "## Master patient journey (ALGO-000)",
        "",
        algorithmToMarkdown(master),
        "---",
        "",
      ].join("\n")
    : "";

  const upsellBlock = [
    "## Upsell & growth matrix",
    "",
    "| Phase | Trigger | Offer | Charge | Script |",
    "|-------|---------|-------|--------|--------|",
    ...UPSELL_MATRIX.map(
      (r) =>
        `| ${r.phase} | ${r.trigger} | ${r.offer} | ${r.charge} | ${r.script} |`,
    ),
    "",
    "---",
    "",
  ].join("\n");

  const chargeBlock = [
    "## Billing verification checkpoints",
    "",
    "| Step | Event | Stripe SKU | Amount | Verify |",
    "|------|-------|------------|--------|--------|",
    ...CHARGE_CHECKPOINTS.map(
      (c) => `| ${c.step} | ${c.event} | ${c.stripeSku} | ${c.amount} | ${c.verify} |`,
    ),
    "",
    "---",
    "",
  ].join("\n");

  const sections = SOP_SECTIONS.map((sec) => {
    const parts = [
      `## ${sec.number}. ${sec.title}`,
      "",
      sec.summary,
      "",
    ];
    if (sec.bullets?.length) {
      for (const b of sec.bullets) parts.push(`- ${b}`);
      parts.push("");
    }
    if (sec.algorithmIds?.length) {
      for (const id of sec.algorithmIds) {
        if (id === "ALGO-000") continue;
        const algo = getAlgorithmById(id);
        if (algo) parts.push(algorithmToMarkdown(algo));
      }
    }
    return parts.join("\n");
  }).join("\n---\n\n");

  const subAlgos = SOP_ALGORITHMS.filter((a) => a.id !== "ALGO-000")
    .map((a) => algorithmToMarkdown(a))
    .join("\n---\n\n");

  const programs = [
    "## Appendix A — ELEVATED program economics",
    "",
    "| Program | Patient charge/mo | Notes |",
    "|---------|-------------------|-------|",
    ...Object.values(ELEVATED_PROGRAMS).map(
      (p) => `| ${p.name} | ${p.displayPrice} | Medication when in-program included |`,
    ),
    "",
    "## Appendix B — Line-item COGS & margins",
    "",
    "| Item | Primary vendor | COGS | Alternate | Alt COGS | Charge | Margin |",
    "|------|----------------|------|-----------|----------|--------|--------|",
    ...economics
      .filter((r) => r.clientPriceCents > 0)
      .map(
        (r) =>
          `| ${r.label} | ${r.primarySupplier} | ${fmtUsd(r.primaryCostCents)} | ${r.alternateSupplier ?? "—"} | ${r.alternateCostCents != null ? fmtUsd(r.alternateCostCents) : "—"} | ${fmtUsd(r.clientPriceCents)} | ${fmtPct(r.marginPrimaryPct)} |`,
      ),
    "",
    "## Appendix C — First-month patient economics (typical)",
    "",
    "| Path | Consult | Labs | Month 1 program | Total month 1 |",
    "|------|---------|------|-----------------|---------------|",
    `| TRT | ${CORE_SERVICES.wellnessAssessment.displayPrice} | ${CORE_SERVICES.comprehensivePanel.displayPrice} | ${ELEVATED_PROGRAMS.trt.displayPrice} | ${fmtUsd(CORE_SERVICES.wellnessAssessment.amount + CORE_SERVICES.comprehensivePanel.amount + ELEVATED_PROGRAMS.trt.amount)} |`,
    `| HRT | ${CORE_SERVICES.wellnessAssessment.displayPrice} | ${CORE_SERVICES.comprehensivePanel.displayPrice} | ${ELEVATED_PROGRAMS.hrt.displayPrice} | ${fmtUsd(CORE_SERVICES.wellnessAssessment.amount + CORE_SERVICES.comprehensivePanel.amount + ELEVATED_PROGRAMS.hrt.amount)} |`,
    `| GLP-1 (semaglutide) | ${CORE_SERVICES.wellnessAssessment.displayPrice} | ${CORE_SERVICES.expandedPanel.displayPrice} | ${GLP1_PROGRAM_VARIANTS.semaglutide.displayPrice} | ${fmtUsd(CORE_SERVICES.wellnessAssessment.amount + CORE_SERVICES.expandedPanel.amount + GLP1_PROGRAM_VARIANTS.semaglutide.amount)} |`,
    `| GLP-1 (tirzepatide) | ${CORE_SERVICES.wellnessAssessment.displayPrice} | ${CORE_SERVICES.expandedPanel.displayPrice} | ${GLP1_PROGRAM_VARIANTS.tirzepatide.displayPrice} | ${fmtUsd(CORE_SERVICES.wellnessAssessment.amount + CORE_SERVICES.expandedPanel.amount + GLP1_PROGRAM_VARIANTS.tirzepatide.amount)} |`,
    "",
    "---",
    "",
    "*Generated from live clinic config. Re-download from /staff/sop-manual for latest figures.*",
  ].join("\n");

  return [
    header,
    masterBlock,
    upsellBlock,
    chargeBlock,
    sections,
    "## Appendix D — Sub-algorithms (quick reference)",
    "",
    subAlgos,
    programs,
  ].join("\n");
}

const BRAND_CSS = `
  ${STAFF_PRINT_CSS_ROOT}
  * { box-sizing: border-box; }
  body {
    font-family: 'Jost', 'Segoe UI', system-ui, sans-serif;
    color: var(--ink);
    background: var(--paper);
    margin: 0;
    padding: 2rem;
    line-height: 1.55;
    font-size: 11pt;
  }
  .cover {
    text-align: center;
    padding: 3rem 2rem;
    background: var(--navy);
    color: var(--paper);
    margin: -2rem -2rem 2rem;
    border-bottom: 4px solid var(--steel);
  }
  .cover .mark {
    display: inline-block;
    width: 64px; height: 64px;
    background: var(--navy);
    border: 2px solid var(--steel-light);
    border-radius: 4px;
    font-family: 'Playfair Display', Georgia, serif;
    font-style: italic;
    font-size: 2.5rem;
    line-height: 64px;
    margin-bottom: 1rem;
  }
  .cover h1 {
    font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
    font-weight: 400;
    font-size: 2rem;
    margin: 0.5rem 0;
  }
  .cover h1 em { font-style: italic; color: var(--steel-light); }
  .cover .meta { font-size: 0.85rem; opacity: 0.85; margin-top: 1.5rem; }
  .badge {
    display: inline-block;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--steel-light);
    margin-bottom: 0.5rem;
  }
  h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.35rem;
    border-bottom: 2px solid var(--steel);
    padding-bottom: 0.35rem;
    margin-top: 2rem;
    page-break-after: avoid;
    color: var(--navy);
  }
  h3 { font-family: 'Playfair Display', Georgia, serif; font-size: 1.1rem; margin-top: 1.5rem; color: var(--navy); }
  h4 { font-size: 0.95rem; color: var(--steel); margin: 1rem 0 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
    margin: 1rem 0;
    page-break-inside: avoid;
  }
  th, td { border: 1px solid var(--border); padding: 0.4rem 0.6rem; text-align: left; vertical-align: top; }
  th { background: var(--navy); color: var(--paper); }
  tr:nth-child(even) { background: rgba(10, 106, 161, 0.04); }
  .algo {
    border: 1px solid var(--border);
    border-radius: 6px;
    margin: 1rem 0;
    overflow: hidden;
    page-break-inside: avoid;
  }
  .algo-head {
    background: var(--navy);
    color: var(--paper);
    padding: 0.75rem 1rem;
  }
  .algo-head .id { font-size: 0.7rem; opacity: 0.7; text-transform: uppercase; }
  .algo-body { padding: 0; }
  .algo-step {
    padding: 0.6rem 1rem;
    border-bottom: 1px solid var(--border);
    font-size: 0.9rem;
  }
  .algo-step:last-child { border-bottom: none; }
  .charge { color: var(--green); font-size: 0.8rem; margin-top: 0.25rem; }
  .upsell { color: var(--steel); font-size: 0.8rem; margin-top: 0.25rem; }
  .phase { font-weight: 600; color: var(--steel); }
  @media print {
    body { background: white; padding: 0; }
    .cover { margin: 0 0 1rem; page-break-after: always; }
    h2 { page-break-before: always; }
    h2:first-of-type { page-break-before: avoid; }
  }
`;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
      const charge = s.charge ? `<div class="charge">💳 Charge: ${escapeHtml(s.charge)}</div>` : "";
      const upsell = s.upsell ? `<div class="upsell">↗ Upsell: ${escapeHtml(s.upsell)}</div>` : "";
      return `${phaseHtml}<div class="algo-step"><strong>${escapeHtml(s.step)}.</strong> ${body}${charge}${upsell}</div>`;
    })
    .join("");
  return `<div class="algo"><div class="algo-head"><div class="id">${escapeHtml(algo.id)}</div><strong>${escapeHtml(algo.title)}</strong><br><small>${escapeHtml(algo.purpose)}</small></div><div class="algo-body">${steps}</div></div>`;
}

export function buildSOPManualHtml(): string {
  const md = buildSOPManualMarkdown();
  const master = getAlgorithmById("ALGO-000");

  const upsellTable = [
    "<table><thead><tr><th>Phase</th><th>Trigger</th><th>Offer</th><th>Charge</th><th>Script</th></tr></thead><tbody>",
    ...UPSELL_MATRIX.map(
      (r) =>
        `<tr><td>${escapeHtml(r.phase)}</td><td>${escapeHtml(r.trigger)}</td><td>${escapeHtml(r.offer)}</td><td>${escapeHtml(r.charge)}</td><td><em>${escapeHtml(r.script)}</em></td></tr>`,
    ),
    "</tbody></table>",
  ].join("");

  const chargeTable = [
    "<table><thead><tr><th>Step</th><th>Event</th><th>Stripe SKU</th><th>Amount</th><th>Verify</th></tr></thead><tbody>",
    ...CHARGE_CHECKPOINTS.map(
      (c) =>
        `<tr><td>${escapeHtml(c.step)}</td><td>${escapeHtml(c.event)}</td><td><code>${escapeHtml(c.stripeSku)}</code></td><td>${escapeHtml(c.amount)}</td><td>${escapeHtml(c.verify)}</td></tr>`,
    ),
    "</tbody></table>",
  ].join("");

  const subAlgos = SOP_ALGORITHMS.filter((a) => a.id !== "ALGO-000").map(algorithmToHtml).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(SOP_MANUAL_META.title)} v${SOP_MANUAL_META.version}</title>
  <style>${BRAND_CSS}</style>
</head>
<body>
  <div class="cover">
    <div class="mark">e</div>
    <div class="badge">${escapeHtml(SOP_MANUAL_META.classification)}</div>
    <h1>Standard Operating<br><em>Procedures Manual</em></h1>
    <p>Elevated Health Augusta · Evans, Georgia</p>
    <div class="meta">
      Version ${SOP_MANUAL_META.version} · Effective ${SOP_MANUAL_META.effectiveDate}<br>
      ${escapeHtml(SOP_MANUAL_META.address)} · ${escapeHtml(SOP_MANUAL_META.phone)}
    </div>
  </div>

  <h2>Master patient journey</h2>
  ${master ? algorithmToHtml(master) : ""}

  <h2>Upsell &amp; growth matrix</h2>
  ${upsellTable}

  <h2>Billing verification checkpoints</h2>
  ${chargeTable}

  <h2>Sub-algorithms</h2>
  ${subAlgos}

  <h2>Financial reference</h2>
  <pre style="white-space:pre-wrap;font-size:0.8rem;background:#fff;padding:1rem;border:1px solid #ccc">${escapeHtml(md.split("## Appendix A")[1] ?? "")}</pre>

  <p style="text-align:center;font-size:0.75rem;color:var(--muted);margin-top:3rem">
    ${escapeHtml(SOP_MANUAL_META.title)} · v${SOP_MANUAL_META.version} · Generated ${SOP_MANUAL_META.effectiveDate}
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

export function downloadSOPManualMarkdown(): void {
  triggerDownload(
    buildSOPManualMarkdown(),
    `EHA-SOP-Manual-v${SOP_MANUAL_META.version}-${SOP_MANUAL_META.effectiveDate}.md`,
    "text/markdown",
  );
}

export function downloadSOPManualHtml(): void {
  triggerDownload(
    buildSOPManualHtml(),
    `EHA-SOP-Manual-v${SOP_MANUAL_META.version}-${SOP_MANUAL_META.effectiveDate}.html`,
    "text/html",
  );
}
