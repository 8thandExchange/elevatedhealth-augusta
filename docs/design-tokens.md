# Elevated Health Augusta — Design Tokens

This is the reference document for the brand's design system. The actual values are already embedded in **Prompt 1** of `lovable-prompts.md` — paste that into Lovable and the tokens get applied. This file exists so you (or anyone you hire) can understand what each token does and why.

The token *names* (`--primary`, `--accent`, etc.) stay the same as Réveil. Only the *values* change. This means **every existing component continues to work** — no component-by-component rewrite needed for the color migration.

---

## Color tokens

### Light theme — `:root`

| Token | HSL value | Hex | Use |
| --- | --- | --- | --- |
| `--background` | `36 47% 90%` | `#F2EBDC` | Page background — bone |
| `--foreground` | `24 7% 16%` | `#2A2826` | Primary text — warm charcoal |
| `--card` | `0 0% 100%` | `#FFFFFF` | Card surfaces — pure white for lift |
| `--card-foreground` | `24 7% 16%` | `#2A2826` | Card text |
| `--primary` | `24 7% 16%` | `#2A2826` | Primary buttons, brand voice — charcoal |
| `--primary-foreground` | `36 47% 90%` | `#F2EBDC` | Text on primary surfaces |
| `--primary-light` | `24 7% 24%` | `#3D3935` | Primary hover state |
| `--primary-dark` | `30 9% 10%` | `#1A1816` | Footer, deepest charcoal |
| `--accent` | `32 36% 56%` | `#B8956A` | Camel — the brand's spark |
| `--accent-foreground` | `24 7% 16%` | `#2A2826` | Text on accent surfaces |
| `--gold` (alias) | `32 36% 56%` | `#B8956A` | Backward-compat with existing components |
| `--muted` | `36 30% 87%` | `#EBE2CF` | Subtle backgrounds — bone-deep |
| `--muted-foreground` | `30 5% 40%` | `#6B6862` | Secondary text |
| `--border` | `36 20% 82%` | n/a | Hairline rules and borders |
| `--ring` | `32 36% 56%` | `#B8956A` | Focus rings — camel |

### Dark theme — `.dark`

| Token | HSL value | Hex | Use |
| --- | --- | --- | --- |
| `--background` | `30 9% 10%` | `#1A1816` | Page background — charcoal-deep |
| `--foreground` | `36 47% 90%` | `#F2EBDC` | Primary text — bone |
| `--primary` | `32 36% 56%` | `#B8956A` | Camel becomes primary in dark mode |
| `--accent` | `32 36% 56%` | `#B8956A` | Same camel |

---

## Other tokens

| Token | Value | Use |
| --- | --- | --- |
| `--radius` | `0.1875rem` (3px) | All rounded corners — editorial, not bubbly |
| `--shadow-sm` | `none` | Brand discipline: no shadows |
| `--shadow-md` | `none` | Same |
| `--shadow-lg` | `none` | Same |
| `--shadow-glow` | `none` | Same |
| `--transition-smooth` | `all 0.4s cubic-bezier(0.4, 0, 0.2, 1)` | Default ease |
| `--transition-bounce` | `all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Playful ease — use sparingly |

---

## Why "no shadows" is a hard rule

Drop shadows make a brand feel like a SaaS dashboard. Editorial brands — the references we're aiming at (Aesop, The Lanby, Function Health) — use hairline rules and color contrast for separation, not blur. If a component is unreadable without a shadow, it needs better contrast or a hairline border, not a `shadow-lg`.

If you (or Lovable) ever feel the need to reach for a shadow, the answer is one of these instead:
- A 1px `border` in `--border` color
- A subtle `--muted` background to lift the surface
- Increased contrast between the surface and the page

---

## Why Tailwind config doesn't change

The Tailwind config references the CSS variables (`hsl(var(--primary))`, etc.) — so updating the variables above propagates everywhere automatically. **Do not touch `tailwind.config.ts` for the color migration.**

The only optional cleanup: any legacy font aliases (`inter`, `lato`, `cormorant`) can stay as fallback shims. New components should use `font-jost` and `font-playfair` directly.

---

## Typography

The brand uses two typefaces. Fonts do NOT change in the Réveil → EHA migration — they were already correct.

| Family | Weights | Use |
| --- | --- | --- |
| Playfair Display | 400 regular, 400 italic, 500, 500 italic | Headlines, pull quotes, key moments |
| Jost | 300 light, 400 regular, 500 medium | Body, navigation, UI, labels |

**The italic of Playfair is the brand's voice.** Use it where the language has emotional weight ("the way it should have always been"). Don't use it for every headline — overuse dilutes its impact.

**Section labels** are Jost 12px, weight 500, uppercase, letter-spacing 2.5px, color `--accent` (camel). This is the brand's most consistent texture.

---

## Color usage discipline

1. **Bone is the dominant surface.** ~70% of the visual area should be bone or white.
2. **Charcoal is the dominant ink.** ~25% should be charcoal text and primary surfaces.
3. **Camel is the spark.** ~5% — accents, hairlines, section labels, focus rings, the occasional CTA. Camel is precious; if every other element is camel it stops being special.

When in doubt: less camel, more bone, charcoal does the work.
