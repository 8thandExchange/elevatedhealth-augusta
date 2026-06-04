# Vercel environment variables — Elevated Health Augusta

The marketing site is hosted on **Vercel** and auto-deploys when you push to `main` on GitHub.  
Some features only turn on when you add variables in the Vercel dashboard (not in the repo).

---

## Meta Pixel (Facebook / Instagram ads)

**Variable name:** `VITE_META_PIXEL_ID`  
**What it does:** Loads Meta Pixel on public pages **after** the visitor accepts marketing cookies (`MarketingPixel.tsx`).  
**If empty:** Pixel does not run (safe default).

### Step-by-step

1. **Get your Pixel ID** (numbers only, often 15–16 digits):
   - [Meta Events Manager](https://business.facebook.com/events_manager)
   - Select your Pixel → **Settings** → copy **Pixel ID**

2. **Open Vercel**
   - https://vercel.com → log in
   - Open the project for **elevatedhealthaugusta** (linked to `8thandExchange/elevatedhealth-augusta`)

3. **Add the variable**
   - **Settings** → **Environment Variables**
   - **Add New**
   - **Key:** `VITE_META_PIXEL_ID`
   - **Value:** paste your Pixel ID (no quotes, no spaces)
   - **Environments:** check **Production** (and **Preview** if you test staging)
   - **Save**

4. **Redeploy** (required — Vite bakes env vars in at build time)
   - **Deployments** tab → latest **Production** deployment → **⋯** menu → **Redeploy**
   - Or push any commit to `main` (GitHub integration will rebuild)

5. **Verify**
   - Visit https://elevatedhealthaugusta.com in a private window
   - Accept **marketing cookies** on the banner
   - Install [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper) (Chrome) → should show your Pixel ID firing **PageView**
   - Or Events Manager → **Test events** → browse your site

**Do not** paste the Pixel ID into `index.html`. The old `XXXXXXXXXXXXXXX` block was removed on purpose.

---

## Supabase (already on Vercel for most deploys)

These must be set for the app to talk to Supabase (usually already configured):

| Key | Where to find it |
|-----|------------------|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Same page → `anon` `public` key |
| `VITE_SUPABASE_PROJECT_ID` | Project ref (e.g. `jiiparpfkjytdcuelcns`) |

If the site loads but login/booking fails, check these three in Vercel **Production**.

---

## What stays in Supabase (not Vercel)

Stripe secrets, fax, email, etc. live in **Supabase Edge Function secrets**, not Vercel. See `.env.example` and `docs/CLINIC_OPERATING_RUNBOOK.md`.

---

## Social preview image

`index.html` points `og:image` at:

`https://elevatedhealthaugusta.com/images/hero-poster.jpg`

Upload **`public/images/hero-poster.jpg`** (ideally **1200×630** JPG) per `docs/PHOTO_ASSETS.md`, then push to `main`. Until that file exists, link previews may show no image.

Test previews: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) → paste your homepage URL → **Scrape Again**.

---

## Google Business Profile (not Vercel)

Update listing description to **physician-owned wellness** (IV, hormones, peptides, weight loss). Remove **ketamine** from the business description. Point website to **elevatedhealthaugusta.com**.
