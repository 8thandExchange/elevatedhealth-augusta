/**
 * Print-ready Medication & Infusion cheat sheet — full 8-section layout from authoritative doc.
 */
import {
  ADMIN_MONITORING_BULLETS,
  AUTHORITY_BANNER,
  EMERGENCY_KIT_PLACEHOLDERS,
  FOOTER_DISCLAIMER,
  GLUTATHIONE_SECTION,
  IV_BASES_FOOTNOTE,
  IV_BASES_ROWS,
  IV_MEDICATION_PROTOCOL_SECTIONS,
  MEDICATION_CHEAT_SHEET_BRAND,
  MEDICATION_CHEAT_SHEET_FILENAME_BASE,
  MEDICATION_CHEAT_SHEET_META,
  MEYERS_MIXING_CAUTIONS,
  MYERS_SECTION,
  NAD250_SECTION,
  NAD500_SECTION,
  NUTRIENT_ADDON_ROWS,
  OTHER_DRIPS_ROWS,
  PRESCRIPTION_INJECTABLES_SECTION_INTRO,
  PRESCRIPTION_INJECTABLE_DRAFTS,
  REACTION_PROTOCOL_WARNING,
  REACTION_RESPONSE_BULLETS,
  SAFETY_DRUG_BULLETS,
  SAFETY_SCREEN_BULLETS,
  USP797_PREPARATION_SECTION_MARKDOWN,
  buildIvMedicationCardRows,
  buildMedicationProtocolTableRows,
  glutathioneOpenNotesSummary,
  myersG6pdOpenNote,
} from "./formularyMedicationContent";
import { unresolvedReviewerNotes } from "./clinicalProtocolSeedIv";

export { MEDICATION_CHEAT_SHEET_FILENAME_BASE };

export const MEDICATION_CHEAT_SHEET_PDF_PATH = `/downloads/${MEDICATION_CHEAT_SHEET_FILENAME_BASE}.pdf`;
export const MEDICATION_CHEAT_SHEET_HTML_PATH = `/downloads/${MEDICATION_CHEAT_SHEET_FILENAME_BASE}.html`;

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

function kvTable(rows: readonly (readonly string[])[]): string {
  const trs = rows
    .map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`)
    .join("");
  return `<table class="kv"><tbody>${trs}</tbody></table>`;
}

function bulletList(items: readonly string[]): string {
  return `<ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
}

function openNoteCallout(text: string): string {
  return `<div class="callout-reviewer"><strong>OPEN reviewer note (unresolved at signing):</strong> ${escapeHtml(text)}</div>`;
}

function renderMarkdownBlocks(md: string): string {
  const lines = md.split("\n");
  const parts: string[] = [];
  let inList = false;
  let listTag = "ul";
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) {
        parts.push(`</${listTag}>`);
        inList = false;
      }
      continue;
    }
    if (trimmed.startsWith("### ")) {
      if (inList) {
        parts.push(`</${listTag}>`);
        inList = false;
      }
      parts.push(`<h4>${escapeHtml(trimmed.slice(4))}</h4>`);
      continue;
    }
    if (trimmed.startsWith("> ")) {
      if (inList) {
        parts.push(`</${listTag}>`);
        inList = false;
      }
      const text = trimmed.slice(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      parts.push(`<div class="callout-info">${text}</div>`);
      continue;
    }
    if (/^\d+\.\s/.test(trimmed)) {
      if (!inList || listTag !== "ol") {
        if (inList) parts.push(`</${listTag}>`);
        parts.push("<ol>");
        inList = true;
        listTag = "ol";
      }
      parts.push(`<li>${escapeHtml(trimmed.replace(/^\d+\.\s/, ""))}</li>`);
      continue;
    }
    if (trimmed.startsWith("- ")) {
      if (!inList || listTag !== "ul") {
        if (inList) parts.push(`</${listTag}>`);
        parts.push("<ul>");
        inList = true;
        listTag = "ul";
      }
      const text = trimmed.slice(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      parts.push(`<li>${text}</li>`);
      continue;
    }
    if (trimmed.startsWith("|") && trimmed.includes("---")) continue;
    if (trimmed.startsWith("|")) {
      if (inList) {
        parts.push(`</${listTag}>`);
        inList = false;
      }
      continue;
    }
    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      if (inList) {
        parts.push(`</${listTag}>`);
        inList = false;
      }
      parts.push(`<p><strong>${escapeHtml(trimmed.slice(2, -2))}</strong></p>`);
      continue;
    }
    if (inList) {
      parts.push(`</${listTag}>`);
      inList = false;
    }
    const text = trimmed.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    parts.push(`<p>${text}</p>`);
  }
  if (inList) parts.push(`</${listTag}>`);
  return parts.join("\n");
}

const CSS = `
  @page { size: letter portrait; margin: 0.45in; }
  :root {
    --navy: ${MEDICATION_CHEAT_SHEET_BRAND.navy};
    --steel: ${MEDICATION_CHEAT_SHEET_BRAND.steel};
    --paper: ${MEDICATION_CHEAT_SHEET_BRAND.paper};
    --ink: ${MEDICATION_CHEAT_SHEET_BRAND.ink};
    --muted: ${MEDICATION_CHEAT_SHEET_BRAND.muted};
    --warn-bg: ${MEDICATION_CHEAT_SHEET_BRAND.warnBg};
    --warn-border: ${MEDICATION_CHEAT_SHEET_BRAND.warnBorder};
    --danger-bg: ${MEDICATION_CHEAT_SHEET_BRAND.dangerBg};
    --danger-border: ${MEDICATION_CHEAT_SHEET_BRAND.dangerBorder};
    --draft-bg: ${MEDICATION_CHEAT_SHEET_BRAND.draftBg};
    --border: #C9D4DD;
  }
  * { box-sizing: border-box; }
  body { font-family: 'Jost', system-ui, sans-serif; color: var(--ink); background: var(--paper); margin: 0; font-size: 8.5pt; line-height: 1.35; }
  .cover { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: var(--navy); color: var(--paper); padding: 2rem; page-break-after: always; }
  .cover h1 { font-family: Georgia, serif; font-weight: 400; font-size: 1.65rem; margin: 0.25rem 0; }
  .cover h1 em { font-style: italic; color: var(--steel); }
  .cover .sub { font-size: 0.95rem; opacity: 0.9; }
  .cover .meta { margin-top: 2rem; font-size: 0.75rem; opacity: 0.75; line-height: 1.6; }
  .cover .version { margin-top: 1.5rem; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--steel); }
  .page { padding: 0.1in 0; page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  .page-header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid var(--steel); padding-bottom: 0.35rem; margin-bottom: 0.65rem; }
  .page-header h2 { font-family: Georgia, serif; font-size: 1.05rem; margin: 0; color: var(--navy); }
  .page-header .tag { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
  h3 { font-family: Georgia, serif; font-size: 0.82rem; margin: 0.65rem 0 0.35rem; color: var(--navy); text-transform: uppercase; letter-spacing: 0.06em; }
  h4 { font-size: 0.75rem; color: var(--navy); margin: 0.5rem 0 0.25rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.68rem; margin: 0.35rem 0 0.5rem; page-break-inside: avoid; }
  th, td { border: 1px solid var(--border); padding: 0.28rem 0.4rem; text-align: left; vertical-align: top; }
  th { background: var(--navy); color: var(--paper); font-weight: 600; font-size: 0.62rem; }
  table.kv th { width: 28%; background: var(--navy); }
  ul, ol { margin: 0.2rem 0 0.35rem; padding-left: 1.1rem; font-size: 0.68rem; }
  li { margin-bottom: 0.15rem; }
  .authority { background: var(--draft-bg); border: 1px solid var(--border); border-left: 3px solid var(--navy); padding: 0.45rem 0.55rem; font-size: 0.68rem; margin-bottom: 0.65rem; white-space: pre-line; }
  .callout-reviewer { background: var(--warn-bg); border: 1px solid var(--warn-border); border-left: 3px solid var(--warn-border); padding: 0.35rem 0.5rem; font-size: 0.65rem; margin: 0.35rem 0; }
  .callout-draft { background: var(--draft-bg); border: 1px solid var(--navy); border-left: 3px solid var(--navy); padding: 0.4rem 0.55rem; font-size: 0.68rem; margin: 0.5rem 0; }
  .callout-danger { background: var(--danger-bg); border: 1px solid var(--danger-border); border-left: 3px solid var(--danger-border); padding: 0.4rem 0.55rem; font-size: 0.68rem; margin: 0.5rem 0; }
  .callout-info { background: var(--draft-bg); border-left: 3px solid var(--steel); padding: 0.35rem 0.5rem; font-size: 0.65rem; margin: 0.35rem 0; font-style: italic; }
  .draft-block { page-break-inside: avoid; margin-bottom: 0.55rem; padding: 0.35rem 0.45rem; border: 1px dashed var(--steel); border-radius: 3px; }
  .draft-block h4 { margin-top: 0; }
  .footer-note { font-size: 0.58rem; color: var(--muted); text-align: center; margin-top: 0.5rem; border-top: 1px solid var(--border); padding-top: 0.35rem; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
`;

function pageShell(tag: string, title: string, body: string): string {
  return `<section class="page"><div class="page-header"><h2>${escapeHtml(title)}</h2><span class="tag">${escapeHtml(tag)} · v${MEDICATION_CHEAT_SHEET_META.version}</span></div>${body}<div class="footer-note">${escapeHtml(MEDICATION_CHEAT_SHEET_META.clinic)} · ${escapeHtml(MEDICATION_CHEAT_SHEET_META.phone)} · Clinical staff only</div></section>`;
}

function myersSectionHtml(): string {
  const s = IV_MEDICATION_PROTOCOL_SECTIONS.find((p) => p.slug === "iv-myers-cocktail")!;
  const components = MYERS_SECTION.myers_components ?? [];
  const g6pd = myersG6pdOpenNote();
  return `
    <h3>2. Myers Cocktail (protocol: iv-myers-cocktail)</h3>
    ${tableHtml(["Component", "Amount"], components)}
    <p><strong>Administration:</strong> IV infusion over ${escapeHtml(s.duration)}. ${escapeHtml(s.administration.join(". "))}.</p>
    <p><strong>Pre-administration checks (protocol):</strong> ${escapeHtml(s.preAdministrationChecks.join(" · "))}</p>
    <p><strong>Monitoring (protocol):</strong> ${escapeHtml(s.monitoringDuring.join(" · "))}</p>
    ${g6pd ? openNoteCallout(g6pd) : ""}
    ${bulletList(MEYERS_MIXING_CAUTIONS)}`;
}

function nadSectionHtml(slug: "iv-nad-250mg" | "iv-nad-500mg", heading: string): string {
  const seed = slug === "iv-nad-250mg" ? NAD250_SECTION : NAD500_SECTION;
  const s = IV_MEDICATION_PROTOCOL_SECTIONS.find((p) => p.slug === slug)!;
  const notes = unresolvedReviewerNotes(seed)
    .map((n) => openNoteCallout(n.note))
    .join("");
  return `
    <h4>${escapeHtml(heading)} (${escapeHtml(slug)})</h4>
    <ul>
      <li>${escapeHtml(seed.formulation)}</li>
      <li>Infusion ${escapeHtml(s.duration)}</li>
      <li>Route: ${escapeHtml(s.route)} · Dose: ${escapeHtml(s.dose)}</li>
      <li>Pre-administration checks: ${escapeHtml(s.preAdministrationChecks.join(" · "))}</li>
      <li>Monitoring: ${escapeHtml(s.monitoringDuring.join(" · "))}</li>
    </ul>
    ${notes}`;
}

function glutathioneSectionHtml(): string {
  const s = IV_MEDICATION_PROTOCOL_SECTIONS.find((p) => p.slug === "iv-glutathione-push")!;
  const notes = glutathioneOpenNotesSummary();
  return `
    <h4>Glutathione Push (iv-glutathione-push)</h4>
    <ul>
      <li>${escapeHtml(GLUTATHIONE_SECTION.formulation)} over ${escapeHtml(s.duration)}</li>
      <li>Dose: ${escapeHtml(s.dose)} · Route: ${escapeHtml(s.route)}</li>
      <li>Pre-administration checks: ${escapeHtml(s.preAdministrationChecks.join(" · "))}</li>
      <li>Monitoring: ${escapeHtml(s.monitoringDuring.join(" · "))}</li>
    </ul>
    ${notes.length ? `<div class="callout-reviewer"><strong>OPEN reviewer notes (unresolved at signing):</strong> ${escapeHtml(notes.join(" · "))}</div>` : ""}`;
}

function prescriptionDraftsHtml(): string {
  return PRESCRIPTION_INJECTABLE_DRAFTS.map((d) => {
    const notes = d.openReviewerNotes.map((n) => openNoteCallout(n)).join("");
    return `<div class="draft-block"><h4>${escapeHtml(d.displayName)} (${escapeHtml(d.generic)}) [DRAFT · ${escapeHtml(d.slug)}]</h4><div class="callout-draft"><strong>Status:</strong> ${escapeHtml(d.status)}</div>${bulletList(d.dosingLines)}${notes}</div>`;
  }).join("");
}

export function buildMedicationCheatSheetMarkdown(): string {
  const protocolBlocks = IV_MEDICATION_PROTOCOL_SECTIONS.map((s) => {
    const reviewer = s.openReviewerNotes.length
      ? `\n\n**OPEN reviewer notes:**\n${s.openReviewerNotes.map((n) => `- ${n}`).join("\n")}`
      : "";
    return `### ${s.title}\n\n${buildMedicationProtocolTableRows(s).map(([k, v]) => `- **${k}:** ${v}`).join("\n")}${reviewer}`;
  }).join("\n\n");

  const drafts = PRESCRIPTION_INJECTABLE_DRAFTS.map((d) => {
    const reviewer = d.openReviewerNotes.length
      ? `\n\n**OPEN reviewer notes:**\n${d.openReviewerNotes.map((n) => `- ${n}`).join("\n")}`
      : "";
    return `### ${d.displayName} (${d.generic}) [DRAFT · ${d.slug}]\n\n${d.dosingLines.map((l) => `- ${l}`).join("\n")}\n\n**Status:** ${d.status}${reviewer}`;
  }).join("\n\n");

  return [
    `# ${MEDICATION_CHEAT_SHEET_META.clinic} — ${MEDICATION_CHEAT_SHEET_META.title}`,
    "",
    `> ${MEDICATION_CHEAT_SHEET_META.classification} · v${MEDICATION_CHEAT_SHEET_META.version}`,
    "",
    AUTHORITY_BANNER,
    "",
    "## 1. IV Bases and Fluids",
    "",
    IV_BASES_ROWS.map((r) => `| ${r.join(" | ")} |`).join("\n"),
    "",
    IV_BASES_FOOTNOTE,
    "",
    "## 2–3. IV Protocols (from seed)",
    "",
    protocolBlocks,
    "",
    "## 4. Preparation / Reconstitution / Admixture (USP 797)",
    "",
    USP797_PREPARATION_SECTION_MARKDOWN,
    "",
    "## 6. Prescription Injectables (drafts — pending signature)",
    "",
    PRESCRIPTION_INJECTABLES_SECTION_INTRO,
    "",
    drafts,
    "",
    FOOTER_DISCLAIMER,
    "",
  ].join("\n");
}

export function buildMedicationCheatSheetHtml(): string {
  const m = MEDICATION_CHEAT_SHEET_META;
  const cover = `<section class="cover"><h1><em>Medication</em> and Infusion<br/>Cheat Sheet</h1><p class="sub">${escapeHtml(m.subtitle)}</p><p class="meta">${escapeHtml(m.address)}<br/>${escapeHtml(m.phone)}</p><p class="version">${escapeHtml(m.classification)} · ${m.effectiveDate}</p></section>`;

  const page1 = pageShell(
    "Authority · Bases · Myers",
    "Sections 1–2",
    `<div class="authority">${escapeHtml(AUTHORITY_BANNER)}</div>
     <h3>1. IV Bases and Fluids</h3>
     ${tableHtml(["Base", "Common volume", "Notes"], IV_BASES_ROWS)}
     <p>${escapeHtml(IV_BASES_FOOTNOTE)}</p>
     ${myersSectionHtml()}`,
  );

  const page2 = pageShell(
    "IV Infusions",
    "Section 3 — protocol of record",
    `<h3>3. IV Infusions</h3>
     ${nadSectionHtml("iv-nad-250mg", "NAD+ 250 mg")}
     ${nadSectionHtml("iv-nad-500mg", "NAD+ 500 mg")}
     ${glutathioneSectionHtml()}
     <h4>Other drips on the menu</h4>
     ${tableHtml(["Drip", "Core contents", "Typical run time"], OTHER_DRIPS_ROWS)}`,
  );

  const page3 = pageShell(
    "USP 797",
    "Section 4 — Preparation",
    `<h3>4. Preparation, Reconstitution, and Admixture</h3>
     ${renderMarkdownBlocks(USP797_PREPARATION_SECTION_MARKDOWN)}`,
  );

  const page4 = pageShell(
    "Add-ons · Rx drafts",
    "Sections 5–6",
    `<h3>5. Nutrient Add-Ons</h3>
     ${tableHtml(["Add-on", "Reference dose", "Route and rate", "Key notes"], NUTRIENT_ADDON_ROWS)}
     <h3>6. Prescription Injectables (drafts, pending signature)</h3>
     <div class="callout-draft">${escapeHtml(PRESCRIPTION_INJECTABLES_SECTION_INTRO)}</div>
     ${prescriptionDraftsHtml()}`,
  );

  const page5 = pageShell(
    "Monitoring · Safety",
    "Sections 7–8",
    `<h3>7. Administration and Monitoring</h3>
     ${bulletList(ADMIN_MONITORING_BULLETS)}
     <h3>8. Safety Flags, Contraindications, and Reactions</h3>
     <p><strong>Screen before these specifically:</strong></p>
     ${bulletList(SAFETY_SCREEN_BULLETS)}
     <p><strong>Drug-specific:</strong></p>
     ${bulletList(SAFETY_DRUG_BULLETS)}
     <div class="callout-danger"><strong>Reaction response — ${escapeHtml(REACTION_PROTOCOL_WARNING)}</strong></div>
     ${bulletList(REACTION_RESPONSE_BULLETS)}
     ${bulletList(EMERGENCY_KIT_PLACEHOLDERS)}
     <p style="font-size:0.62rem;font-style:italic;margin-top:0.75rem">${escapeHtml(FOOTER_DISCLAIMER)}</p>`,
  );

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>${escapeHtml(m.clinic)} — ${escapeHtml(m.title)}</title><style>${CSS}</style></head><body>${cover}${page1}${page2}${page3}${page4}${page5}</body></html>`;
}

export function buildMedicationCheatSheetFragmentHtml(): string {
  return `
    <h3 style="margin-top:0">IV medication protocols (clinical seed)</h3>
    <table>
      <thead><tr><th>Protocol</th><th>Dose · base</th><th>Route · duration</th><th>Checks / monitoring</th></tr></thead>
      <tbody>${buildIvMedicationCardRows().map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
    <div class="callout callout-warn" style="margin-top:0.4rem">
      <strong>Rx add-ons (Toradol · Zofran · Benadryl · Pepcid):</strong> protocol drafts pending Dr. Akers signature — do not administer until signed.
    </div>`;
}

export function downloadMedicationCheatSheetHtml(): void {
  const blob = new Blob([buildMedicationCheatSheetHtml()], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${MEDICATION_CHEAT_SHEET_FILENAME_BASE}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
