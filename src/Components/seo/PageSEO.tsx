import React from "react";
import { useLocation } from "react-router-dom";
import {
  getSEOForPath,
  SITE_NAME,
  SITE_DEFAULT_DESCRIPTION,
  BASE_URL,
} from "../../config/seo";
import Seo from "./Seo";

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
 * Route-level SEO from src/config/seo.ts.
 *
 * Article routes (/blog/:id, /news/:id, /articles/:id) are left alone: the
 * page renders its own <Seo> once the article loads, and until then the
 * per-article tags the ssrPreview function put in the HTML stay in place.
 * Rendering route defaults there would overwrite every article with the
 * same generic title.
 */
const PageSEO: React.FC = () => {
  const { pathname } = useLocation();
  const seo = getSEOForPath(pathname);
  if (seo.isArticle) return null;

  const isHome = pathname === "/" || pathname === "";

  return (
    <Seo
      title={seo.title}
      description={seo.description || SITE_DEFAULT_DESCRIPTION}
      canonicalPath={seo.canonicalPath}
      noindex={!!seo.noindex}
      keywords={seo.keywords}
      image={seo.ogImage}
    >
      {isHome && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_JSON_LD) }}
        />
      )}
    </Seo>
  );
};

export default PageSEO;
