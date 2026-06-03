/**
 * Drop files into /public/images/ with these filenames — they appear automatically.
 * Until then, image components render nothing on the public site (no placeholder panels).
 */
export const MARKETING_IMAGES = {
  heroPoster: "/images/hero-poster.jpg",
  heroVideo: "/images/hero-video.mp4",
  physician: "/images/physician.jpg",
  clinicExterior: "/images/clinic-exterior.jpg",
  clinicInterior: "/images/clinic-interior.jpg",
  ivLounge: "/images/iv-lounge.jpg",
  serviceHormones: "/images/service-hormones.jpg",
  serviceWeightLoss: "/images/service-weightloss.jpg",
  serviceIv: "/images/service-iv.jpg",
  servicePeptides: "/images/service-peptides.jpg",
  editorialHormonesWomen: "/images/editorial-hormones-women.jpg",
  editorialHormonesMen: "/images/editorial-hormones-men.jpg",
  editorialPeptides: "/images/editorial-peptides.jpg",
} as const;

export type MarketingImageKey = keyof typeof MARKETING_IMAGES;
