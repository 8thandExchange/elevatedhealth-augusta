/**
 * Marketing photos live in /public/images/. Components probe these paths at runtime;
 * missing files render nothing (no placeholder panels on the public site).
 */
export const MARKETING_IMAGES = {
  heroPoster: "/images/hero-poster.png",
  heroVideo: "/images/hero-video.mp4",
  /** Caroline Marshall, RN — primary forward-facing clinical team photo */
  staffCaroline: "/images/staff-caroline.png",
  physician: "/images/physician.png",
  clinicExterior: "/images/clinic-exterior.png",
  clinicInterior: "/images/clinic-interior.png",
  ivLounge: "/images/iv-lounge.png",
  clinicAmenities: "/images/clinic-amenities.png",
  serviceHormones: "/images/service-hormones.png",
  serviceWeightLoss: "/images/service-weightloss.png",
  serviceIv: "/images/service-iv.png",
  servicePeptides: "/images/service-peptides.png",
  editorialHormonesWomen: "/images/editorial-hormones-women.png",
  editorialHormonesMen: "/images/editorial-hormones-men.png",
  editorialPeptides: "/images/editorial-peptides.png",
} as const;

export type MarketingImageKey = keyof typeof MARKETING_IMAGES;
