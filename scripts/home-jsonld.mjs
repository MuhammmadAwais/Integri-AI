/**
 * Homepage structured data (Organization, WebSite, MobileApplication).
 * Used by the prerendered homepage (prerender-seo.mjs) and, in the browser,
 * by src/Components/seo/PageSEO.tsx so both carry the same graph.
 */
export const HOME_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.integri.app/#org",
      name: "Integri",
      legalName: "INTIGRI LTD",
      url: "https://www.integri.app/",
      logo: "https://www.integri.app/light-theme-logo.png",
      email: "support@integri.app",
      sameAs: [
        "https://x.com/IntegriAI",
        "https://www.instagram.com/integri_ai/",
        "https://apps.apple.com/us/app/integri/id6737592364",
        "https://play.google.com/store/apps/details?id=com.integri.integri",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://www.integri.app/#website",
      name: "Integri",
      alternateName: ["Integri AI", "integri.app"],
      url: "https://www.integri.app/",
      publisher: { "@id": "https://www.integri.app/#org" },
    },
    {
      "@type": "MobileApplication",
      name: "Integri",
      operatingSystem: "iOS, Android",
      applicationCategory: "ProductivityApplication",
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      publisher: { "@id": "https://www.integri.app/#org" },
      installUrl: "https://apps.apple.com/us/app/integri/id6737592364",
    },
  ],
};
