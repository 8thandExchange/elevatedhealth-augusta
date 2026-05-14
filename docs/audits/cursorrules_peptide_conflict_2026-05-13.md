# `.cursorrules` vs PR #15 chat / provider prompts — peptide positioning audit (2026-05-13)

This document records where **repository `.cursorrules`** (Cursor operating context) and the **patient / provider AI `prompts.ts`** files disagree on BPC-157, TB-500, PDA (Pentadeca Arginate), and related peptides. **No file was changed for conflict resolution** — a human must decide which source is authoritative for public and internal AI copy.

---

## 1. Source: `.cursorrules` (repo root) — peptide rules (verbatim)

The following is copied **verbatim** from `.cursorrules` under **REGULATORY POSTURE** → **PEPTIDES — Cat 2 LIST AS OF MAY 2026:**

```
PEPTIDES — Cat 2 LIST AS OF MAY 2026:
  NOT OFFERED (FDA prohibition on compounding):
    BPC-157 — replaced with Pentadeca Arginate (PDA), the
      regulatory-cleared successor with similar mechanism
    CJC-1295 / Ipamorelin — on Cat 2, FCC may pull anytime
    Thymosin Alpha-1 — on Cat 2
    Selank — on Cat 2
    GHK-Cu (injectable form only) — Cat 2; topical cream OK

  YELLOW LIGHT (verify with FCC before promoting):
    TB-500 (Thymosin Beta-4) — on Cat 2 but FCC currently
      compounds. Verify FCC's compliance position before
      featuring prominently. The Healing stack depends on this.

  GREEN LIGHT (clearly legal):
    PT-141 (Bremelanotide) — FDA-approved as Vyleesi
    Pentadeca Arginate (PDA) — not on Cat 2
    Sermorelin — not on Cat 2
    NAD+ — not on Cat 2 (any delivery method)
```

Related **stack** line elsewhere in the same file (under **PRICING — SOURCE OF TRUTH** → **PEPTIDE STACKS**):

```
  Healing (PDA daily + TB-500 weekly): $249 / $329
```

---

## 2. Source: patient chatbot — relevant excerpts (`supabase/functions/chat/prompts.ts`)

**`KNOWLEDGE_BASE` — “RESEARCH PEPTIDES” section (abridged for audit):**

- States the practice **offers** compounded peptide therapies including **BPC-157**, **TB-500**, the **“Wolverine Stack” (BPC-157 + TB-500 combined)**, and others.
- States these are **not FDA-approved**, classified as **research compounds**, FDA **Category 2** concerns for BPC-157, **informed consent**, etc.

**`systemPrompt` — hard rules / common answers (abridged):**

- Example “bad” lines and “good” lines that **name BPC-157** in patient-facing guardrail examples.
- **Q: “What’s BPC-157?”** answer describes BPC-157 as a **research compound** the practice may prescribe **under signed informed consent**, with Wellness Assessment routing.

---

## 3. Source: provider chatbot — relevant excerpts (`supabase/functions/provider-chat/prompts.ts`)

**`PROVIDER_KNOWLEDGE_BASE` — “PEPTIDE FORMULARY (RESEARCH COMPOUNDS)” (abridged):**

- **BPC-157** — FDA Category 2 list, “significant safety risks”
- **TB-500 / Thymosin Beta-4** — WADA prohibited
- **“Wolverine Stack”** — BPC-157 + TB-500 combined

**`providerSystemPrompt` — example clinical questions:**

- Includes an example referencing **FDA Category 2** and **BPC-157**.

---

## 4. Comparison — where the conflict is

| Topic | `.cursorrules` | PR #15 prompts |
|--------|----------------|----------------|
| **BPC-157 — offered vs not** | Under **NOT OFFERED**: “**BPC-157** — replaced with **Pentadeca Arginate (PDA)**, the regulatory-cleared successor…” Implies **BPC-157 is not the compound to offer**; **PDA** is the successor framing. | Patient KB: practice **offers** therapies **including BPC-157** and “Wolverine Stack” (BPC-157 + TB-500). Provider formulary lists **BPC-157** and combined stack. |
| **PDA vs BPC-157 in public copy** | Explicit **replacement** narrative (BPC-157 → PDA). | Patient KB and Q&A center **BPC-157** by name; **PDA is not named** in the patient `KNOWLEDGE_BASE` sections cited above (Healing stack in `.cursorrules` is **PDA + TB-500**; patient text emphasizes **BPC-157 + TB-500**). |
| **TB-500** | **YELLOW LIGHT** — Cat 2, verify with FCC before **featuring prominently**; Healing stack **depends on TB-500** per pricing line. | Patient KB: TB-500 and combo stack **listed as offered** with research-compound / consent framing, not the same “yellow light / verify before promoting” operational guardrail. |
| **CJC-1295 / Ipamorelin** | **NOT OFFERED** (Cat 2; FCC may pull). | Patient `KNOWLEDGE_BASE` **à la carte** list still includes **“CJC-1295/Ipamorelin: $179/mo”** (not audited sentence-by-sentence here beyond noting presence vs `.cursorrules` **NOT OFFERED**). |
| **Internal vs public** | `.cursorrules` governs **code, copy, and protocols** for the repo. | Prompts are **runtime copy** for LLMs; functionally still “copy” in the product. |

**Narrow summary of the core conflict:**  
`.cursorrules` states **BPC-157 is not offered** (replaced by **PDA**) and gives a **restricted posture on TB-500** and other Cat 2 items. The **PR #15 patient prompt** describes the practice as **offering BPC-157 and TB-500** (including a named **BPC-157 + TB-500** stack) and builds patient Q&A around **BPC-157**. The **provider prompt** formulary aligns with **offering BPC-157 and TB-500** in an internal reference list. Those positions **contradict** the `.cursorrules` regulatory summary unless `.cursorrules` is updated or the prompts are revised under clinical/legal sign-off.

---

## 5. Authority (explicit non-decision)

This audit **does not** pick a winner. Candidates for human decision:

- Treat **`.cursorrules`** as repo-wide law and **revise prompts** (and any product copy they mirror) to match PDA-first and Cat 2 lists, **or**
- Treat **deployed PR #15 prompts** (or separate clinical SOT) as overriding **for AI only**, and **update `.cursorrules`** and storefronts to match reality, **or**
- **Split**: public patient bot matches `.cursorrules`; internal provider bot allowed richer formulary (still a policy choice — document explicitly).

---

## 6. Verification grep — legacy phrase scan (PR #15 follow-up)

**Intent:** Forbidden legacy strings **must appear verbatim** in `supabase/functions/chat/prompts.ts` and `supabase/functions/provider-chat/prompts.ts` so the model sees exact phrases to avoid. CI / manual checks should **not** flag those files for containing the literals.

**Suggested command** (exclude prompt sources and shared TS utilities):

```bash
grep -rn "Vitality Membership\|Concierge Membership\|\$99 Discovery\|\$149 Strategy\|Hormone Mapping Kit\|ZRT Saliva\|credited toward your first" supabase/functions/ \
  | grep -v "prompts.ts" \
  | grep -v "_shared/"
```

**Expected:** zero lines (no other edge function or helper should emit these strings).  
**Separate check:** run the same pattern **without** `grep -v` but **only** on `supabase/functions/chat/prompts.ts` — expect **hits** (literals present by design).

---

*End of audit.*
