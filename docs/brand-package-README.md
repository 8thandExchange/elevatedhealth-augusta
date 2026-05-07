# Elevated Health Augusta — Brand System Package

Everything you need to migrate the Lovable codebase from Réveil to Elevated Health Augusta, plus the brand reference for any contractor you bring in.

---

## What's in this package

```
eha-brand-package/
├── README.md                  ← you are here
├── lovable-prompts.md         ← THE PROMPTS to paste into Lovable
├── design-tokens.md           ← reference for the CSS variables
├── brand-guidelines.html      ← single-page brand reference, hand to contractors
├── homepage-mockup.html       ← what the rebranded homepage looks like
└── logo/
    ├── eha-primary-light.svg     ← default logo (navbar, footer)
    ├── eha-primary-dark.svg      ← reverse on dark sections
    ├── eha-wordmark-light.svg    ← parent-brand wordmark, no city
    ├── eha-wordmark-dark.svg     ← same, dark variant
    ├── eha-monogram-light.svg    ← mobile collapsed nav, social avatars
    ├── eha-monogram-dark.svg     ← same, dark variant
    └── eha-favicon.svg           ← browser tab favicon
```

---

## Open files in this order

1. **`homepage-mockup.html`** — see the destination first. This is what the rebranded homepage should look like in the new brand, with video placeholders showing where Mux-hosted clips will go (hero clinic loop, NAD explainer). React to this *before* you start prompting Lovable. If the section order is wrong, the copy direction is wrong, the layout is wrong — now is the cheapest moment to redirect.

2. **`brand-guidelines.html`** — single-page reference. Logo system, color palette (with HEX/RGB/CMYK/Pantone), typography hierarchy, six voice principles, sound-like-this/not-like-that copy examples, six hard don'ts. Hand this to any contractor — designer, photographer, copywriter, signage vendor, printer.

3. **`lovable-prompts.md`** — the five sequential prompts you paste into Lovable's chat to execute the rebrand. Each prompt is scoped to one phase. Don't paste them all at once — Lovable degrades when scope gets too large.

4. **`design-tokens.md`** — reference doc for the CSS variables. The values are already in Prompt 1; this file exists so anyone can understand what each token does and why.

5. **`logo/`** — the seven SVG files you upload to `src/assets/brand/` in Lovable before running Prompt 2. Vectorize text-to-paths in Illustrator (`Type → Create Outlines`) before sending to print vendors.

---

## What's done in this package

- ✅ Logo locked: Concept G (italic editorial wordmark, no icon)
- ✅ Palette locked: Palette 02 (Charcoal #2A2826 + Camel #B8956A + Bone #F2EBDC)
- ✅ Final SVG logo variants produced (7 files)
- ✅ Brand guidelines documented
- ✅ Design tokens prepared for the codebase
- ✅ Homepage direction visualized
- ✅ Lovable prompts written and scoped per phase

---

## What's NOT in this package

- ⏳ The other ~50 marketing pages (most will inherit the new brand automatically once Prompt 1 runs because they read from CSS variables; some may need surgical fixes after)
- ⏳ Photography (every placeholder block in the codebase needs a real image — brief the photographer using `brand-guidelines.html`)
- ⏳ Mux video integration (placeholders ready, videos themselves TBD)
- ⏳ The EMR integration work (DrFirst Rcopia for e-Rx + Doxy.me for telehealth — separate Lovable session once you've signed up for both)
- ⏳ The AI labs → physician sign-off → automated Rx pipeline (this is the operational backend that drives the multi-location, multi-million-revenue conversation; do not bolt it onto a brand migration)

---

## What you should do this week

1. **Open `homepage-mockup.html`** and react. If anything's off in the layout or copy direction, send me the changes before you run Prompt 5.
2. **Open `brand-guidelines.html`** and confirm the voice samples sound like you. Edit the don'ts list if anything's missing.
3. **Run the Lovable prompts** in sequence (1 → 2 → 3 → 4 → optional 5). Verify after each one.
4. **Sign up for DrFirst Rcopia** for e-prescribing. ~$75–150/mo per prescriber. Call 866-263-6512.
5. **Sign up for Doxy.me Pro** for HIPAA-compliant telehealth video. $35/mo. BAA included.
6. **Confirm the Supabase BAA is signed** (organization settings → security → BAA).
7. **Commission Caroline + clinic photography.** This is the visual unblocker. Brief: editorial 4:5 portraits of Caroline and the founding physician, lifestyle shots of Caroline at the IV chair, wide shots of the IV lounge, exterior of the clinic at golden hour.
8. **30-minute call with a Georgia healthcare attorney** to confirm: trademark is clear on "Elevated Health Augusta," Caroline's bio language stays inside RN/BSN scope, the AI-labs-to-Rx pipeline has a legal pathway in Georgia.

---

## The strategic context behind the brand decision

(For the meeting at noon — in case Garry asks "why Concept G + Palette 02 specifically?")

**On the logo:** Concept G is the pure typographic wordmark — italic Playfair "elevated" with a ruled "HEALTH" treatment and "AUGUSTA · GEORGIA" set as a tracked descriptor. Why pure typography rather than an iconic mark? Because iconic marks date faster, require more design discipline to deploy (favicon vs. signage vs. embroidery — every reproduction is a fight), and the italic editorial wordmark already carries the brand's personality without needing an icon to do the work.

**On the palette:** Palette 02 (Warm Charcoal + Camel + Bone) positions us as "premium contemporary" rather than "premium establishment." The palette references — Aesop, The Lanby, Function Health, modern boutique medical — all live in this warm-charcoal/camel/bone space. Navy + gold (the original) reads as private banking and slightly traditional; charcoal + camel reads as 2026 wellness-meets-clinic. As the patient demographic continues to skew younger and more design-literate, this palette ages better.

**On the codebase:** We're not rebuilding. The Lovable codebase is mature — 130+ edge functions, full provider/admin/patient portal, real Supabase schema. The rebrand is surgical: change CSS variables, swap logo assets, find-and-replace strings. The components don't need to change because they read from design tokens — change the tokens and every component immediately wears the new brand.
