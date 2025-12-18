export const SITE_CONFIG = {
  clinicName: "Elevated Health Augusta",
  address: {
    line1: "7013 Evans Town Center Blvd, Suite 203",
    cityStateZip: "Evans, GA 30809",
    full: "7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809"
  },
  phone: "(706) 760-3470",
  phoneRaw: "7067603470",
  // Default booking URL - New Patient Application Call (FREE)
  bookingUrl: "https://calendar.app.google/hf3NNdiqJDueUuSN9",
  bookingLinks: {
    // Service-specific calendars
    hormoneTherapy: "https://calendar.app.google/npnih9qTAXu5PKLX6",
    mensTRT: "https://calendar.app.google/wtenYwM2L2oPeZkW8",
    labReview: "https://calendar.app.google/wwZhbZ2hxcg4uic1A", // Clinical Strategy Session
    weightLoss: "https://calendar.app.google/Nr1ruba57eqELJG19",
    ketamine: "https://calendar.app.google/Cmwuzg5TYMeACQ4i6",
    peptide: "https://calendar.app.google/TwKGsbXLpGdTBpp9A",
    iv: "https://calendar.app.google/tho8888rMkQpURzn7",
    hairRestoration: "https://calendar.app.google/qicauwUqfSerdEi16",
    sexualWellness: "https://calendar.app.google/RkzUZ7uJZ3EJwyzy5",
    // Free discovery calls
    clinicalEligibility: "https://calendar.app.google/5whDnpmP8vGhhEAx6",
    newPatientApplication: "https://calendar.app.google/hf3NNdiqJDueUuSN9",
  },
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
