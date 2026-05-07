## Provider Roster Update

### Current state (verified)
- **Loren Bursey**: not present anywhere in code or database — nothing to remove.
- **Dennis Williams, MD** (`drdwmd@pmrehab.net`): already configured as a Provider.
- **Kristen Covington, Office Manager** (`kcovington@pmrehab.net`): already configured. (Spelling will stay "Kristen Covington, Office Manager" per your confirmation.)
- **Caroline**: only referenced in marketing copy (`StaffPricingCheatsheet.tsx`) as the RN doing $79 Wellness Assessments. No backend account.

### Changes to make

1. **Add Caroline Miller, RN to the provider roster lookup** in `src/pages/ProviderDashboard.tsx`:
   ```ts
   "caroline@elevatedhealthaugusta.com": {
     name: "Caroline Miller",
     credentials: "RN",
     role: "provider"
   }
   ```
   This gives her full Provider Dashboard / EMR access alongside the MDs.

2. **Update `AdminLogin.tsx`** so `caroline@elevatedhealthaugusta.com` is recognized as a provider login (currently only Office Manager emails are explicitly listed; providers fall through to default).

3. **Send invitation / create auth account** for `caroline@elevatedhealthaugusta.com`:
   - Use the existing master-admin invite flow (per the Provider Gating memory — no self-registration).
   - Assign the `staff` role in `user_roles` so RLS policies grant her staff/admin chart access.

4. **Update name references in marketing/staff copy** in `src/pages/StaffPricingCheatsheet.tsx`:
   - "30 min with Caroline (RN)" → "30 min with Caroline Miller, RN"
   - "Caroline (RN) cannot diagnose…" → "Caroline Miller, RN cannot diagnose…"

5. **Search-and-confirm sweep** for any other "Loren" / "Bursey" references across `supabase/functions/`, email templates table, and clinic settings (already searched src; will re-confirm in edge functions and DB rows during build).

### Out of scope
- No schema changes — `user_roles` and the in-code provider lookup already support multiple providers.
- No change to Dr. Williams or Kristen's records.
- No change to public-facing branding (still "Clinical Team" / "Virtual Care Team" per Core memory).

### Files to edit
- `src/pages/ProviderDashboard.tsx` — add Caroline to the provider lookup.
- `src/pages/AdminLogin.tsx` — ensure her email routes to `/provider/dashboard`.
- `src/pages/StaffPricingCheatsheet.tsx` — update display name to "Caroline Miller, RN".

### Database action
- Insert `user_roles` row granting `staff` role to Caroline once her auth account is created (will need her account UUID after invite is sent — handled in build step).

### Note on invite delivery
After implementation, master admin (`admin@reveil.health` / `admin@elevatedhealthaugusta.com`) will need to trigger the invite email so Caroline can set her password. I can either wire this through the existing invite-staff flow or you can send it manually from the admin panel — confirm during build.
