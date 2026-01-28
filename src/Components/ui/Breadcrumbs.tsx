import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { getSEOForPath, BASE_URL } from "../../config/seo";

export type BreadcrumbItem = { label: string; path: string };

/**
 * Build breadcrumb items from pathname.
 * Uses SEO config breadcrumbLabel where available; otherwise derives from path.
 */
function buildBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const base = { label: "Home", path: "/" };
  if (!pathname || pathname === "/") return [base];

  const segments = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [base];
  let acc = "";

  for (let i = 0; i < segments.length; i++) {
    acc += `/${segments[i]}`;
    const seo = getSEOForPath(acc);
    const label = (seo as { breadcrumbLabel?: string }).breadcrumbLabel ?? segmentToLabel(segments[i]);
    items.push({ label, path: acc });
  }

  return items;
}

function segmentToLabel(segment: string): string {
  const map: Record<string, string> = {
    login: "Sign In",
    signup: "Sign Up",
    "getting-started": "Getting Started",
    history: "History",
    playground: "Playground",
    voice: "Voice",
    pdf: "PDF Chat",
    settings: "Settings",
    feedback: "Feedback",
    help: "Help",
    agents: "Agents",
    subscriptions: "Subscriptions",
    imageGen: "Image Gen",
    contactUs: "Contact",
  };
  return map[segment] ?? segment.replace(/-/g, " ");
}

/** JSON-LD BreadcrumbList schema for SEO. */
function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const base = BASE_URL.replace(/\/$/, "");
  const list = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: `${base}${item.path}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(list) }}
    />
  );
}

type BreadcrumbsProps = {
  /** Override built-from-route crumbs. Useful for dynamic labels (e.g. agent name). */
  items?: BreadcrumbItem[];
  /** Hide visual breadcrumb UI, keep JSON-LD only. */
  visualOnly?: boolean;
  /** Hide JSON-LD, show only visual. */
  jsonLdOnly?: boolean;
  className?: string;
  /** Theme: light/dark for nav styling */
  isDark?: boolean;
};

/**
 * Breadcrumbs for SEO and UX. Renders visual nav + JSON-LD BreadcrumbList.
 * Use inside router (useLocation). Pass `items` to override route-derived crumbs.
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items: customItems,
  visualOnly = false,
  jsonLdOnly = false,
  className,
  isDark = false,
}) => {
  const { pathname } = useLocation();
  const items = customItems ?? buildBreadcrumbs(pathname);

  return (
    <>
      {!visualOnly && <BreadcrumbJsonLd items={items} />}
      {!jsonLdOnly && (
        <nav
          aria-label="Breadcrumb"
          className={cn("flex flex-wrap items-center gap-1 text-sm", className)}
        >
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <span key={item.path} className="flex items-center gap-1">
                {i > 0 && (
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isDark ? "text-gray-500" : "text-gray-400"
                    )}
                    aria-hidden
                  />
                )}
                {isLast ? (
                  <span
                    className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    className={cn(
                      "transition-colors hover:underline",
                      isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                    )}
                  >
                    {item.label}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
      )}
    </>
  );
};

export default Breadcrumbs;
export { buildBreadcrumbs, BreadcrumbJsonLd };
