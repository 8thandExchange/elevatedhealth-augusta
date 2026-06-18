/** Pre-visit copy for wellness assessment bookings — labs are optional and billed separately. */
export const WELLNESS_ASSESSMENT_PRE_VISIT: Record<string, string[]> = {
  hormone: [
    "Bring photo ID and a list of any current medications",
    "Plan to be on-site about 45 minutes for your wellness assessment",
    "Eat normally beforehand — no fasting required unless your care team told you otherwise",
  ],
  weight_loss: [
    "Bring photo ID and a list of any current medications",
    "Plan to be on-site about 45 minutes for your consultation",
    "Bring recent labs if you already have them",
  ],
  peptide: [
    "Bring photo ID and a list of any current medications",
    "Plan to be on-site about 45 minutes for your consultation",
    "Bring any recent bloodwork or sleep-study results if you have them",
  ],
};

export function wellnessPreVisitForServiceType(serviceType: string | null | undefined): string[] {
  const key = (serviceType || "hormone").toLowerCase();
  return WELLNESS_ASSESSMENT_PRE_VISIT[key] ?? WELLNESS_ASSESSMENT_PRE_VISIT.hormone;
}
