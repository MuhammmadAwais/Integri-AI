import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Loader2,
  ChevronRight,
  Share2,
} from "lucide-react";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../lib/utils";
import { useBlogPost, useBlogMetadata } from "../features/blog/hooks/useBlog";
import type { BlogContentBlock, BlogMetadata } from "../features/blog/models/blog";
import ShareModal from "../Components/ui/ShareModal";
import Seo, { toMetaDescription } from "../Components/seo/Seo";
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
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage: isDark
          ? `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`
          : `radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.08) 1px, transparent 0)`,
        backgroundSize: "20px 20px",
      }}
    />
    <div className="text-center p-6 z-10 flex flex-col items-center gap-3">
      <BookOpen
        className={cn(
          "w-12 h-12 stroke-[1.2]",
          isDark ? "text-gray-500" : "text-gray-400"
        )}
      />
      <span
        className={cn(
          "text-[10px] font-bold tracking-widest uppercase",
          isDark ? "text-gray-600" : "text-gray-400"
        )}
      >
        Integri AI Blogs
      </span>
    </div>
  </div>
);


// ── Read Time Estimation ─────────────────────────────────────────────
function estimateReadTime(blocks: BlogContentBlock[]): string {
  let text = "";
  blocks.forEach((b) => {
    if (typeof b.value === "string") {
      text += " " + b.value;
    } else if (Array.isArray(b.value)) {
      text += " " + b.value.join(" ");
    }
  });
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

// ── Blog Block Component ─────────────────────────────────────────────
const BlogBlock: React.FC<{
  block: BlogContentBlock;
  isDark: boolean;
}> = ({ block, isDark }) => {
  switch (block.type) {
    case "heading":
      return (
        <h2
          className={cn(
            "text-xl sm:text-2xl font-extrabold tracking-tight mt-8 mb-4",
            isDark ? "text-white" : "text-gray-900"
          )}
        >
          {block.value}
        </h2>
      );
    case "paragraph":
      return (
        <p
          className={cn(
            "text-base leading-[1.85] mb-5 whitespace-pre-wrap font-medium",
            isDark ? "text-gray-300" : "text-gray-700"
          )}
        >
          {block.value}
        </p>
      );
    case "list": {
      const items = Array.isArray(block.value)
        ? block.value
        : typeof block.value === "string"
        ? block.value.split("\n").filter(Boolean)
        : [];
      return (
        <ul
          className={cn(
            "list-disc pl-6 mb-6 space-y-2 text-base leading-[1.8] font-medium",
            isDark ? "text-gray-300" : "text-gray-700"
          )}
        >
          {items.map((item, idx) => (
            <li key={idx} className="pl-1">
              {item}
            </li>
          ))}
        </ul>
      );
    }
    case "image": {
      const imgUrl = typeof block.value === "string" ? block.value : "";
      return (
        <figure className="my-6 space-y-2 select-none">
          <div className="rounded-xl overflow-hidden bg-[#07060A] border border-black/5 dark:border-white/5">
            <img
              src={imgUrl}
              alt=""
              className="w-full object-cover max-h-[480px]"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </figure>
      );
    }
    default:
      return null;
  }
};

// ── Sidebar List Item Card ──────────────────────────────────────────
const RelatedBlogCard: React.FC<{
  blog: BlogMetadata;
  isDark: boolean;
}> = ({ blog, isDark }) => (
  <Link to={`/blog/${blog.slug}`} className="block group">
    <div
      className={cn(
        "flex gap-3 p-3 rounded-xl transition-all duration-200 border border-transparent",
        isDark
          ? "hover:bg-[#18161C] hover:border-white/5"
          : "hover:bg-gray-100/60 hover:border-gray-200 shadow-sm hover:shadow"
      )}
    >
      <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-[#07060A] relative">
        {blog.thumbnail ? (
          <img
            src={blog.thumbnail}
            alt={blog.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              const fb = e.currentTarget.parentElement?.querySelector(".fb");
              if (fb) (fb as HTMLElement).style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="fb absolute inset-0 hidden items-center justify-center bg-zinc-900/50"
          style={{ display: blog.thumbnail ? "none" : "flex" }}
        >
          <BookOpen className="w-5 h-5 text-gray-500 stroke-[1.2]" />
        </div>
      </div>
      <div className="flex flex-col justify-center gap-1 min-w-0">
        <h4
          className={cn(
            "text-xs font-bold leading-snug line-clamp-2 group-hover:text-blue-500 group-hover:underline transition-all duration-150",
            isDark ? "text-gray-200" : "text-gray-900"
          )}
        >
          {blog.title}
        </h4>
      </div>
    </div>
  </Link>
);

// ── Main Page Component ─────────────────────────────────────────────
const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const { blog, loading, error } = useBlogPost(slug);

  // Fetch metadata for sidebar recommendations
  const { blogs: recentBlogs, loading: recentLoading } = useBlogMetadata(6);

  // Filter out the current active post from recommended sidebar
  const filteredRecentBlogs = recentBlogs
    .filter((b) => b.slug !== slug)
    .slice(0, 5);

  // Animation effect on details loaded
  useEffect(() => {
    if (!loading && blog) {
      const tl = gsap.timeline();
      tl.fromTo(
        ".detail-animate",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" }
      );
    }
  }, [loading, slug]);

  // ── Loading state UI ──
  if (loading) {
    return (
      <div
        className={cn(
          "h-full w-full flex flex-col items-center justify-center gap-3",
          isDark ? "bg-[#07060A]" : "bg-gray-50/50"
        )}
      >
        <Loader2
          size={32}
          className={cn("animate-spin", isDark ? "text-gray-500" : "text-gray-400")}
        />
        <span
          className={cn(
            "text-sm font-semibold",
            isDark ? "text-gray-500" : "text-gray-400"
          )}
        >
          Loading your blog…
        </span>
      </div>
    );
  }

  // ── Error or post not found UI ──
  if (error || !blog) {
    return (
      <div
        className={cn(
          "h-full w-full flex flex-col items-center justify-center gap-4",
          isDark ? "bg-[#07060A] text-white" : "bg-gray-50/50 text-gray-900"
        )}
      >
        {/* Only a post that really doesn't exist is kept out of the index. A
            failed load (network, or a crawler that can't run Firestore) must
            not tell Google to drop a published post. */}
        {!error && <Seo title="Post not found | Integri" description="This blog post could not be found." noindex />}
        <h2 className="text-xl font-bold">{error ?? "Blueprint not found"}</h2>
        <button
          onClick={() => navigate("/blog")}
          className="text-blue-500 hover:underline font-bold flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} /> Back to Catalog
        </button>
      </div>
    );
  }

  // Sort blocks sequentially
  const sortedBlocks = [...blog.blocks].sort((a, b) => a.order - b.order);

  const summary = toMetaDescription(
    sortedBlocks.find((b) => b.type === "paragraph" && typeof b.value === "string" && b.value.trim())
      ?.value as string ?? blog.title
  );

  return (
    <div
      className={cn(
        "h-full w-full overflow-y-auto",
        isDark ? "bg-[#07060A]" : "bg-gray-50/50"
      )}
      id="blog-detail-root"
    >
      <Seo
        title={`${blog.title} | Integri`}
        description={summary}
        canonicalPath={`/blog/${slug}`}
        type="article"
        image={blog.thumbnail || undefined}
        // Drafts are reachable by id but must never be indexed
        noindex={blog.status !== "published"}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb Navigation */}
        <nav
          className={cn(
            "flex items-center gap-1.5 text-xs font-semibold mb-6 select-none",
            isDark ? "text-gray-500" : "text-gray-400"
          )}
          aria-label="Breadcrumb"
        >
          <Link to="/blog" className="hover:text-blue-500 transition-colors">
            Blogs
          </Link>
          <ChevronRight size={12} className="shrink-0" />
          <span className={cn("truncate max-w-[200px]", isDark ? "text-gray-400" : "text-gray-600")}>
            {blog.title}
          </span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Main Content Column ── */}
          <main className="flex-1 max-w-3xl space-y-6">
            <article className="space-y-6">
              {/* Back to Catalog button */}
              <button
                onClick={() => navigate("/blog")}
                className={cn(
                  "detail-animate flex items-center gap-2 text-xs font-bold transition-all duration-200 rounded-lg px-3 py-2 -ml-3 cursor-pointer",
                  isDark
                    ? "text-gray-400 hover:text-white hover:bg-white/5"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <ArrowLeft size={14} />
                Back to Catalog
              </button>

              {/* Badges: Topic, Category, and Tags */}
              <div className="detail-animate flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded",
                    isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-700"
                  )}
                >
                  <BookOpen size={10} />
                  {blog.category}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded",
                    isDark ? "bg-white/10 text-white" : "bg-gray-900/10 text-gray-900"
                  )}
                >
                  {blog.topic}
                </span>
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium",
                      isDark ? "bg-[#18161C] text-gray-400" : "bg-gray-200/50 text-gray-600"
                    )}
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Document Title */}
              <h1
                className={cn(
                  "detail-animate text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                {blog.title}
              </h1>

              {/* Document Meta Info Row */}
              <div className="detail-animate flex flex-wrap items-center gap-4 text-xs font-semibold border-b border-black/5 dark:border-white/5 pb-4">
                <span
                  className={cn(
                    "flex items-center gap-1.5",
                    isDark ? "text-gray-500" : "text-gray-500"
                  )}
                >
                  <Clock size={13} />
                  {estimateReadTime(sortedBlocks)}
                </span>

                {/* Share Button */}
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className={cn(
                    "ml-auto flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer focus:ring-2 focus:ring-blue-500/50",
                    isDark
                      ? "bg-[#18161C] text-gray-300 hover:bg-[#1F1D25]"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"
                  )}
                >
                  <Share2 size={12} />
                  Share
                </button>
              </div>

              {/* Hero Image / Minimalist Fallback */}
              <div className="detail-animate rounded-2xl overflow-hidden bg-[#07060A] border border-black/5 dark:border-white/5 aspect-video w-full relative">
                {blog.thumbnail ? (
                  <img
                    src={blog.thumbnail}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                      const fallback = e.currentTarget.parentElement?.querySelector(".hero-fallback");
                      if (fallback) (fallback as HTMLElement).style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="hero-fallback absolute inset-0 hidden"
                  style={{ display: blog.thumbnail ? "none" : "flex" }}
                >
                  <ThumbnailFallback isDark={isDark} />
                </div>
              </div>

              {/* Sequential Content Block Rendering */}
              <div className="detail-animate space-y-4 pt-4 pb-12">
                {sortedBlocks.map((block) => (
                  <BlogBlock key={block.id} block={block} isDark={isDark} />
                ))}
              </div>
            </article>
          </main>

          {/* ── Sidebar Recommendations Column ── */}
          <aside className="lg:w-72 xl:w-80 shrink-0 space-y-4 select-none">
            <div
              className={cn(
                "rounded-2xl overflow-hidden sticky top-6 border",
                isDark ? "bg-[#07060A] border-white/5" : "bg-white border-gray-100 shadow-sm"
              )}
            >
              <div
                className={cn(
                  "px-4 py-3 flex items-center justify-between",
                  isDark ? "border-b border-white/5" : "border-b border-gray-100"
                )}
              >
                <h3
                  className={cn(
                    "text-xs font-extrabold uppercase tracking-wider",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  Latest Blueprints
                </h3>
                <Link
                  to="/blog"
                  className={cn(
                    "text-[10px] font-bold transition-colors",
                    isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  See all
                </Link>
              </div>

              {recentLoading ? (
                <div className="p-4 space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div
                        className={cn(
                          "w-20 h-14 rounded-lg shrink-0",
                          isDark ? "bg-[#18161C]" : "bg-gray-100"
                        )}
                      />
                      <div className="flex flex-col justify-center gap-2 flex-1">
                        <div
                          className={cn(
                            "h-3 w-full rounded",
                            isDark ? "bg-[#18161C]" : "bg-gray-100"
                          )}
                        />
                        <div
                          className={cn(
                            "h-2.5 w-16 rounded",
                            isDark ? "bg-[#18161C]" : "bg-gray-100"
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-1">
                  {filteredRecentBlogs.map((b) => (
                    <RelatedBlogCard key={b.id} blog={b} isDark={isDark} />
                  ))}
                  {filteredRecentBlogs.length === 0 && (
                    <p
                      className={cn(
                        "text-xs p-4 text-center font-medium",
                        isDark ? "text-gray-500" : "text-gray-400"
                      )}
                    >
                      No other blueprints available yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        isDark={isDark}
        shareData={{ title: blog.title }}
      />
    </div>
  );
};

export default BlogDetailPage;
