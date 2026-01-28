import React from "react";
import { Helmet } from "react-v19-helmet-async";
import { useLocation } from "react-router-dom";
import {
  getSEOForPath,
  SITE_NAME,
  SITE_DEFAULT_DESCRIPTION,
  SITE_TWITTER_HANDLE,
  BASE_URL,
} from "../../config/seo";

const SITE_URL = BASE_URL.replace(/\/$/, "");

const HOME_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/dark-theme-logo.png` },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DEFAULT_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-US",
    },
  ],
};

/**
 * Per-page SEO: title, meta description, canonical, Open Graph, Twitter Card.
 * Renders inside HelmetProvider; use useLocation() for current path.
 */
const PageSEO: React.FC = () => {
  const { pathname } = useLocation();
  const seo = getSEOForPath(pathname);
  const canonical = seo.canonicalUrl;
  const ogImage = seo.ogImageUrl;
  const title = seo.title;
  const description = seo.description || SITE_DEFAULT_DESCRIPTION;
  const keywords = seo.keywords;
  const noindex = !!seo.noindex;
  const isHome = pathname === "/" || pathname === "";

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE_TWITTER_HANDLE} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {isHome && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_JSON_LD) }}
        />
      )}
    </Helmet>
  );
};

export default PageSEO;
