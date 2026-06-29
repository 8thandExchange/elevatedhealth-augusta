/**
 * Writes staff quick reference + 1-page desk card to docs/clinical/ and public/downloads/.
 * Also copies stable short filenames for easy sharing.
 * Run: npx tsx scripts/generate-staff-quick-card.ts
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import {
  buildStaffDeskCardHtml,
  buildStaffQuickCardHtml,
  buildStaffQuickCardMarkdown,
  DESK_CARD_FILENAME_BASE,
  QUICK_CARD_FILENAME_BASE,
} from "../src/lib/staffQuickCardExport";
import {
  buildStaffMasterGuideHtml,
  buildStaffMasterGuideMarkdown,
  MASTER_GUIDE_FILENAME_BASE,
} from "../src/lib/staffMasterGuideExport";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const targets = [join(root, "docs", "clinical"), join(root, "public", "downloads")];

const fullHtml = buildStaffQuickCardHtml();
const deskHtml = buildStaffDeskCardHtml();
const md = buildStaffQuickCardMarkdown();
const masterHtml = buildStaffMasterGuideHtml();
const masterMd = buildStaffMasterGuideMarkdown();

for (const dir of targets) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${QUICK_CARD_FILENAME_BASE}.md`), md, "utf8");
  writeFileSync(join(dir, `${QUICK_CARD_FILENAME_BASE}.html`), fullHtml, "utf8");
  writeFileSync(join(dir, `${DESK_CARD_FILENAME_BASE}.html`), deskHtml, "utf8");
  writeFileSync(join(dir, `${MASTER_GUIDE_FILENAME_BASE}.md`), masterMd, "utf8");
  writeFileSync(join(dir, `${MASTER_GUIDE_FILENAME_BASE}.html`), masterHtml, "utf8");
}

function chromePath(): string | null {
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

function renderPdf(htmlPath: string, pdfPath: string): boolean {
  const chrome = chromePath();
  if (!chrome) {
    console.warn("Chrome/Chromium not found — skipped PDF generation.");
    return false;
  }
  execSync(
    `"${chrome}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "file://${htmlPath}"`,
    { stdio: "pipe" },
  );
  return existsSync(pdfPath);
}

const docsDir = join(root, "docs", "clinical");
const pubDir = join(root, "public", "downloads");

const fullHtmlPath = join(docsDir, `${QUICK_CARD_FILENAME_BASE}.html`);
const fullPdfPath = join(docsDir, `${QUICK_CARD_FILENAME_BASE}.pdf`);
const deskHtmlPath = join(docsDir, `${DESK_CARD_FILENAME_BASE}.html`);
const deskPdfPath = join(docsDir, `${DESK_CARD_FILENAME_BASE}.pdf`);
const masterHtmlPath = join(docsDir, `${MASTER_GUIDE_FILENAME_BASE}.html`);
const masterPdfPath = join(docsDir, `${MASTER_GUIDE_FILENAME_BASE}.pdf`);

const fullOk = renderPdf(fullHtmlPath, fullPdfPath);
const deskOk = renderPdf(deskHtmlPath, deskPdfPath);
const masterOk = renderPdf(masterHtmlPath, masterPdfPath);

for (const dir of [docsDir, pubDir]) {
  if (fullOk) {
    copyFileSync(fullPdfPath, join(dir, `${QUICK_CARD_FILENAME_BASE}.pdf`));
    copyFileSync(fullPdfPath, join(dir, "EHA-Staff-Quick-Reference.pdf"));
  }
  if (deskOk) {
    copyFileSync(deskPdfPath, join(dir, `${DESK_CARD_FILENAME_BASE}.pdf`));
    copyFileSync(deskPdfPath, join(dir, "EHA-Staff-Desk-Card.pdf"));
  }
  if (masterOk) {
    copyFileSync(masterPdfPath, join(dir, `${MASTER_GUIDE_FILENAME_BASE}.pdf`));
    copyFileSync(masterPdfPath, join(dir, "EHA-Staff-Complete-Reference.pdf"));
  }
}

console.log(
  [
    `Generated ${QUICK_CARD_FILENAME_BASE}.{md,html${fullOk ? ",pdf" : ""}}`,
    `Generated ${DESK_CARD_FILENAME_BASE}.{html${deskOk ? ",pdf" : ""}}`,
    fullOk ? "Stable: EHA-Staff-Quick-Reference.pdf" : "",
    deskOk ? "Stable: EHA-Staff-Desk-Card.pdf (1-page laminate)" : "",
    masterOk ? `Generated ${MASTER_GUIDE_FILENAME_BASE}.{md,html,pdf}` : "",
    masterOk ? "Stable: EHA-Staff-Complete-Reference.pdf (full formulary)" : "",
    "→ docs/clinical/ and public/downloads/",
  ]
    .filter(Boolean)
    .join("\n"),
);
