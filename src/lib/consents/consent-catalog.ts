/**
 * Consent catalog rows patients may sign or be served in intake/Rx flows.
 * Keep in sync with DB policy: only active + legally approved versions.
 */
export const SERVABLE_LEGAL_REVIEW_STATUS = "approved" as const;

export type ServableLegalReviewStatus = typeof SERVABLE_LEGAL_REVIEW_STATUS;

/** PostgREST filter value for servable catalog rows. */
export const servableConsentVersionFilters = {
  is_active: true,
  legal_review_status: SERVABLE_LEGAL_REVIEW_STATUS,
} as const;
