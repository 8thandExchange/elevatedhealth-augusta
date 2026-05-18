/** Canonical IV boosters — used when Supabase has no rows yet. */
export interface IvAddonCatalogItem {
  id: string;
  name: string;
  description: string | null;
  detailed_description: string | null;
  price: number;
  benefits: string[] | null;
  best_for: string[] | null;
  icon_name: string | null;
}

export const IV_ADDONS_CATALOG: IvAddonCatalogItem[] = [
  {
    id: "catalog-glutathione",
    name: "Glutathione Push",
    description: "Detox, liver support, and skin brightening.",
    detailed_description:
      "Your body's master antioxidant — supports liver function and recovery.",
    price: 35,
    benefits: ["Detox & liver support", "Skin brightening", "Immune support"],
    best_for: ["Glow", "Detox", "Recovery"],
    icon_name: "sparkles",
  },
  {
    id: "catalog-b12",
    name: "B12 Shot",
    description: "Energy, mental clarity, and metabolism.",
    detailed_description: "Essential for red blood cell production and steady energy.",
    price: 25,
    benefits: ["Sustained energy", "Mental clarity", "Metabolism"],
    best_for: ["Fatigue", "Brain fog", "Athletes"],
    icon_name: "zap",
  },
  {
    id: "catalog-vitamin-c",
    name: "Vitamin C Push",
    description: "High-dose immune and collagen support.",
    detailed_description: "25× stronger than oral — immune boost and recovery.",
    price: 25,
    benefits: ["Immune support", "Collagen", "Faster recovery"],
    best_for: ["Cold season", "Travel", "Skin health"],
    icon_name: "shield",
  },
  {
    id: "catalog-toradol",
    name: "Toradol Push",
    description: "Fast anti-inflammatory pain relief.",
    detailed_description: "Non-drowsy relief for headache, soreness, or inflammation.",
    price: 25,
    benefits: ["Pain relief", "Anti-inflammatory", "Non-drowsy"],
    best_for: ["Hangover", "Headache", "Muscle soreness"],
    icon_name: "heart-pulse",
  },
  {
    id: "catalog-zofran",
    name: "Zofran Push",
    description: "Anti-nausea — works within minutes.",
    detailed_description: "Calms nausea when you can't keep anything down.",
    price: 25,
    benefits: ["Stops nausea", "Settles stomach", "Fast absorption"],
    best_for: ["Hangover", "Morning sickness", "Stomach upset"],
    icon_name: "pill",
  },
  {
    id: "catalog-nad",
    name: "NAD+ Booster",
    description: "Cellular energy and longevity support.",
    detailed_description: "Supports mitochondrial function and mental sharpness.",
    price: 50,
    benefits: ["Cellular energy", "Focus", "Recovery"],
    best_for: ["Longevity", "Brain fog", "Performance"],
    icon_name: "sparkles",
  },
];
