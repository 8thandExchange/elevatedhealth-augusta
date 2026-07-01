/**
 * Re-exports canonical therapy catalog from shared edge module.
 * @see supabase/functions/_shared/therapy-catalog.ts
 */
export {
  cdsCandidateActivationBlocklist,
  glpTherapyKeys,
  isLegacySunsettedService,
  isTherapyEngineExcluded,
  isTherapyNotOffered,
  isTherapyStaffQuotable,
  isTherapyWebsiteVisible,
  ketamineNotOfferedPatientCopy,
  legacyProgramDisplayLabels,
  offeredPeptideKeys,
  pathwayExcludedCompounds,
  providerGatedTherapies,
  recoveryPeptidePublicLanguage,
  recoveryPeptideShortNames,
  recoveryPeptideTherapies,
  resolveLegacyProgramDisplayLabel,
  resolveLegacyProgramKey,
  therapyByCatalogSlug,
  therapyByKey,
  therapyEngineExcludedKeys,
  therapyStaffPolicyBullets,
  THERAPY_CATALOG,
  therapiesByCategory,
  websiteTherapies,
} from "../../supabase/functions/_shared/therapy-catalog.ts";

export type {
  PatientFacingAvailability,
  TherapyCatalogEntry,
  TherapyCategory,
} from "../../supabase/functions/_shared/therapy-catalog.ts";

import { therapyEngineExcludedKeys } from "../../supabase/functions/_shared/therapy-catalog.ts";

/** Derived from catalog entries with `engineHardExcluded: true` */
export const THERAPY_ENGINE_EXCLUSIONS = therapyEngineExcludedKeys();
