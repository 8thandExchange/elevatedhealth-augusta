/**
 * Pull-out reference cards — perforated-style laminate cards for front desk.
 * Print on letter stock; cut along dashed guides.
 */
import {
  CHARGE_CHECKPOINTS,
  COMBO_ADDON_ROWS,
  DO_SAY,
  DONT_SAY,
  GLP1_ROWS,
  IV_DRIP_ROWS,
  MEMBERSHIP_ROWS,
  QUICK_CARD_META,
  QUICK_REFERENCE,
  TEAM_ROWS,
  VISIT_LAB_ROWS,
} from "./staffQuickCardContent";
import { buildComboMatrixRows } from "./multiServiceAddonPlaybook";
import { LAB_PANEL_ORDERING_ROWS } from "./staffMasterGuideContent";
import { STAFF_PRINT_CSS_ROOT } from "./staffPrintBrand";

export const PULL_OUT_CARDS_META = {
  title: "Staff Pull-Out Reference Cards",
  subtitle: "Cut · laminate · keep at front desk",
  version: "1.0.0",
  effectiveDate: "2026-06-29",
  classification: "Internal — staff laminate cards (6-up on letter)",
} as const;

export const CARDS_FILENAME_BASE = `EHA-Staff-Pull-Out-Cards-v${PULL_OUT_CARDS_META.version}-${PULL_OUT_CARDS_META.effectiveDate}`;

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
  @page { size: letter portrait; margin: 0.25in; }
  ${STAFF_PRINT_CSS_ROOT}
  * { box-sizing: border-box; }
  body {
    font-family: 'Jost', 'Segoe UI', system-ui, sans-serif;
    color: var(--ink);
    margin: 0;
    font-size: 6.5pt;
    line-height: 1.25;
    background: var(--paper);
  }
  .sheet-title {
    text-align: center;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 10pt;
    color: var(--navy);
    margin-bottom: 0.12in;
    border-bottom: 2px solid var(--steel);
    padding-bottom: 0.06in;
  }
  .sheet-title small {
    display: block;
    font-family: 'Jost', sans-serif;
    font-size: 6pt;
    color: var(--muted);
    font-weight: 400;
    margin-top: 0.04in;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.12in;
  }
  .card {
    border: 2px dashed var(--border);
    border-radius: 4px;
    padding: 0.1in;
    min-height: 3.35in;
    page-break-inside: avoid;
    background: var(--paper);
  }
  .card-head {
    background: var(--navy);
    color: var(--paper);
    margin: -0.1in -0.1in 0.08in;
    padding: 0.06in 0.1in;
    border-radius: 2px 2px 0 0;
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 8pt;
  }
  .card-head span {
    float: right;
    font-family: 'Jost', sans-serif;
    font-size: 5.5pt;
    opacity: 0.85;
    font-weight: 400;
  }
  h3 {
    font-size: 6pt;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--steel);
    margin: 0.06in 0 0.03in;
  }
  table { width: 100%; border-collapse: collapse; font-size: 5.8pt; margin: 0.03in 0; }
  th, td { border: 1px solid var(--border); padding: 0.03in 0.04in; text-align: left; vertical-align: top; }
  th { background: var(--surface); color: var(--navy); font-size: 5.5pt; }
  ul { margin: 0; padding-left: 1em; font-size: 5.8pt; }
  li { margin-bottom: 0.02in; }
  .do { border-left: 2px solid var(--green); padding-left: 0.06in; }
  .dont { border-left: 2px solid var(--red); padding-left: 0.06in; }
  .foot {
    font-size: 5pt;
    color: var(--muted);
    text-align: center;
    margin-top: 0.08in;
    border-top: 1px solid var(--border);
    padding-top: 0.04in;
  }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;

function card(title: string, num: string, body: string): string {
  return `
  <div class="card">
    <div class="card-head">${escapeHtml(title)}<span>Card ${num}</span></div>
    ${body}
  </div>`;
}

export function buildPullOutCardsHtml(): string {
  const m = PULL_OUT_CARDS_META;
  const qr = QUICK_CARD_META;

  const card1 = card(
    "ELEVATED Programs",
    "1/6",
    `
    ${tableHtml(
      ["Program", "Price", "Includes"],
      MEMBERSHIP_ROWS.map((r) => [r.name.replace("ELEVATED ", ""), r.price, r.medication]),
    )}
    <h3>Combo add-ons</h3>
    ${tableHtml(["Add-on", "Price"], COMBO_ADDON_ROWS.slice(0, 4))}
    `,
  );

  const card2 = card(
    "IV Lounge",
    "2/6",
    `
    ${tableHtml(["Drip", "Walk-in", "Member"], IV_DRIP_ROWS.map((r) => [r[0], r[1], r[2]]))}
    <p style="margin:0.04in 0;font-size:5.8pt"><b>Boosters:</b> NAD+ $50 · Glutathione $35 · B12/Toradol/VitC/Zofran $25 · members −20%</p>
    <p style="margin:0;font-size:5.8pt;color:var(--muted)">Lane A — walk-in, no $79 consult required.</p>
    `,
  );

  const card3 = card(
    "Lab Panels",
    "3/6",
    `
    ${tableHtml(
      ["Pathway", "Panel", "Price"],
      LAB_PANEL_ORDERING_ROWS.slice(0, 6).map((r) => [r[0], r[1], r[2]]),
    )}
    ${tableHtml(["Visit / service", "Price"], VISIT_LAB_ROWS.slice(0, 5))}
    `,
  );

  const card4 = card(
    "Multi-Service Combos",
    "4/6",
    `
    <p style="margin:0 0 0.04in;font-size:5.8pt">Anchor + med add-on saves $100/mo vs two full programs.</p>
    ${tableHtml(
      ["Combo", "Total/mo", "Savings"],
      buildComboMatrixRows()
        .filter((r) => r[1] !== "—")
        .slice(0, 5)
        .map((r) => [r[0], r[1], r[3]]),
    )}
    `,
  );

  const card5 = card(
    "Billing Checkpoints",
    "5/6",
    `
    ${tableHtml(["Step", "Event", "Amount"], CHARGE_CHECKPOINTS.map((r) => [...r]))}
    <h3>Quick reference</h3>
    <ul>${QUICK_REFERENCE.slice(0, 5).map((q) => `<li><b>${escapeHtml(q.label)}:</b> ${escapeHtml(q.value)}</li>`).join("")}</ul>
    `,
  );

  const card6 = card(
    "Scripting & Team",
    "6/6",
    `
    <div class="do">
      <h3 style="margin-top:0">Do say</h3>
      <ul>${DO_SAY.slice(0, 3).map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
    </div>
    <div class="dont" style="margin-top:0.06in">
      <h3 style="margin-top:0">Never</h3>
      <ul>${DONT_SAY.slice(0, 4).map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
    </div>
    <h3>Team</h3>
    <ul>${TEAM_ROWS.map(([name, role]) => `<li><b>${escapeHtml(name)}</b> — ${escapeHtml(role)}</li>`).join("")}</ul>
    <p style="margin:0.04in 0 0;font-size:5.5pt">${escapeHtml(qr.phone)} · ${escapeHtml(qr.domain)}</p>
    `,
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(m.title)}</title>
  <style>${CSS}</style>
</head>
<body>
  <div class="sheet-title">
    ${escapeHtml(m.title)}
    <small>v${m.version} · ${m.effectiveDate} · ${escapeHtml(m.classification)} · Cut along dashed lines · laminate</small>
  </div>
  <div class="grid">
    ${card1}
    ${card2}
    ${card3}
    ${card4}
    ${card5}
    ${card6}
  </div>
  <div class="foot">Elevated Health Augusta · Complete Reference PDF for full formulary · Cost &amp; Margin = staff-only appendix</div>
</body>
</html>`;
}
