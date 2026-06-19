// One-off generator: emit the consent v2 seed migration with bodies extracted
// byte-for-byte from the updated consent .ts files. Run with `node`.
import { readFileSync, writeFileSync } from "node:fs";

function extractBody(path) {
  const src = readFileSync(path, "utf8");
  const start = src.indexOf("body_markdown: `");
  if (start === -1) throw new Error(`body_markdown not found in ${path}`);
  const open = start + "body_markdown: `".length;
  const close = src.indexOf("`.trim()", open);
  if (close === -1) throw new Error(`closing backtick not found in ${path}`);
  return src.slice(open, close).trim();
}

const base = "src/data/consents";
const docs = [
  { type: "glp1", version: "2026-06-19-v2", prev: "2026-05-15-v1", title: "GLP-1 / Weight Management Informed Consent", tag: "eha_cv_glp1_v2", file: `${base}/glp1.ts` },
  { type: "research_peptide", version: "2026-06-19-v2", prev: "2026-05-15-v1", title: "Research Peptide Therapy Informed Consent", tag: "eha_cv_rp_v2", file: `${base}/research-peptide.ts` },
];

let sql = `-- STAGE consent v2 versions (generated from src/data/consents/*.ts; bodies byte-match).
-- glp1 v2 adds Section 11A (retatrutide investigational disclosure: not FDA-approved,
-- not 503A/503B compoundable per FDA, gated/provider-selected). research_peptide v2
-- removes the retatrutide carve-out.
--
-- Seeded INACTIVE + pending_review on purpose: the enforce_approved_before_active()
-- trigger requires legal sign-off before a version can serve. v1 stays active until a
-- separate "go-live" migration (physician/legal approval) flips v2 to approved + active.

`;

for (const d of docs) {
  const body = extractBody(d.file);
  if (body.includes(`$${d.tag}$`)) throw new Error(`tag collision in ${d.type}`);
  sql += `INSERT INTO public.consent_versions (
  consent_type, version_label, title, body_markdown, body_hash,
  effective_from, effective_to, is_active, legal_review_status
)
SELECT
  '${d.type}', '${d.version}', ${sqlStr(d.title)}, b.md,
  encode(extensions.digest(b.md, 'sha256'), 'hex'),
  '2026-06-19T00:00:00Z'::timestamptz, NULL::timestamptz, false, 'pending_review'
FROM ( SELECT $${d.tag}$\n${body}\n$${d.tag}$ AS md ) b
WHERE NOT EXISTS (
  SELECT 1 FROM public.consent_versions
  WHERE consent_type = '${d.type}' AND version_label = '${d.version}'
);

`;
}

function sqlStr(s) {
  return `'${s.replace(/'/g, "''")}'`;
}

writeFileSync("supabase/migrations/20260621260000_consent_retatrutide_glp1_v2.sql", sql);
console.log("wrote migration; glp1 body len + rp body len:",
  extractBody(docs[0].file).length, extractBody(docs[1].file).length);
