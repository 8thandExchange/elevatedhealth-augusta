export const SITE_CONFIG = {
  clinicName: "Elevated Health Augusta",
  address: {
    line1: "7013 Evans Town Center Blvd, Suite 203",
    cityStateZip: "Evans, GA 30809",
    full: "7013 Evans Town Center Blvd, Suite 203, Evans, GA 30809"
  },
  phone: "(706) 760-3470",
  phoneRaw: "7067603470",
  bookingUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0XA11WP_5kIZjLuXt6N_cJq5cpLLRdm3T19lrV6w-gjh-VeN5JN0yybyGHXEP1Qo8rjBOpzMyW?gv=true",
  bookingLinks: {
    hormoneTherapy: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0XA11WP_5kIZjLuXt6N_cJq5cpLLRdm3T19lrV6w-gjh-VeN5JN0yybyGHXEP1Qo8rjBOpzMyW?gv=true",
    labReview: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0XA11WP_5kIZjLuXt6N_cJq5cpLLRdm3T19lrV6w-gjh-VeN5JN0yybyGHXEP1Qo8rjBOpzMyW?gv=true",
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
    // Legacy routes for backwards compatibility
    ivKetamine: "/iv-ketamine",
    spravato: "/spravato",
    hormoneReplacement: "/hormone-replacement",
    weightLoss: "/weight-loss"
  }
} as const;
