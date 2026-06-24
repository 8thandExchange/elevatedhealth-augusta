# Lab Panels — Repricing & Guideline Update (Staff Brief)

**Date:** 2026-06-24 · **For:** Dr. Akers, Dennis, Caroline, Kristen
**Owner of changes:** Medical Director (clinical) + business partner (pricing)

---

## What changed and why

1. **We loaded our real LabCorp costs** (client account 10084710) into the EMR for the first time. Until now the margin tooling had no cost data.

2. **Hormone & Expanded panels were repriced to $299** (member $239.20). At the old $199 price the male and female hormone panels were **losing money** at the member discount (−$11 and −$23 per panel). $299 restores a healthy margin and is still below Marek ($250–595) and Genics ($279), level with WarriorBabe ($299). Foundational and Sexual Wellness stay **$199**.

3. **Panels were trimmed to current guidelines.** Each test now has a draw rule — *Standing* (every draw), *Reflex* (on indication), *One-time* (genetic), or *Optional* (advanced add-on). Only Standing + One-time are priced into the standard panel; Reflex/Optional are ordered when clinically indicated.

### Guideline basis
- **Men's TRT** (Endocrine Society / AUA): standard draw = Total T, SHBG, CBC/hematocrit, PSA, CMP, lipids, A1c, TSH, Vit D. Estradiol only with breast symptoms/gynecomastia → **reflex**. Free T **calculated** from Total T + SHBG (direct assay → reflex). LH/FSH at diagnosis only → reflex. DHEA-S → optional.
- **Women's BHRT** (IMS 2024 / BMS 2026 / ISSWSH): routine hormone profiles are **not** needed to dose menopausal HRT — dose by symptoms. Only Total T + SHBG standing (for testosterone/HSDD). Estradiol, progesterone, FSH, LH → reflex.
- **Thyroid** (USPSTF / ESE): TSH first; Free T4/T3 → **reflex** on abnormal TSH.
- **Metabolic/Weight** (ADA / NLA): A1c, CMP, lipids, TSH, fasting insulin, **ApoB** standing; **Lp(a) one-time**; **Leptin → optional** (ESE: not routinely recommended).

---

## Resulting margins (standard draw, at the LabCorp client rate)

| Panel | Charge | Standard COGS | Non-member margin | Member margin |
|-------|--------|---------------|-------------------|---------------|
| Foundational | $199 | $53.70 | 73% | 66% |
| Male Hormone | $299 | $98.85 | 67% | **59%** |
| Female Hormone | $299 | $92.45 | 69% | **61%** |
| Sexual Wellness | $199 | $56.05 | 72% | 65% |
| Expanded / Weight | $299 | $110.90 | 63% | 54% |

Every panel is now solidly profitable at both non-member and member pricing. (Male/Female were previously a loss at member price.)

---

## How to make adjustments — EMR Lab Catalog

Go to **`/lab-catalog`** (Provider tools → "Lab catalog", or the staff Help widget). Access: admin, staff, business_admin, provider — so **Dr. Akers, Dennis, and Caroline all have it.**

You can, live:
- See each panel's **standard COGS, non-member/member margin, and full cost**.
- Change any test's **draw rule** (Standing / Reflex / Optional / One-time) from a dropdown — margins recalculate immediately.
- Edit a test's **LabCorp code, our cost, à la carte charge, and notes**.

Patient checkout always uses the Stripe $199 / $299 tiers — COGS/margins are never shown to patients.

---

## Open items
- **LabCorp client pricing for 4 send-outs** (Insulin 004333, ApoB 167015, Lp(a) 120188, Leptin 146712) — currently conservative estimates; Kristen is confirming with the rep (see the LabCorp Panel Setup Guide). Real rates will likely *improve* the Expanded margin.
- **Advanced/Optimization add-on as a sellable SKU** — if we want to sell the reflex/optional markers as a paid à la carte upgrade, that needs a new Stripe product (not yet created).

---
*This brief reflects changes already live in production as of 2026-06-24.*
