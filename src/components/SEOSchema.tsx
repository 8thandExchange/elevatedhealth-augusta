import { Helmet } from "react-helmet";
import { SITE_CONFIG } from "@/lib/siteConfig";

const SEOSchema = () => {
  const medicalClinicSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "name": SITE_CONFIG.clinicName,
    "description": "Elevated Health Augusta is Evans' first physician-owned and operated wellness clinic. Hormone optimization, IV therapy, peptide medicine & medical weight loss under direct physician supervision.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": SITE_CONFIG.address.line1,
      "addressLocality": "Evans",
      "addressRegion": "GA",
      "postalCode": "30809",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 33.5343,
      "longitude": -82.1285
    },
    "url": "https://elevatedhealthaugusta.com",
    "telephone": `+1${SITE_CONFIG.phoneRaw}`,
    "priceRange": "$79-$699",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "17:00"
      }
    ],
    "medicalSpecialty": [
      "Hormone Therapy",
      "Weight Management",
      "Regenerative Medicine"
    ],
    "areaServed": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": 33.5343,
        "longitude": -82.1285
      },
      "geoRadius": "50"
    },
    "sameAs": [
      "https://www.instagram.com/elevated-health-augusta"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What services does Elevated Health Augusta offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Elevated Health Augusta offers physician-supervised hormone optimization (BHRT, TRT), IV therapy, peptide protocols, and medical weight loss (GLP-1 medications) in Evans, GA."
        }
      },
      {
        "@type": "Question",
        "name": "What insurance do you accept?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We accept Blue Cross Blue Shield, TRICARE, and VA benefits. Contact us to verify your specific coverage."
        }
      },
      {
        "@type": "Question",
        "name": "How much is a consultation at Elevated Health Augusta?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Initial Wellness Assessment is $79 and is credited toward your first treatment."
        }
      }
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(medicalClinicSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
    </Helmet>
  );
};

export default SEOSchema;