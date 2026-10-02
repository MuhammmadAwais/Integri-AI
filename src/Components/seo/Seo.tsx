import React, { useEffect } from "react";
import { Helmet } from "react-v19-helmet-async";
import {
  SITE_NAME,
  SITE_TWITTER_HANDLE,
  getCanonicalUrl,
  getOgImageUrl,
} from "../../config/seo";

export type SeoProps = {
  title: string;
  description: string;
  /** Site-relative path; ignored when `noindex` (noindex pages carry no canonical). */
  canonicalPath?: string;
  noindex?: boolean;
  type?: "website" | "article";
  image?: string;
  keywords?: string;
  children?: React.ReactNode;
};

/**
 * Head tags Helmet manages here. index.html, the prerendered marketing pages
 * and the ssrPreview function all ship static copies of these (without
 * Helmet's data-rh marker) for crawlers that don't run JS. Helmet never
 * removes tags it didn't create, so once this component renders its own
 * copies the static ones are dropped; otherwise the page would carry two
 * robots / canonical / description tags.
 */
const STATIC_DUPLICATE_SELECTORS = [
  'meta[name="robots"]',
  'link[rel="canonical"]',
  'meta[name="description"]',
  'meta[name="keywords"]',
  'meta[property^="og:"]',
  'meta[name^="twitter:"]',
]
  .map((s) => `${s}:not([data-rh])`)
  .join(",");

export const removeStaticHeadTags = (selector = STATIC_DUPLICATE_SELECTORS) => {
  document.head.querySelectorAll(selector).forEach((el) => el.remove());
};

/**
 * The single source of head metadata for a page: title, description, exactly
 * one robots tag, a canonical on the www host (indexable pages only), Open
 * Graph and Twitter Card.
 */
const Seo: React.FC<SeoProps> = ({
  title,
  description,
  canonicalPath,
  noindex = false,
  type = "website",
  image,
  keywords,
  children,
}) => {
  useEffect(() => {
    removeStaticHeadTags();
  }, []);

  const canonical = !noindex && canonicalPath ? getCanonicalUrl(canonicalPath) : null;
  const ogImage = getOgImageUrl(image);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      {canonical && <link rel="canonical" href={canonical} />}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE_TWITTER_HANDLE} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {children}
    </Helmet>
  );
};

/** Trims text to a meta-description length on a word boundary. */
export const toMetaDescription = (text: string, max = 160): string => {
  const clean = text.replace(/[*_`#~>]/g, "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : cut.length)}…`;
};

export default Seo;
