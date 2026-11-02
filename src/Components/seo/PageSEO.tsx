import React from "react";
import { useLocation } from "react-router-dom";
import { getSEOForPath, SITE_DEFAULT_DESCRIPTION } from "../../config/seo";
// Same graph the prerendered homepage carries (scripts/prerender-seo.mjs).
import { HOME_JSON_LD } from "../../../scripts/home-jsonld.mjs";
import Seo from "./Seo";

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
