/**
 * Print-ready Staff Quick Reference Card — 3-page desk PDF (process + menu + rules).
 */
import {
  CHARGE_CHECKPOINTS,
  COMBO_ADDON_ROWS,
  DO_SAY,
  DONT_SAY,
  GLP1_ROWS,
  IV_DRIP_ROWS,
  LANE_A_IV_STEPS,
  LANE_B_CONSULT_STEPS,
  NOT_INCLUDED,
  PATIENT_JOURNEY_PHASES,
  QUICK_CARD_FILENAME_BASE,
  QUICK_CARD_META,
  QUICK_REFERENCE,
  RECOVERY_STACK,
  STAFF_OPENING_SCRIPT,
  TEAM_ROWS,
  VISIT_LAB_ROWS,
  MEMBERSHIP_ROWS,
} from "./staffQuickCardContent";

export { QUICK_CARD_FILENAME_BASE };

export const QUICK_CARD_PDF_PATH = `/downloads/${QUICK_CARD_FILENAME_BASE}.pdf`;
export const QUICK_CARD_HTML_PATH = `/downloads/${QUICK_CARD_FILENAME_BASE}.html`;

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
  :root {
    --charcoal: #2A2826;
    --camel: #B8956A;
    --bone: #F2EBDC;
    --surface: #faf8f4;
    --muted: #6b6560;
    --border: #d4cfc6;
    --green: #1a5f1a;
    --red: #8b2e2e;
  }
  * { box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', system-ui, sans-serif;
    color: var(--charcoal);
    margin: 0;
    font-size: 8pt;
    line-height: 1.32;
  }
  .cover {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: var(--charcoal);
    color: var(--bone);
    padding: 1.5rem;
    page-break-after: always;
  }
  .cover .mark {
    width: 52px; height: 52px;
    border: 2px solid var(--camel);
    border-radius: 3px;
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 1.75rem;
    line-height: 48px;
    margin-bottom: 0.75rem;
  }
  .cover h1 {
    font-family: Georgia, serif;
    font-weight: 400;
    font-size: 1.55rem;
    margin: 0.2rem 0;
    max-width: 24rem;
  }
  .cover h1 em { color: var(--camel); font-style: italic; }
  .cover .sub { font-size: 0.9rem; opacity: 0.92; margin-top: 0.35rem; }
  .cover .meta { margin-top: 1.25rem; font-size: 0.72rem; opacity: 0.78; line-height: 1.55; }
  .cover .version {
    margin-top: 1rem;
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--camel);
  }
  .page { page-break-after: always; padding: 0.05in 0; }
  .page:last-child { page-break-after: auto; }
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 2px solid var(--camel);
    padding-bottom: 0.3rem;
    margin-bottom: 0.5rem;
  }
  .page-header h2 {
    font-family: Georgia, serif;
    font-size: 1rem;
    margin: 0;
  }
  .page-header .tag {
    font-size: 0.58rem;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--muted);
  }
  h3 {
    font-family: Georgia, serif;
    font-size: 0.75rem;
    margin: 0.5rem 0 0.25rem;
    color: var(--camel);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .script {
    background: var(--surface);
    border-left: 3px solid var(--camel);
    padding: 0.45rem 0.55rem;
    font-size: 0.72rem;
    font-style: italic;
    margin-bottom: 0.5rem;
  }
  .quick-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.35rem;
    margin-bottom: 0.5rem;
  }
  .quick-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 0.35rem;
    text-align: center;
  }
  .quick-card .lbl {
    font-size: 0.55rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
  }
  .quick-card .val { font-size: 0.68rem; font-weight: 600; margin-top: 0.15rem; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
  .lane {
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 0.4rem 0.5rem;
    background: var(--surface);
    page-break-inside: avoid;
  }
  .lane-a { border-top: 3px solid #4a7c59; }
  .lane-b { border-top: 3px solid var(--camel); }
  .lane h4 {
    font-size: 0.72rem;
    margin: 0 0 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .lane ol {
    margin: 0;
    padding-left: 1.1rem;
    font-size: 0.65rem;
  }
  .lane li { margin-bottom: 0.15rem; }
  .journey {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.25rem 0.5rem;
    font-size: 0.65rem;
  }
  .journey-item {
    display: flex;
    gap: 0.35rem;
    align-items: flex-start;
    page-break-inside: avoid;
  }
  .journey-num {
    flex-shrink: 0;
    width: 1.1rem;
    height: 1.1rem;
    background: var(--charcoal);
    color: var(--bone);
    border-radius: 2px;
    font-size: 0.58rem;
    font-weight: 700;
    text-align: center;
    line-height: 1.1rem;
  }
  .journey-title { font-weight: 600; font-size: 0.66rem; }
  .journey-detail { color: var(--muted); font-size: 0.62rem; }
  .membership-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.35rem;
    margin-bottom: 0.4rem;
  }
  .membership-card {
    border: 1px solid var(--border);
    border-left: 3px solid var(--camel);
    border-radius: 3px;
    padding: 0.35rem 0.45rem;
    background: var(--surface);
    page-break-inside: avoid;
  }
  .membership-card .name {
    font-family: Georgia, serif;
    font-size: 0.78rem;
    font-weight: 600;
  }
  .membership-card .price {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--camel);
  }
  .membership-card .detail {
    font-size: 0.62rem;
    color: var(--muted);
    line-height: 1.28;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.64rem;
    margin: 0.25rem 0 0.4rem;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid var(--border);
    padding: 0.22rem 0.35rem;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: var(--charcoal);
    color: var(--bone);
    font-size: 0.58rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  tr:nth-child(even) td { background: rgba(184, 149, 106, 0.06); }
  .price { font-weight: 600; white-space: nowrap; }
  .callout {
    background: var(--surface);
    border: 1px solid var(--border);
    border-left: 3px solid var(--camel);
    padding: 0.35rem 0.45rem;
    font-size: 0.64rem;
    margin: 0.35rem 0;
  }
  .say-list, .dont-list {
    margin: 0;
    padding-left: 0.9rem;
    font-size: 0.64rem;
  }
  .say-list li { margin-bottom: 0.2rem; color: var(--green); }
  .say-list li span { color: var(--charcoal); }
  .dont-list li { margin-bottom: 0.2rem; color: var(--red); }
  .dont-list li span { color: var(--charcoal); }
  .team-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.3rem;
    font-size: 0.64rem;
  }
  .team-card {
    border: 1px solid var(--border);
    padding: 0.3rem 0.4rem;
    border-radius: 3px;
    background: var(--surface);
  }
  .team-card strong { display: block; font-size: 0.68rem; }
  .team-card em { font-size: 0.58rem; color: var(--muted); font-style: normal; }
  .footer {
    text-align: center;
    font-size: 0.58rem;
    color: var(--muted);
    border-top: 1px solid var(--border);
    padding-top: 0.3rem;
    margin-top: 0.4rem;
  }
  .footer strong { color: var(--charcoal); font-size: 0.72rem; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;

function page(tag: string, title: string, body: string): string {
  const m = QUICK_CARD_META;
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

export function buildStaffQuickCardHtml(): string {
  const m = QUICK_CARD_META;

  const cover = `
  <section class="cover">
    <div class="mark">E</div>
    <h1>Staff <em>Quick Reference</em></h1>
    <p class="sub">${escapeHtml(m.subtitle)}</p>
    <p class="meta">${escapeHtml(m.address)}<br/>${escapeHtml(m.phone)} · ${escapeHtml(m.domain)}</p>
    <p class="version">${escapeHtml(m.classification)} · v${m.version} · ${m.effectiveDate}</p>
  </section>`;

  const processPage = page(
    "Page 1",
    "How we work",
    `
    <div class="script">${escapeHtml(STAFF_OPENING_SCRIPT)}</div>
    <div class="quick-grid">
      ${QUICK_REFERENCE.map(
        (q) => `
        <div class="quick-card">
          <div class="lbl">${escapeHtml(q.label)}</div>
          <div class="val">${escapeHtml(q.value)}</div>
        </div>`,
      ).join("")}
    </div>
    <div class="two-col">
      <div class="lane lane-a">
        <h4>Lane A — IV Lounge (walk-in)</h4>
        <ol>${LANE_A_IV_STEPS.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
      </div>
      <div class="lane lane-b">
        <h4>Lane B — Consult-gated</h4>
        <ol>${LANE_B_CONSULT_STEPS.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
      </div>
    </div>
    <h3>Patient journey (every Lane B patient)</h3>
    <div class="journey">
      ${PATIENT_JOURNEY_PHASES.map(
        (p) => `
        <div class="journey-item">
          <div class="journey-num">${escapeHtml(p.label)}</div>
          <div>
            <div class="journey-title">${escapeHtml(p.title)} <span style="color:var(--muted);font-weight:400">· ${escapeHtml(p.owner)}</span></div>
            <div class="journey-detail">${escapeHtml(p.goal)}</div>
          </div>
        </div>`,
      ).join("")}
    </div>
    `,
  );

  const offerPage = page(
    "Page 2",
    "What we offer & pricing",
    `
    <h3>ELEVATED memberships — all-inclusive monthly</h3>
    <div class="membership-grid">
      ${MEMBERSHIP_ROWS.map(
        (r) => `
        <div class="membership-card">
          <div class="name">${escapeHtml(r.name)}</div>
          <div class="price">${escapeHtml(r.price)}</div>
          <div class="detail"><strong>Includes:</strong> ${escapeHtml(r.medication)} · ${escapeHtml(r.labs)}</div>
          <div class="detail">${escapeHtml(r.highlight)}</div>
        </div>`,
      ).join("")}
    </div>
    ${tableHtml(["Combo add-on (med only)", "Price", "Note"], COMBO_ADDON_ROWS)}
    <h3>Visits, labs & onboarding</h3>
    ${tableHtml(["Service", "Price", "Notes"], VISIT_LAB_ROWS)}
    <div class="callout">
      <strong>First month (typical):</strong> $79 assessment + $199–$299 baseline labs + first program month ($199–$449) ≈ <strong>$477–$827</strong> all-in, then predictable monthly thereafter.
    </div>
    <div class="callout">
      <strong>Not included in membership:</strong> ${NOT_INCLUDED.map((s) => escapeHtml(s)).join(" · ")}
    </div>
    <h3>Billing checkpoints (verify in Stripe before Rx ships)</h3>
    ${tableHtml(["Step", "Event", "Amount"], CHARGE_CHECKPOINTS.map((r) => [...r]))}
    `,
  );

  const ivCompact = IV_DRIP_ROWS.map((r) => [r[0], r[1], r[2]]);
  const glp1Compact = GLP1_ROWS.map((r) => [r[0], r[1], r.slice(2).join(" · ")]);

  const menuPage = page(
    "Page 3",
    "Menu highlights & staff rules",
    `
    <h3>IV Lounge — signature drips</h3>
    ${tableHtml(["Drip", "Walk-in", "Member −20%"], ivCompact)}
    <p style="font-size:0.62rem;color:var(--muted);margin:0 0 0.35rem">Boosters: NAD+ $50 · Glutathione $35 · B12 $25 · Toradol $25 · Vit C $25 · Zofran $25 (member −20%)</p>
    <div class="two-col">
      <div>
        <h3>GLP-1 / weight</h3>
        ${tableHtml(["Product", "Price", "Notes"], glp1Compact)}
      </div>
      <div>
        <h3>Recovery (consult-gated)</h3>
        ${tableHtml(["Product", "Price", "Notes"], [[RECOVERY_STACK.name, RECOVERY_STACK.displayPrice, RECOVERY_STACK.memberDisplay + " member · " + RECOVERY_STACK.note]])}
        <p style="font-size:0.62rem;color:var(--muted);margin-top:0.35rem">Full peptide &amp; à la carte pricing → Formulary Cheat Sheet (digital/PDF).</p>
      </div>
    </div>
    <div class="two-col" style="margin-top:0.35rem">
      <div>
        <h3>Do say</h3>
        <ul class="say-list">${DO_SAY.map((s) => `<li><span>${escapeHtml(s)}</span></li>`).join("")}</ul>
      </div>
      <div>
        <h3>Never say / offer</h3>
        <ul class="dont-list">${DONT_SAY.map((s) => `<li><span>${escapeHtml(s)}</span></li>`).join("")}</ul>
      </div>
    </div>
    <h3>Team</h3>
    <div class="team-grid">
      ${TEAM_ROWS.map(
        ([name, role, duties]) => `
        <div class="team-card">
          <strong>${escapeHtml(name)}</strong>
          <em>${escapeHtml(role)}</em>
          ${escapeHtml(duties)}
        </div>`,
      ).join("")}
    </div>
    <div class="callout" style="margin-top:0.4rem">
      <strong>Deep references:</strong> Formulary Cheat Sheet (every SKU) · SOP Manual (algorithms) · ${escapeHtml(m.portal)}
    </div>
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
  ${offerPage}
  ${menuPage}
</body>
</html>`;
}

export function buildStaffQuickCardMarkdown(): string {
  const m = QUICK_CARD_META;
  return [
    `# ${m.clinic} — ${m.title}`,
    "",
    `> ${m.classification} · v${m.version} · ${m.effectiveDate}`,
    "",
    `**${m.address}** · ${m.phone}`,
    "",
    "## Opening script",
    "",
    STAFF_OPENING_SCRIPT,
    "",
    "## Lane A — IV Lounge",
    "",
    ...LANE_A_IV_STEPS.map((s) => `- ${s}`),
    "",
    "## Lane B — Consult-gated",
    "",
    ...LANE_B_CONSULT_STEPS.map((s) => `- ${s}`),
    "",
    "## Patient journey",
    "",
    ...PATIENT_JOURNEY_PHASES.map((p) => `- **${p.title}** (${p.owner}): ${p.goal}`),
    "",
    "## ELEVATED programs",
    "",
    ...MEMBERSHIP_ROWS.map((r) => `- **${r.name}** ${r.price} — ${r.highlight}`),
    "",
    "See Formulary Cheat Sheet for complete SKU list.",
    "",
  ].join("\n");
}

export function downloadStaffQuickCardHtml(): void {
  const blob = new Blob([buildStaffQuickCardHtml()], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${QUICK_CARD_FILENAME_BASE}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
