import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronDown,
  BookOpen,
  Tag,
  ArrowRight,
} from "lucide-react";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../lib/utils";
import { useBlogMetadata } from "../features/blog/hooks/useBlog";
import type { BlogMetadata } from "../features/blog/models/blog";
import gsap from "gsap";

// ── Minimalist SVG Thumbnail Fallback ──────────────────────────────────
const ThumbnailFallback: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <div
    className={cn(
      "w-full h-full flex items-center justify-center relative overflow-hidden select-none",
      isDark ? "bg-[#18161C]" : "bg-gray-100"
    )}
  >
    <div
      className="absolute inset-0 opacity-15"
      style={{
        backgroundImage: isDark
          ? `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`
          : `radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.08) 1px, transparent 0)`,
        backgroundSize: "16px 16px",
      }}
    />
    <div className="text-center p-4 z-10 flex flex-col items-center gap-2">
      <BookOpen
        className={cn(
          "w-8 h-8 stroke-[1.2]",
          isDark ? "text-gray-500" : "text-gray-400"
        )}
      />
      <span
        className={cn(
          "text-[9px] font-semibold tracking-widest uppercase",
          isDark ? "text-gray-600" : "text-gray-400"
        )}
      >
        Integri AI Technology
      </span>
    </div>
  </div>
);


// ── Blog Card Component ─────────────────────────────────────────────
interface BlogCardProps {
  blog: BlogMetadata;
  isDark: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog, isDark }) => {
  return (
    <Link
      to={`/blog/${blog.slug}`}
      className="block group h-full"
      id={`blog-card-${blog.slug}`}
    >
      <article
        className={cn(
          "rounded-xl overflow-hidden transition-all duration-300 h-full flex flex-col focus-within:ring-2 focus-within:ring-blue-500/50",
          isDark
            ? "bg-[#07060A] hover:bg-[#18161C] border border-white/5 hover:border-white/10"
            : "bg-white hover:bg-gray-50/80 border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md"
        )}
      >
        {/* Thumbnail Image / SVG Fallback */}
        <div className="aspect-[16/10] w-full overflow-hidden relative border-b border-black/5 bg-[#07060A]">
          {blog.thumbnail ? (
            <img
              src={blog.thumbnail}
              alt={blog.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                // If the thumbnail URL fails to load, replace it or trigger error state
                (e.currentTarget as HTMLImageElement).style.display = "none";
                const fallbackContainer = e.currentTarget.parentElement?.querySelector(".img-fallback");
                if (fallbackContainer) {
                  (fallbackContainer as HTMLElement).style.display = "flex";
                }
              }}
            />
          ) : null}
          <div
            className="img-fallback absolute inset-0 hidden"
            style={{ display: blog.thumbnail ? "none" : "flex" }}
          >
            <ThumbnailFallback isDark={isDark} />
          </div>
        </div>

        {/* Card Details */}
        <div className="flex flex-col gap-2 p-5 flex-1">
          {/* Metadata: Category & Created At */}
          <div className="flex items-center gap-2 text-[11px]">
            <span
              className={cn(
                "font-bold uppercase tracking-wider px-2 py-0.5 rounded text-[9px]",
                isDark ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-700"
              )}
            >
              {blog.category}
            </span>
          </div>

          {/* Title */}
          <h3
            className={cn(
              "text-base font-bold leading-snug line-clamp-2 group-hover:text-blue-500 group-hover:underline decoration-1 underline-offset-4 transition-colors duration-200",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            {blog.title}
          </h3>

          {/* Tags */}
          {blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {blog.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    "flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded",
                    isDark ? "text-gray-400 bg-white/5" : "text-gray-600 bg-gray-50"
                  )}
                >
                  <Tag size={8} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Click invitation */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 mt-auto pt-4 group-hover:gap-2.5 transition-all duration-200">
            Read blueprint <ArrowRight size={13} />
          </div>
        </div>
      </article>
    </Link>
  );
};

// ── Card Skeleton Component ────────────────────────────────────────
const CardSkeleton: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <div
    className={cn(
      "rounded-xl overflow-hidden animate-pulse h-[340px] flex flex-col border",
      isDark ? "bg-[#07060A] border-white/5" : "bg-white border-gray-100 shadow-sm"
    )}
  >
    <div
      className={cn(
        "aspect-[16/10]",
        isDark ? "bg-[#18161C]" : "bg-gray-100"
      )}
    />
    <div className="p-5 flex-1 space-y-3">
      <div className="flex gap-2">
        <div
          className={cn(
            "h-3.5 w-16 rounded",
            isDark ? "bg-[#18161C]" : "bg-gray-100"
          )}
        />
        <div
          className={cn(
            "h-3.5 w-24 rounded",
            isDark ? "bg-[#18161C]" : "bg-gray-100"
          )}
        />
      </div>
      <div
        className={cn(
          "h-5 w-full rounded",
          isDark ? "bg-[#18161C]" : "bg-gray-100"
        )}
      />
      <div
        className={cn(
          "h-4 w-3/4 rounded",
          isDark ? "bg-[#18161C]" : "bg-gray-100"
        )}
      />
    </div>
  </div>
);

// ── Main Page Component ─────────────────────────────────────────────
const BlogPage: React.FC = () => {
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    blogs,
    allFilteredBlogs,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    hasMore,
    loadMore,
  } = useBlogMetadata(12);

  // GSAP animations for container elements
  useEffect(() => {
    if (!loading && blogs.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".animate-fade-in",
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.06,
            ease: "power3.out",
            clearProps: "all",
          }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, blogs.length]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-full w-full overflow-y-auto select-none",
        isDark ? "bg-[#07060A]" : "bg-gray-50/50"
      )}
      id="blog-page-root"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* ── Page Header ── */}
        <header className="space-y-3 animate-fade-in">
          <h1
            className={cn(
              "text-3xl sm:text-4xl font-extrabold tracking-tight",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            Blogs & Insights
          </h1>
          <p
            className={cn(
              "text-sm max-w-2xl leading-relaxed font-medium",
              isDark ? "text-gray-400" : "text-gray-600"
            )}
          >
            Deep dives into artificial intelligence, core software architecture, web technologies, everyday life, and much more expert written and edited blogs.
          </p>
        </header>

        {/* ── Search & Filter Controls ── */}
        <div className="animate-fade-in flex flex-col md:flex-row gap-4 items-center justify-between py-2 border-y border-black/5 dark:border-white/5">
          {/* Search Input */}
          <div
            className={cn(
              "flex items-center gap-2.5 px-4 py-2 rounded-xl border w-full md:max-w-md transition-all group",
              isDark
                ? "bg-[#07060A] border-white/5 focus-within:border-white/20 focus-within:bg-black"
                : "bg-white border-gray-200 focus-within:bg-white focus-within:border-gray-300 shadow-sm"
            )}
          >
            <Search size={15} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search by title, topic, or tags..."
              className={cn(
                "bg-transparent border-none outline-none w-full text-sm placeholder:text-gray-500 focus:ring-0",
                isDark ? "text-white" : "text-black"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>


        </div>

        {/* ── Loading Skeleton State ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-8">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <CardSkeleton key={i} isDark={isDark} />
            ))}
          </div>
        )}

        {/* ── Error State ── */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="text-red-500 text-sm font-semibold">{error}</span>
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && !error && blogs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center animate-fade-in">
            <BookOpen
              size={40}
              className={cn("stroke-[1.2]", isDark ? "text-gray-700" : "text-gray-300")}
            />
            <h3
              className={cn(
                "text-base font-bold",
                isDark ? "text-gray-300" : "text-gray-800"
              )}
            >
              No blueprints found
            </h3>
            <p
              className={cn(
                "text-xs max-w-xs",
                isDark ? "text-gray-500" : "text-gray-400"
              )}
            >
              We couldn't find any articles matching your search criteria. Try adjusting your query or filters.
            </p>
          </div>
        )}

        {/* ── Grid Content Layout ── */}
        {!loading && !error && blogs.length > 0 && (
          <div className="space-y-8 pb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {blogs.map((blog) => (
                <div key={blog.id} className="animate-fade-in">
                  <BlogCard blog={blog} isDark={isDark} />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={loadMore}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 focus:ring-2 focus:ring-blue-500/50",
                    isDark
                      ? "bg-white/10 text-white hover:bg-white/15 border border-white/10"
                      : "bg-gray-900 text-white hover:bg-gray-800 shadow-sm"
                  )}
                >
                  <ChevronDown size={14} />
                  Load More Blueprints ({allFilteredBlogs.length - blogs.length} left)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
