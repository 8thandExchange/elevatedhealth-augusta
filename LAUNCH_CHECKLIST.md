# Elevated Health Augusta — Launch Checklist

**Brand:** Elevated Health Augusta (EHA)
**Palette:** Bone `#F2EBDC` · Warm Charcoal `#2A2826` · Camel `#B8956A`
**Typography:** Playfair Display (headings) · Jost (body)
**Stack:** React + Vite + Tailwind, Lovable Cloud backend

---

## Phase 1 — Public Homepage (status: in progress)

### Brand & Design System
- [x] Bone / Warm Charcoal / Camel tokens in `src/index.css`
- [x] Playfair Display + Jost wired in `tailwind.config.ts`
- [x] Semantic tokens used across components (no hard-coded colors)
- [x] Responsive layout (mobile-first, Tailwind breakpoints)

### Homepage Sections
- [x] Hero with primary CTA
- [x] Service overview (4 active pillars)
- [x] About / clinical team (generic identity)
- [x] Testimonials
- [x] Insurance & financing info
- [x] Footer with legal links

### Active Services (the only four offered)
- [x] Hormone Optimization
- [x] Medical Weight Loss
- [x] IV Therapy
- [x] Peptide Therapy
- [x] **Ketamine / SPRAVATO removed** (sunsetted — not offered)

### Pricing Surface
- [x] Wellness Assessment — $79 (RN entry point)
- [x] MD Evaluation (internal escalation) — $149
- [x] Hormone Mapping Kit — $250
- [x] Memberships — $199 / $399 / $699

### SEO & Accessibility
- [x] Semantic HTML, single H1 per route
- [x] Meta title (<60 chars) + description (<160 chars) per page
- [x] Canonical tags, OG/Twitter meta
- [x] Alt text on all images
- [x] Keyboard navigation, 44px touch targets
- [x] Sitemap & robots.txt published

### Performance
- [x] Hero image preloaded
- [x] Below-the-fold images lazy-loaded
- [x] Font preconnect for Google Fonts
- [x] Service worker + CACHE_VERSION cache busting

---

## Backend & Operational
- [x] Lovable Cloud connected
- [x] Auth: master admin (`admin@elevatedhealthaugusta.com`)
- [x] Provider invite flow (create-now or email-invite)
- [x] Stripe checkout for active services
- [x] Resend (email) live; patient/staff SMS via GoHighLevel (Sinch removed from app)
- [x] Booking confirmations (email + SMS)
- [x] Patient portal: invitation-only post-consult

---

## Pre-Launch QA
- [ ] All nav links resolve (no orphan ketamine/spravato pages)
- [ ] Booking widget submits and writes to `consultation_bookings`
- [ ] Confirmation email + SMS deliver
- [ ] Mobile floating CTA opens consultation modal
- [ ] Test in Chrome, Safari, Firefox
- [ ] Test on iPhone + Android viewports
- [ ] Lighthouse: Performance, Accessibility, SEO ≥ 90

## Post-Launch
- [ ] Submit sitemap to Google Search Console
- [ ] Verify GA4 events fire
- [ ] Google Business Profile updated
- [ ] Monitor edge function logs for first 48h

---

## URLs
- Local dev: http://localhost:8080 (run `npm run dev`; Vite falls back to 8081 if 8080 is busy)
- Production: https://elevatedhealthaugusta.com
- Supabase project: https://supabase.com/dashboard/project/jiiparpfkjytdcuelcns

> Note: As of 2026-05-17, production is still served from Lovable's
> hosting against the pre-migration codebase. Cutover to direct hosting
> (Vercel/Netlify/etc) is pending — see Pre-Launch section.
