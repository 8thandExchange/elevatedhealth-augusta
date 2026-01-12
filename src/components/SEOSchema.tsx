import { Helmet } from "react-helmet";
import { SITE_CONFIG } from "@/lib/siteConfig";

const SEOSchema = () => {
  const medicalClinicSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "name": SITE_CONFIG.clinicName,
    "image": "https://elevatedhealthaugusta.com/og-image.jpg",
    "description": "Ketamine therapy, medical weight loss, and hormone replacement therapy in Augusta, GA. $99 medical consultation credited toward treatment. Chat with our Virtual Care Team 24/7. BCBS, TRICARE, VA accepted.",
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
    "priceRange": "$199-$400",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "17:00"
      }
    ],
    "medicalSpecialty": [
      "Psychiatry",
      "Mental Health",
      "Weight Management",
      "Hormone Therapy"
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
      "https://www.facebook.com/elevatedhealthaugusta",
      "https://www.instagram.com/elevatedhealthaugusta"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How much does ketamine therapy cost in Augusta?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ketamine therapy at Elevated Health Augusta costs $400 per infusion. We accept Blue Cross Blue Shield, TRICARE, and VA insurance. A typical treatment protocol involves 6 infusions over 28 days."
        }
      },
      {
        "@type": "Question",
        "name": "What insurance do you accept for ketamine therapy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We accept Blue Cross Blue Shield, TRICARE, and VA benefits for ketamine therapy. More insurance providers are being added. Contact us to verify your specific coverage."
        }
      },
      {
        "@type": "Question",
        "name": "Is ketamine therapy effective for depression?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Research from Yale and other leading institutions shows that 70% of patients with treatment-resistant depression experience significant relief with ketamine therapy. It works by promoting rapid formation of new neural connections in the brain."
        }
      },
      {
        "@type": "Question",
        "name": "What conditions does ketamine therapy treat?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ketamine therapy is FDA-approved for treatment-resistant depression and has shown effectiveness for PTSD, anxiety, and OCD. It can also help address the emotional and psychological effects that often accompany chronic health conditions. It's particularly helpful for patients who haven't responded to traditional antidepressants."
        }
      }
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(medicalClinicSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
    </Helmet>
  );
};

export default SEOSchema;
