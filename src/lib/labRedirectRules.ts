export {
  SHARED_LAB_REDIRECT_RULES,
  evaluateSharedLabRedirects,
  hasSharedLabRedirect,
} from "../../supabase/functions/_shared/lab-redirect-rules.ts";

export type {
  LabComparator,
  LabRedirectHit,
  LabRedirectRule,
  LabValueInput,
} from "../../supabase/functions/_shared/lab-redirect-rules.ts";
