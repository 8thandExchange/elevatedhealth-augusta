/**
 * Writes medication & infusion cheat sheet to docs/clinical/ and public/downloads/.
 * Run: npx tsx scripts/generate-medication-cheat-sheet.ts
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import {
  buildMedicationCheatSheetHtml,
  buildMedicationCheatSheetMarkdown,
  MEDICATION_CHEAT_SHEET_FILENAME_BASE,
} from "../src/lib/formularyMedicationExport";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const targets = [join(root, "docs", "clinical"), join(root, "public", "downloads")];

const html = buildMedicationCheatSheetHtml();
const md = buildMedicationCheatSheetMarkdown();

for (const dir of targets) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${MEDICATION_CHEAT_SHEET_FILENAME_BASE}.md`), md, "utf8");
  writeFileSync(join(dir, `${MEDICATION_CHEAT_SHEET_FILENAME_BASE}.html`), html, "utf8");
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

async function renderPdf(htmlPath: string, pdfPath: string): Promise<boolean> {
  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });
    await page.pdf({
      path: pdfPath,
      printBackground: true,
      preferCSSPageSize: true,
    });
    await browser.close();
    return existsSync(pdfPath);
  } catch (err) {
    console.warn("Playwright PDF failed, trying Chrome headless:", err);
  }

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

const primaryHtml = join(root, "docs", "clinical", `${MEDICATION_CHEAT_SHEET_FILENAME_BASE}.html`);
const primaryPdf = join(root, "docs", "clinical", `${MEDICATION_CHEAT_SHEET_FILENAME_BASE}.pdf`);
const pdfOk = await renderPdf(primaryHtml, primaryPdf);

if (pdfOk) {
  for (const dir of targets) {
    copyFileSync(primaryPdf, join(dir, `${MEDICATION_CHEAT_SHEET_FILENAME_BASE}.pdf`));
    copyFileSync(primaryPdf, join(dir, "EHA-Medication-Infusion-Cheat-Sheet.pdf"));
  }
}

console.log(
  `Generated ${MEDICATION_CHEAT_SHEET_FILENAME_BASE}.{md,html${pdfOk ? ",pdf" : ""}} in docs/clinical/ and public/downloads/`,
);
