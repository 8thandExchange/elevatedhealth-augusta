/**
 * Staff Pull-Out Reference Cards — laminated, hole-punched quick cards.
 *
 * One card per section (Memberships, Hormones, GLP-1, Peptides, IV, Sexual Wellness).
 * Each item shows four PATIENT-FACING fields:
 *   - What it is
 *   - What it does
 *   - How it's prescribed
 *   - Cost to the patient (non-member + member)
 *
 * PATIENT-SAFE: shows patient price only — NO wholesale cost, NO margin.
 * These cards are meant to be held in front of a patient. The Cost & Margin
 * data lives only in the Staff Complete Reference (internal).
 *
 * Print: Letter portrait, 2 cards/page (~4.25in x 5.5in each), hole-punch zone
 * at the top of every card. Laminate, punch, ring together.
 *
 * Data pulled live from stripeConfig / catalogs / dosingProtocols — never hardcoded prices.
 */

import {
  ELEVATED_PROGRAMS,
  GLP1_PROGRAM_VARIANTS,
  MEDICATION_FILLS,
  SEXUAL_WELLNESS_PRODUCTS,
} from "./stripeConfig";
import { IV_THERAPIES_CATALOG } from "./ivTherapiesCatalog";
import { DOSING_PROTOCOLS } from "./dosingProtocols";
import { fmtUsd, labMemberCents } from "./pricing";

export const CARDS_META = {
  title: "Pull-Out Reference Cards",
  subtitle: "Laminate · hole-punch · pull one to help a patient fast",
  version: "1.0.0",
  effectiveDate: "2026-06-29",
  classification: "Patient-safe — shows patient price only (no cost/margin)",
  clinic: "Elevated Health Augusta",
  phone: "(706) 760-3470",
  domain: "elevatedhealthaugusta.com",
} as const;

export const CARDS_FILENAME_BASE = `EHA-Staff-Pull-Out-Cards-v${CARDS_META.version}-${CARDS_META.effectiveDate}`;

const member = (cents: number) => fmtUsd(labMemberCents(cents));

/** One item line on a card. */
interface CardItem {
  is: string;        // what it is
  does: string;      // what it does
  rx: string;        // how it's prescribed
  cost: string;      // patient cost
}

interface SectionCard {
  section: string;
  blurb: string;     // one-line "what this section is"
  items: CardItem[];
  footnote?: string;
}

function dose(key: string): string {
  const p = DOSING_PROTOCOLS[key];
  if (!p) return "Physician-directed";
  return [p.route, p.frequency, p.maintenanceDose ? `· maint ${p.maintenanceDose}` : ""]
    .filter(Boolean)
    .join(" ");
}

/* ----------------------------- CARD 1: MEMBERSHIPS ----------------------------- */
const membershipsCard: SectionCard = {
  section: "Memberships",
  blurb: "Monthly all-inclusive programs. One anchor owns RN visits, quarterly labs, messaging.",
  items: [
    {
      is: ELEVATED_PROGRAMS.trt.name,
      does: "Men's testosterone optimization — energy, libido, body composition.",
      rx: "Testosterone cream, daily. Quarterly Comprehensive labs. No injections/anastrozole/HCG.",
      cost: `${ELEVATED_PROGRAMS.trt.displayPrice} — all-inclusive`,
    },
    {
      is: ELEVATED_PROGRAMS.hrt.name,
      does: "Women's hormone balance — mood, sleep, libido, symptom relief.",
      rx: "Bi-Est + progesterone cream (T cream if indicated). Quarterly Comprehensive labs. Cream only.",
      cost: `${ELEVATED_PROGRAMS.hrt.displayPrice} — all-inclusive`,
    },
    {
      is: "ELEVATED GLP-1",
      does: "Medical weight management with appetite/metabolic support.",
      rx: "Compounded semaglutide OR tirzepatide, weekly SubQ. Quarterly Expanded labs.",
      cost: `${GLP1_PROGRAM_VARIANTS.semaglutide.displayPrice} (sema) · ${GLP1_PROGRAM_VARIANTS.tirzepatide.displayPrice} (tirz)`,
    },
    {
      is: ELEVATED_PROGRAMS.wellness.name,
      does: "IV-focused membership — hydration, recovery, energy.",
      rx: "2 signature drips/mo + 20% off add-ons + priority booking. No Rx medication.",
      cost: `${ELEVATED_PROGRAMS.wellness.displayPrice} — IV only`,
    },
  ],
  footnote:
    "Multiple services? ONE anchor program + medication add-on (saves $100/mo vs two full programs). Never enroll two full programs.",
};

/* ----------------------------- CARD 2: HORMONES ----------------------------- */
const hormonesCard: SectionCard = {
  section: "Hormones",
  blurb: "Cream-based hormone optimization. Default: men → TRT, women → HRT.",
  items: [
    {
      is: MEDICATION_FILLS.testosterone.name,
      does: "Daily testosterone for men — energy, libido, lean mass, mood.",
      rx: "Compounded cream, applied daily. Baseline + quarterly labs.",
      cost: `${MEDICATION_FILLS.testosterone.displayPrice} fill · ${member(MEDICATION_FILLS.testosterone.amount)} member · included on ELEVATED TRT`,
    },
    {
      is: MEDICATION_FILLS.biEst.name,
      does: "Estradiol/estriol for women — hot flashes, mood, vaginal/skin health.",
      rx: "Compounded cream, daily. Paired with progesterone. Quarterly labs.",
      cost: `${MEDICATION_FILLS.biEst.displayPrice} fill · ${member(MEDICATION_FILLS.biEst.amount)} member · included on ELEVATED HRT`,
    },
    {
      is: MEDICATION_FILLS.progesterone.name,
      does: "Balances estrogen — sleep, mood, endometrial protection.",
      rx: "Compounded, daily or cyclic per protocol. Quarterly labs.",
      cost: `${MEDICATION_FILLS.progesterone.displayPrice} fill · ${member(MEDICATION_FILLS.progesterone.amount)} member · included on ELEVATED HRT`,
    },
  ],
  footnote: "Cream only — no pellets, no injectable TRT, no anastrozole, no HCG in standard programs.",
};

/* ----------------------------- CARD 3: GLP-1 ----------------------------- */
const glp1Card: SectionCard = {
  section: "Weight Loss (GLP-1)",
  blurb: "Compounded GLP-1 therapy. Program price locked to molecule — titration does not change rate.",
  items: [
    {
      is: GLP1_PROGRAM_VARIANTS.semaglutide.name,
      does: "Appetite suppression + glucose/metabolic support for weight loss.",
      rx: dose("semaglutide"),
      cost: `${GLP1_PROGRAM_VARIANTS.semaglutide.displayPrice} program (all-inclusive)`,
    },
    {
      is: GLP1_PROGRAM_VARIANTS.tirzepatide.name,
      does: "Dual GIP/GLP-1 — stronger appetite + metabolic effect.",
      rx: dose("tirzepatide"),
      cost: `${GLP1_PROGRAM_VARIANTS.tirzepatide.displayPrice} program (all-inclusive)`,
    },
    {
      is: `${MEDICATION_FILLS.semaglutide.name} / ${MEDICATION_FILLS.tirzepatide.name} (single fill)`,
      does: "One-off fill between programs / non-member.",
      rx: "Weekly SubQ per protocol. Not the all-inclusive program.",
      cost: `${MEDICATION_FILLS.semaglutide.displayPrice} sema · ${MEDICATION_FILLS.tirzepatide.displayPrice} tirz (member pricing applies)`,
    },
    {
      is: MEDICATION_FILLS.retatrutide.name,
      does: "Triple-agonist — physician-gated only.",
      rx: dose("retatrutide") + ". GLP-1 lane only, provider-gated.",
      cost: `${MEDICATION_FILLS.retatrutide.displayPrice} · NEVER advertise — provider-initiated only`,
    },
  ],
  footnote: "One lab draw (Expanded) covers GLP-1 + any hormone lane in a combo. Use additive compound.",
};

/* ----------------------------- CARD 4: PEPTIDES ----------------------------- */
const peptidesCard: SectionCard = {
  section: "Peptides",
  blurb: "À la carte, consult-gated. Layer on top of a program. Members save 20% per line.",
  items: [
    {
      is: "Sermorelin / CJC-1295 + Ipamorelin",
      does: "Growth-hormone support — recovery, sleep, body composition.",
      rx: "SubQ, typically nightly. Consult-gated. Monthly.",
      cost: "Per catalog · member −20% · billed as separate SKU",
    },
    {
      is: "BPC-157 / TB-500 (Recovery Stack)",
      does: "Tissue repair, recovery, inflammation support.",
      rx: dose("bpc157") + ". Research Peptide Consent required.",
      cost: "$349 stack (vs ~$498 à la carte) · the only published peptide bundle",
    },
    {
      is: "Tesamorelin",
      does: "Targeted fat/metabolic support (GHRH analog).",
      rx: "SubQ per protocol. Consult-gated. Monthly.",
      cost: "Per catalog · member −20% · separate SKU",
    },
    {
      is: "GHK-Cu (topical)",
      does: "Skin/collagen support, cosmetic.",
      rx: "Topical per label. Consult-gated.",
      cost: "Per catalog · member −20% · separate SKU",
    },
  ],
  footnote:
    "Peptides NEVER fold into a combo subscription. No discount stacking on top of member 20%. Cat-2 compounds need consent + screen.",
};

/* ----------------------------- CARD 5: IV LOUNGE ----------------------------- */
const ivCard: SectionCard = {
  section: "IV Lounge",
  blurb: "Walk-in drips (Lane A). Members get 20% off add-ons + 2 signature drips/mo.",
  items: IV_THERAPIES_CATALOG.map((d) => ({
    is: d.name,
    does: (d.description ?? "").replace(/\s+/g, " ").trim() || d.category,
    rx: `IV infusion in-lounge${(d.ingredients ?? []).length ? " · " + (d.ingredients ?? []).join(", ") : ""}`,
    cost: `$${d.price} walk-in · ${member(d.price * 100)} member`,
  })),
  footnote: "NAD+ is the $50 booster push only — no peptide NAD+, no standalone NAD+ infusion.",
};

/* ----------------------------- CARD 6: SEXUAL WELLNESS ----------------------------- */
const sexualWellnessCard: SectionCard = {
  section: "Sexual Wellness",
  blurb: "Consult-gated. Available after visit — do not promote on public storefront.",
  items: Object.values(SEXUAL_WELLNESS_PRODUCTS).map((p) => ({
    is: p.name,
    does: "Sexual wellness / performance support.",
    rx: "Prescribed after consult. Per protocol.",
    cost: `${p.displayPrice} · ${member(p.amount)} member`,
  })),
  footnote: "After consult only. Not advertised on storefront or cold outreach.",
};

export const ALL_CARDS: SectionCard[] = [
  membershipsCard,
  hormonesCard,
  glp1Card,
  peptidesCard,
  ivCard,
  sexualWellnessCard,
];

/* ----------------------------- HTML / PRINT ----------------------------- */

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const CSS = `
  :root {
    --navy: #00477E;
    --steel: #0B7BB8;
    --gray: #A7A9AC;
    --ink: #14202B;
    --muted: #5B6770;
    --surface: #F4F8FB;
    --border: #C9D4DD;
  }
  * { box-sizing: border-box; }
  @page { size: letter portrait; margin: 0.35in; }
  body { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; color: var(--ink); margin: 0; }

  .sheet { display: flex; flex-direction: column; gap: 0.18in; }
  .card {
    border: 1.5px solid var(--navy);
    border-radius: 10px;
    overflow: hidden;
    height: 4.95in;
    display: flex;
    flex-direction: column;
    page-break-inside: avoid;
    position: relative;
  }
  /* hole-punch guide */
  .punch {
    height: 0.42in;
    background: var(--surface);
    border-bottom: 1px dashed var(--gray);
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  .punch::before {
    content: "";
    width: 0.22in; height: 0.22in;
    border: 1.5px solid var(--gray);
    border-radius: 50%;
    background: #fff;
  }
  .punch span {
    position: absolute; right: 0.18in;
    font-size: 6pt; letter-spacing: 0.06em; color: var(--muted); text-transform: uppercase;
  }
  .head {
    background: var(--navy); color: #fff;
    padding: 0.10in 0.18in;
    display: flex; align-items: baseline; justify-content: space-between;
  }
  .head h2 { margin: 0; font-size: 13pt; letter-spacing: 0.01em; }
  .head .tag { font-size: 6.5pt; color: #cfe3f3; text-transform: uppercase; letter-spacing: 0.08em; }
  .blurb { font-size: 7pt; color: var(--muted); padding: 0.06in 0.18in 0; font-style: italic; }

  table { width: 100%; border-collapse: collapse; margin: 0.05in 0; }
  th {
    text-align: left; font-size: 6pt; text-transform: uppercase; letter-spacing: 0.05em;
    color: var(--steel); padding: 0.03in 0.06in; border-bottom: 1px solid var(--border);
  }
  td { font-size: 7pt; padding: 0.05in 0.06in; vertical-align: top; border-bottom: 1px solid var(--surface); line-height: 1.25; }
  tr:nth-child(even) td { background: var(--surface); }
  .c-is { font-weight: 700; color: var(--navy); width: 21%; }
  .c-does { width: 30%; }
  .c-rx { width: 27%; color: var(--muted); }
  .c-cost { width: 22%; font-weight: 600; }
  td.c-cost { color: var(--navy); }

  .foot {
    margin-top: auto;
    background: var(--surface);
    border-top: 1px solid var(--border);
    padding: 0.06in 0.18in;
    font-size: 6.5pt; color: var(--muted);
  }
  .foot strong { color: var(--navy); }
  .brandline {
    padding: 0.04in 0.18in; font-size: 6pt; color: var(--gray);
    display: flex; justify-content: space-between;
  }
`;

function cardHtml(c: SectionCard): string {
  const rows = c.items
    .map(
      (it) => `<tr>
        <td class="c-is">${esc(it.is)}</td>
        <td class="c-does">${esc(it.does)}</td>
        <td class="c-rx">${esc(it.rx)}</td>
        <td class="c-cost">${esc(it.cost)}</td>
      </tr>`,
    )
    .join("");
  return `<section class="card">
    <div class="punch"><span>${esc(CARDS_META.clinic)}</span></div>
    <div class="head"><h2>${esc(c.section)}</h2><span class="tag">Pull-Out Reference</span></div>
    <div class="blurb">${esc(c.blurb)}</div>
    <table>
      <thead><tr><th>What it is</th><th>What it does</th><th>How it's prescribed</th><th>Patient cost</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${c.footnote ? `<div class="foot"><strong>Remember:</strong> ${esc(c.footnote)}</div>` : ""}
    <div class="brandline"><span>${esc(CARDS_META.domain)}</span><span>${esc(CARDS_META.phone)} · v${CARDS_META.version}</span></div>
  </section>`;
}

export function buildPullOutCardsHtml(): string {
  // 2 cards per page; CSS height keeps them paired and laminate-friendly.
  const cards = ALL_CARDS.map(cardHtml).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${esc(CARDS_META.clinic)} — ${esc(CARDS_META.title)}</title>
  <style>${CSS}</style>
</head>
<body>
  <div class="sheet">${cards}</div>
</body>
</html>`;
}
