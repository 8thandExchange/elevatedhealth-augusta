export const SITE_CONFIG = {
  clinicName: "Elevated Health Augusta",
  address: {
    line1: "7013 Evans Town Center Blvd, Suite 203",
    cityStateZip: "Evans, GA 30809",
    full: "7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809"
  },
  phone: "(706) 760-3470",
  phoneRaw: "7067603470",
  // Single booking calendar - Clinical Strategy Session
  bookingUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0Bvq4ZKUeVHmDYS8aU45o_2Z0oi4uHvILuZr2wqv6tKLPC71WABKyOSrbCwIjzKPqReipYFqST?gv=true",
  services: {
    primary: "IV Ketamine (infusion), SPRAVATO® (esketamine) nasal spray"
  },
  routes: {
    whatToExpect: "/what-to-expect",
    militaryVeteran: "/military-veteran",
    ketamine: "/ketamine",
    weightloss: "/weightloss",
    hormones: "/hormones",
    hormonesWomen: "/hormones-women",
    hormonesMen: "/hormones-men",
    ivLounge: "/iv-lounge",
    peptides: "/peptides",
    pricing: "/pricing",
    // Legacy routes for backwards compatibility
    ivKetamine: "/iv-ketamine",
    spravato: "/spravato",
    hormoneReplacement: "/hormone-replacement",
    weightLoss: "/weight-loss"
  }
} as const;
