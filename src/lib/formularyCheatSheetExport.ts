/**
 * Print-ready formulary cheat sheet — HTML, Markdown, and static file generation.
 */
import {
  CHEAT_SHEET_META,
  CHEAT_SHEET_FILENAME_BASE,
  QUICK_REFERENCE,
  MEMBERSHIP_ROWS,
  COMBO_ADDON_ROWS,
  NOT_INCLUDED,
  VISIT_LAB_ROWS,
  IV_DRIP_ROWS,
  IV_ADDON_ROWS,
  HORMONE_FILL_ROWS,
  GLP1_ROWS,
  PEPTIDE_MONTHLY_ROWS,
  RECOVERY_PEPTIDE_ROWS,
  METABOLIC_PEPTIDE_ROWS,
  SEXUAL_WELLNESS_ROWS,
  HAIR_ROWS,
  POLICY_BULLETS,
} from "./formularyCheatSheetContent";
import { STAFF_PRINT_CSS_ROOT } from "./staffPrintBrand";

export { CHEAT_SHEET_FILENAME_BASE };

export const CHEAT_SHEET_PDF_PATH = `/downloads/${CHEAT_SHEET_FILENAME_BASE}.pdf`;
export const CHEAT_SHEET_HTML_PATH = `/downloads/${CHEAT_SHEET_FILENAME_BASE}.html`;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tableMd(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  const head = `| ${headers.join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
  return [head, sep, body].join("\n");
}

export function buildFormularyCheatSheetMarkdown(): string {
  const m = CHEAT_SHEET_META;
  return [
    `# ${m.clinic} — ${m.title}`,
    "",
    `> ${m.classification} · v${m.version} · ${m.effectiveDate}`,
    "",
    `**${m.address}** · ${m.phone} · ${m.domain}`,
    "",
    "## Quick reference",
    "",
    ...QUICK_REFERENCE.map((q) => `- **${q.label}:** ${q.value}`),
    "",
    "## ELEVATED memberships (monthly, all-inclusive)",
    "",
    tableMd(
      ["Program", "Price", "Medication", "Labs", "Key notes"],
      MEMBERSHIP_ROWS.map((r) => [r.name, r.price, r.medication, r.labs, r.highlight]),
    ),
    "",
    "### Combo medication add-ons (stack on anchor program)",
    "",
    tableMd(["Add-on", "Price", "Note"], COMBO_ADDON_ROWS),
    "",
    "### Not included in any membership",
    "",
    ...NOT_INCLUDED.map((s) => `- ${s}`),
    "",
    "## Visits & labs",
    "",
    tableMd(["Service", "Price", "Notes"], VISIT_LAB_ROWS),
    "",
    "## IV Lounge (Lane A — walk-in)",
    "",
    tableMd(["Drip", "Walk-in", "Member (−20%)", "Category", "Base ingredients"], IV_DRIP_ROWS),
    "",
    "### Boosters & pushes (add to any drip)",
    "",
    tableMd(["Add-on", "Price", "Member", "Description"], IV_ADDON_ROWS),
    "",
    "## Hormones — à la carte fills",
    "",
    tableMd(["Product", "Non-member", "Member", "Notes"], HORMONE_FILL_ROWS),
    "",
    "## Weight loss (GLP-1)",
    "",
    tableMd(["Product", "Price", "Member / notes"], GLP1_ROWS.map((r) => [r[0], r[1], r.slice(2).join(" · ")])),
    "",
    "## Peptides — monthly (consult-gated)",
    "",
    tableMd(["Peptide", "Price", "Member", "Notes"], PEPTIDE_MONTHLY_ROWS),
    "",
    "## Recovery peptides (one-time fills)",
    "",
    tableMd(["Product", "Price", "Member", "Notes"], RECOVERY_PEPTIDE_ROWS),
    "",
    "## Metabolic peptides (provider-only, monthly)",
    "",
    tableMd(["Peptide", "Price", "Member", "Notes"], METABOLIC_PEPTIDE_ROWS),
    "",
    "## Sexual wellness (launch-hidden)",
    "",
    tableMd(["Product", "Price", "Member", "Notes"], SEXUAL_WELLNESS_ROWS),
    "",
    "## Hair restoration (launch-hidden)",
    "",
    tableMd(["Product", "Price", "Member", "Notes"], HAIR_ROWS),
    "",
    "## Staff reminders",
    "",
    ...POLICY_BULLETS.map((s) => `- ${s}`),
    "",
  ].join("\n");
}

function tableHtml(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  const th = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
  const trs = rows
    .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`)
    .join("");
  return `<table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
}

const CHEAT_SHEET_CSS = `
  @page { size: letter portrait; margin: 0.45in; }
  ${STAFF_PRINT_CSS_ROOT}
  * { box-sizing: border-box; }
  body {
    font-family: 'Jost', 'Segoe UI', system-ui, -apple-system, sans-serif;
    color: var(--ink);
    background: var(--paper);
    margin: 0;
    padding: 0;
    font-size: 8.5pt;
    line-height: 1.35;
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
    padding: 2rem;
    page-break-after: always;
  }
  .cover .mark {
    width: 56px; height: 56px;
    border: 2px solid var(--steel);
    border-radius: 3px;
    font-family: Georgia, 'Times New Roman', serif;
    font-style: italic;
    font-size: 2rem;
    line-height: 52px;
    margin-bottom: 1rem;
  }
  .cover h1 {
    font-family: Georgia, serif;
    font-weight: 400;
    font-size: 1.65rem;
    margin: 0.25rem 0;
    max-width: 28rem;
  }
  .cover h1 em { font-style: italic; color: var(--steel); }
  .cover .sub {
    font-size: 0.95rem;
    opacity: 0.9;
    margin-top: 0.5rem;
  }
  .cover .meta {
    margin-top: 2rem;
    font-size: 0.75rem;
    opacity: 0.75;
    line-height: 1.6;
  }
  .cover .version {
    margin-top: 1.5rem;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--steel);
  }
  .page {
    padding: 0.1in 0;
    page-break-after: always;
  }
  .page:last-child { page-break-after: auto; }
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 2px solid var(--steel);
    padding-bottom: 0.35rem;
    margin-bottom: 0.65rem;
    page-break-after: avoid;
  }
  .page-header h2 {
    font-family: Georgia, serif;
    font-size: 1.05rem;
    font-weight: 600;
    margin: 0;
    border: none;
    padding: 0;
  }
  .page-header .tag {
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
  }
  h3 {
    font-family: Georgia, serif;
    font-size: 0.82rem;
    margin: 0.65rem 0 0.35rem;
    color: var(--steel);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    page-break-after: avoid;
  }
  .quick-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.4rem;
    margin-bottom: 0.75rem;
  }
  .quick-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 0.45rem 0.5rem;
    text-align: center;
  }
  .quick-card .lbl {
    font-size: 0.58rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted);
    margin-bottom: 0.2rem;
  }
  .quick-card .val {
    font-size: 0.72rem;
    font-weight: 600;
    line-height: 1.25;
  }
  .membership-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.45rem;
    margin-bottom: 0.5rem;
  }
  .membership-card {
    border: 1px solid var(--border);
    border-left: 3px solid var(--steel);
    border-radius: 3px;
    padding: 0.45rem 0.55rem;
    background: var(--surface);
    page-break-inside: avoid;
  }
  .membership-card .name {
    font-family: Georgia, serif;
    font-size: 0.85rem;
    font-weight: 600;
  }
  .membership-card .price {
    font-size: 1rem;
    font-weight: 700;
    color: var(--steel);
    margin: 0.15rem 0;
  }
  .membership-card .detail {
    font-size: 0.68rem;
    color: var(--muted);
    line-height: 1.3;
  }
  .membership-card .detail strong { color: var(--navy); font-weight: 600; }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.68rem;
    margin: 0.35rem 0 0.5rem;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid var(--border);
    padding: 0.28rem 0.4rem;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: var(--navy);
    color: var(--paper);
    font-weight: 600;
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  tr:nth-child(even) td { background: rgba(10, 106, 161, 0.04); }
  .price-col { font-weight: 600; white-space: nowrap; }
  .member-col { color: #1a5f1a; font-weight: 600; white-space: nowrap; }
  .callout {
    background: var(--surface);
    border: 1px solid var(--border);
    border-left: 3px solid var(--steel);
    padding: 0.4rem 0.55rem;
    font-size: 0.68rem;
    margin: 0.4rem 0;
    page-break-inside: avoid;
  }
  .callout-warn {
    border-left-color: #a67c00;
    background: #fffbf0;
  }
  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.65rem;
  }
  .policy-list {
    margin: 0;
    padding-left: 1rem;
    font-size: 0.68rem;
  }
  .policy-list li { margin-bottom: 0.25rem; }
  .footer-note {
    font-size: 0.58rem;
    color: var(--muted);
    text-align: center;
    margin-top: 0.5rem;
    border-top: 1px solid var(--border);
    padding-top: 0.35rem;
  }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { page-break-after: always; }
  }
`;

function membershipCardsHtml(): string {
  return `<div class="membership-grid">${MEMBERSHIP_ROWS.map(
    (r) => `
    <div class="membership-card">
      <div class="name">${escapeHtml(r.name)}</div>
      <div class="price">${escapeHtml(r.price)}</div>
      <div class="detail"><strong>Med:</strong> ${escapeHtml(r.medication)}</div>
      <div class="detail"><strong>Labs:</strong> ${escapeHtml(r.labs)}</div>
      <div class="detail">${escapeHtml(r.highlight)}</div>
    </div>`,
  ).join("")}</div>`;
}

function quickGridHtml(): string {
  return `<div class="quick-grid">${QUICK_REFERENCE.map(
    (q) => `
    <div class="quick-card">
      <div class="lbl">${escapeHtml(q.label)}</div>
      <div class="val">${escapeHtml(q.value)}</div>
    </div>`,
  ).join("")}</div>`;
}

function pageShell(tag: string, title: string, body: string): string {
  return `
  <section class="page">
    <div class="page-header">
      <h2>${escapeHtml(title)}</h2>
      <span class="tag">${escapeHtml(tag)} · v${CHEAT_SHEET_META.version}</span>
    </div>
    ${body}
    <div class="footer-note">${escapeHtml(CHEAT_SHEET_META.clinic)} · ${escapeHtml(CHEAT_SHEET_META.phone)} · Internal use only</div>
  </section>`;
}

export function buildFormularyCheatSheetHtml(): string {
  const m = CHEAT_SHEET_META;

  const cover = `
  <section class="cover">
    <div class="mark">e</div>
    <h1><em>Formulary</em> &amp; Pricing<br/>Cheat Sheet</h1>
    <p class="sub">${escapeHtml(m.subtitle)}</p>
    <p class="meta">${escapeHtml(m.address)}<br/>${escapeHtml(m.phone)} · ${escapeHtml(m.domain)}</p>
    <p class="version">${escapeHtml(m.classification)} · ${m.effectiveDate}</p>
  </section>`;

  const page1 = pageShell(
    "Quick reference",
    "At a glance",
    `
    ${quickGridHtml()}
    <div class="callout"><strong>Every ELEVATED program includes:</strong> monthly medication (where applicable) · monthly RN check-in · unlimited messaging · physician oversight · 20% off à la carte.</div>
    <h3>ELEVATED programs</h3>
    ${membershipCardsHtml()}
    <h3>Combo medication add-ons</h3>
    ${tableHtml(["Add-on", "Price", "Note"], COMBO_ADDON_ROWS)}
    <div class="callout callout-warn"><strong>Paid separately at onboarding:</strong> ${NOT_INCLUDED.map(escapeHtml).join(" · ")}</div>
    `,
  );

  const page2 = pageShell(
    "Visits · Labs · IV",
    "Lane A & core services",
    `
    <div class="two-col">
      <div>
        <h3>Visits &amp; labs</h3>
        ${tableHtml(["Service", "Price", "Notes"], VISIT_LAB_ROWS)}
      </div>
      <div>
        <h3>IV boosters (add-ons)</h3>
        ${tableHtml(["Add-on", "Price", "Member", "Description"], IV_ADDON_ROWS)}
        <div class="callout"><strong>ELEVATED IV ($199/mo):</strong> 2 complimentary signature drips each month · 20% off boosters &amp; extra IV · priority booking · no Rx meds · no labs.</div>
      </div>
    </div>
    <h3>IV signature drips (walk-in · RN-administered)</h3>
    ${tableHtml(["Drip", "Walk-in", "Member", "Category", "Ingredients"], IV_DRIP_ROWS)}
    `,
  );

  const page3 = pageShell(
    "Hormones · GLP-1",
    "Rx programs & fills",
    `
    <h3>Hormone à la carte fills</h3>
    ${tableHtml(["Product", "Non-member", "Member", "Program note"], HORMONE_FILL_ROWS)}
    <div class="callout"><strong>TRT:</strong> testosterone cream only — no injectable cypionate. <strong>HRT:</strong> Bi-Est + progesterone (+ T cream if Rx). No troches. No anastrozole or HCG.</div>
    <h3>Weight loss — GLP-1</h3>
    ${tableHtml(["Product", "Price", "Member / notes"], GLP1_ROWS.map((r) => [r[0], r[1], r.slice(2).join(" · ")]))}
    <div class="callout callout-warn"><strong>Retatrutide:</strong> physician-gated within GLP-1 lane · full investigational consent · never advertise or lead with it.</div>
    `,
  );

  const page4 = pageShell(
    "Peptides",
    "Consult-gated catalog",
    `
    <div class="two-col">
      <div>
        <h3>Monthly peptides</h3>
        ${tableHtml(["Peptide", "Price", "Member", "Notes"], PEPTIDE_MONTHLY_ROWS)}
        <h3>Metabolic (provider-only)</h3>
        ${tableHtml(["Peptide", "Price", "Member", "Notes"], METABOLIC_PEPTIDE_ROWS)}
      </div>
      <div>
        <h3>Recovery — one-time fills</h3>
        ${tableHtml(["Product", "Price", "Member", "Notes"], RECOVERY_PEPTIDE_ROWS)}
        <div class="callout"><strong>NAD+:</strong> IV booster push only ($50) — no peptide NAD+ SKUs.</div>
      </div>
    </div>
    <h3>Sexual wellness (launch-hidden — do not promote)</h3>
    ${tableHtml(["Product", "Price", "Member", "Notes"], SEXUAL_WELLNESS_ROWS)}
    <h3>Hair restoration (launch-hidden — do not promote)</h3>
    ${tableHtml(["Product", "Price", "Member", "Notes"], HAIR_ROWS)}
    `,
  );

  const page5 = pageShell(
    "Staff reminders",
    "Policies & quoting rules",
    `
    <ul class="policy-list">
      ${POLICY_BULLETS.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}
    </ul>
    <div class="callout" style="margin-top: 0.75rem;">
      <strong>Member discount math:</strong> non-member price × 0.80 on all eligible à la carte.
      Program medication &amp; bundled quarterly labs = $0 while membership is active.
    </div>
    <div class="callout">
      <strong>First-month typical investment:</strong> $79 assessment + $199–$299 baseline labs + first program month ($199–$449) = roughly $477–$827 predictable thereafter.
    </div>
    `,
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(m.clinic)} — ${escapeHtml(m.title)}</title>
  <style>${CHEAT_SHEET_CSS}</style>
</head>
<body>
  ${cover}
  ${page1}
  ${page2}
  ${page3}
  ${page4}
  ${page5}
</body>
</html>`;
}

export function downloadFormularyCheatSheetHtml(): void {
  const blob = new Blob([buildFormularyCheatSheetHtml()], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${CHEAT_SHEET_FILENAME_BASE}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadFormularyCheatSheetMarkdown(): void {
  const blob = new Blob([buildFormularyCheatSheetMarkdown()], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${CHEAT_SHEET_FILENAME_BASE}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
