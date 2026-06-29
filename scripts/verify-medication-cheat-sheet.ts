/**
 * Verify IV medication cheat sheet values match seed migration exactly.
 * Run: npx tsx scripts/verify-medication-cheat-sheet.ts
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { IV_MEDICATION_PROTOCOL_SECTIONS, PRESCRIPTION_INJECTABLE_DRAFTS } from "../src/lib/formularyMedicationContent";
import { IV_CLINICAL_PROTOCOL_BY_SLUG } from "../src/lib/clinicalProtocolSeedIv";
import { IV_ADDON_PROTOCOL_BY_SLUG } from "../src/lib/clinicalProtocolSeedIvAddon";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationPath = join(
  root,
  "supabase/migrations/20260509140000_seed_clinical_protocol_drafts.sql",
);
const migrationSql = readFileSync(migrationPath, "utf8");

const SLUGS = [
  "iv-myers-cocktail",
  "iv-nad-250mg",
  "iv-nad-500mg",
  "iv-glutathione-push",
] as const;

type Check = { slug: string; field: string; expected: string; actual: string };

const failures: Check[] = [];
let passed = 0;

for (const slug of SLUGS) {
  const seed = IV_CLINICAL_PROTOCOL_BY_SLUG[slug];
  const section = IV_MEDICATION_PROTOCOL_SECTIONS.find((s) => s.slug === slug);
  if (!section) {
    failures.push({ slug, field: "section", expected: "present", actual: "MISSING" });
    continue;
  }

  const checks: Array<[string, string, string]> = [
    ["dose", seed.body_structured.dosing.dose, section.dose],
    ["duration", seed.body_structured.dosing.duration, section.duration],
    ["medication", seed.body_structured.dosing.medication, section.medication],
    ["route", seed.body_structured.dosing.route, section.route],
    ["frequency", seed.body_structured.dosing.frequency, section.frequency],
    ["formulation/base", seed.formulation, section.base],
  ];

  for (const [field, expected, actual] of checks) {
    if (expected === actual) {
      passed++;
      console.log(`✓ ${slug} · ${field}: ${JSON.stringify(actual)}`);
    } else {
      failures.push({ slug, field, expected, actual });
      console.error(`✗ ${slug} · ${field}`);
      console.error(`  expected: ${JSON.stringify(expected)}`);
      console.error(`  actual:   ${JSON.stringify(actual)}`);
    }
  }

  for (const check of seed.body_structured.pre_administration_checks) {
    if (section.preAdministrationChecks.includes(check)) {
      passed++;
      console.log(`✓ ${slug} · pre_check: ${JSON.stringify(check)}`);
    } else {
      failures.push({
        slug,
        field: `pre_check:${check}`,
        expected: check,
        actual: section.preAdministrationChecks.join("|"),
      });
    }
  }

  for (const mon of seed.body_structured.monitoring_during) {
    if (section.monitoringDuring.includes(mon)) {
      passed++;
      console.log(`✓ ${slug} · monitoring_during: ${JSON.stringify(mon)}`);
    } else {
      failures.push({
        slug,
        field: `monitoring_during:${mon}`,
        expected: mon,
        actual: section.monitoringDuring.join("|"),
      });
    }
  }

  const unresolved = seed.notes_for_reviewer.filter((n) => !n.resolved);
  if (unresolved.length === section.openReviewerNotes.length) {
    passed++;
    console.log(`✓ ${slug} · open reviewer notes: ${unresolved.length}`);
  } else {
    failures.push({
      slug,
      field: "open_reviewer_notes_count",
      expected: String(unresolved.length),
      actual: String(section.openReviewerNotes.length),
    });
  }

  for (const note of unresolved) {
    const normalized = note.note.replace(/\u2014/g, "—").replace(/\\u2014/g, "—");
    const inMigration =
      migrationSql.includes(note.note) ||
      migrationSql.includes(normalized) ||
      migrationSql.includes(note.note.replace(/—/g, "\\u2014"));
    if (!inMigration) {
      failures.push({
        slug,
        field: "migration_contains_note",
        expected: note.note.slice(0, 40),
        actual: "not found in migration SQL",
      });
    } else {
      passed++;
      console.log(`✓ ${slug} · note in migration: ${note.note.slice(0, 50)}…`);
    }
  }

  if (!migrationSql.includes(`'${slug}'`)) {
    failures.push({ slug, field: "migration_slug", expected: slug, actual: "not in migration" });
  } else {
    passed++;
    console.log(`✓ ${slug} · slug present in migration`);
  }
}

const ADDON_SLUGS = [
  "iv-addon-ketorolac-toradol",
  "iv-addon-ondansetron-zofran",
  "iv-addon-diphenhydramine-benadryl",
  "iv-addon-famotidine-pepcid",
] as const;

const addonMigrationPath = join(
  root,
  "supabase/migrations/20260629200000_resync_iv_addon_protocol_drafts_schema_matched.sql",
);
const addonMigrationSql = readFileSync(addonMigrationPath, "utf8");

for (const slug of ADDON_SLUGS) {
  const seed = IV_ADDON_PROTOCOL_BY_SLUG[slug];
  const draft = PRESCRIPTION_INJECTABLE_DRAFTS.find((d) => d.slug === slug);
  if (!draft) {
    failures.push({ slug, field: "draft_section", expected: "present", actual: "MISSING" });
    continue;
  }

  const d = seed.body_structured.dosing;
  const checks: Array<[string, string, string]> = [
    ["dose_in_draft", d.dose, draft.dosingLines.find((l) => l.startsWith("Dose:"))?.replace("Dose: ", "") ?? ""],
    ["route_in_draft", d.route, draft.dosingLines.find((l) => l.startsWith("Route:"))?.replace("Route: ", "") ?? ""],
    ["duration_in_draft", d.duration, draft.dosingLines.find((l) => l.startsWith("Rate / duration:"))?.replace("Rate / duration: ", "") ?? ""],
  ];

  for (const [field, expected, actual] of checks) {
    if (expected === actual) {
      passed++;
      console.log(`✓ ${slug} · ${field}: ${JSON.stringify(actual)}`);
    } else {
      failures.push({ slug, field, expected, actual });
    }
  }

  if (!seed.is_active) {
    passed++;
    console.log(`✓ ${slug} · is_active: false`);
  } else {
    failures.push({ slug, field: "is_active", expected: "false", actual: "true" });
  }

  const unresolved = seed.notes_for_reviewer.filter((n) => !n.resolved);
  if (unresolved.length === draft.openReviewerNotes.length) {
    passed++;
    console.log(`✓ ${slug} · open reviewer notes: ${unresolved.length}`);
  } else {
    failures.push({
      slug,
      field: "open_reviewer_notes_count",
      expected: String(unresolved.length),
      actual: String(draft.openReviewerNotes.length),
    });
  }

  for (const note of unresolved) {
    if (addonMigrationSql.includes(note.note)) {
      passed++;
      console.log(`✓ ${slug} · note in resync migration: ${note.note.slice(0, 50)}…`);
    } else {
      failures.push({
        slug,
        field: "migration_contains_note",
        expected: note.note.slice(0, 40),
        actual: "not found in resync migration SQL",
      });
    }
  }

  if (!addonMigrationSql.includes(`'${slug}'`)) {
    failures.push({ slug, field: "migration_slug", expected: slug, actual: "not in resync migration" });
  } else {
    passed++;
    console.log(`✓ ${slug} · slug present in resync migration`);
  }
}

console.log("\n---");
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failures.length}`);

if (failures.length) {
  console.error("\nVERIFICATION FAILED");
  process.exit(1);
}

console.log("\nVERIFICATION PASSED — IV and Rx add-on sections match seed migration values exactly.");
