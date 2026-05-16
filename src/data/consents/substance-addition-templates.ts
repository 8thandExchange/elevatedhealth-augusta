/**
 * Registry of formulary substances added after Research Peptide consent class logic.
 * Populate when adding new substances in medication-consent-mapping — PR 6 ships empty plumbing only.
 */
export interface SubstanceAdditionTemplate {
  substance_id: string;
  display_name: string;
  /** Parent consent class — today only research_peptide uses substance additions */
  parent_consent_type: "research_peptide";
  /** ISO date when substance entered formulary (compare to parent consent signed_at). */
  added_to_formulary_date: string;
  body_markdown: string;
  /** When true, gate treats Research Peptide consent as missing until full Tier 2 re-sign. */
  requires_full_reconsent: boolean;
}

export const SUBSTANCE_ADDITION_TEMPLATES: SubstanceAdditionTemplate[] = [];

export function getSubstanceAdditionTemplate(substanceId: string): SubstanceAdditionTemplate | undefined {
  return SUBSTANCE_ADDITION_TEMPLATES.find((t) => t.substance_id === substanceId);
}
