/**
 * Writes formulary cheat sheet to docs/clinical/ and public/downloads/ (MD, HTML, PDF).
 * Run: npx tsx scripts/generate-formulary-cheat-sheet.ts
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import {
  buildFormularyCheatSheetHtml,
  buildFormularyCheatSheetMarkdown,
  CHEAT_SHEET_FILENAME_BASE,
} from "../src/lib/formularyCheatSheetExport";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const targets = [
  join(root, "docs", "clinical"),
  join(root, "public", "downloads"),
];

const html = buildFormularyCheatSheetHtml();
const md = buildFormularyCheatSheetMarkdown();

for (const dir of targets) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${CHEAT_SHEET_FILENAME_BASE}.md`), md, "utf8");
  writeFileSync(join(dir, `${CHEAT_SHEET_FILENAME_BASE}.html`), html, "utf8");
}

function chromePath(): string | null {
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

function renderPdf(htmlPath: string, pdfPath: string): void {
  const chrome = chromePath();
  if (!chrome) {
    console.warn("Chrome/Chromium not found — skipped PDF generation.");
    return;
  }
  execSync(
    `"${chrome}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "file://${htmlPath}"`,
    { stdio: "pipe" },
  );
}

const primaryHtml = join(root, "docs", "clinical", `${CHEAT_SHEET_FILENAME_BASE}.html`);
const primaryPdf = join(root, "docs", "clinical", `${CHEAT_SHEET_FILENAME_BASE}.pdf`);
renderPdf(primaryHtml, primaryPdf);
if (existsSync(primaryPdf)) {
  copyFileSync(primaryPdf, join(root, "public", "downloads", `${CHEAT_SHEET_FILENAME_BASE}.pdf`));
}

console.log(
  `Generated ${CHEAT_SHEET_FILENAME_BASE}.{md,html${existsSync(primaryPdf) ? ",pdf" : ""}} in docs/clinical/ and public/downloads/`,
);
