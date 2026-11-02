import {
  collection,
  getDocs,
  query,
  where,
  limit,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../app/firebase";
import type { BlogPost, BlogMetadata } from "../models/blog";

const BLOGS_COLLECTION = "Blogs";

// Safely map doc data to BlogPost (full or metadata)
function mapBlogDoc(docSnap: any): BlogPost {
  return mapBlogData(docSnap.id, docSnap.data());
}

function mapBlogData(id: string, d: any): BlogPost {
  return {
    id,
    title: d.headline || d.title || "",
    slug: d.slug || id || "",
    thumbnail: d.coverImage || d.thumbnail || "",
    topic: d.topic || d.category || "General",
    category: d.category ?? "General",
    tags: Array.isArray(d.tags) ? d.tags : [],
    views: d.views ?? 0,
    status: d.status ?? "draft",
    createdAt: d.createdAt instanceof Timestamp ? d.createdAt.toDate() : d.createdAt,
    updatedAt: d.updatedAt instanceof Timestamp ? d.updatedAt.toDate() : d.updatedAt,
    blocks: Array.isArray(d.blocks)
      ? d.blocks.map((b: any, index: number) => ({
          id: b.id || `block-${index}`,
          type: b.type || "paragraph",
          value: b.type === "list" ? (b.items || b.value || "") : (b.value || ""),
          order: typeof b.order === "number" ? b.order : index,
        }))
      : [],
  };
}

/**
 * Fetches all published blog metadata (excluding content blocks) for upfront loading
 * and true global search / client-side filtering.
 */
export async function fetchBlogsMetadata(): Promise<BlogMetadata[]> {
  const q = query(
    collection(db, BLOGS_COLLECTION),
    where("status", "==", "published")
  );

  const querySnapshot = await getDocs(q);
  const blogs = querySnapshot.docs.map((docSnap) => {
    const fullBlog = mapBlogDoc(docSnap);
    // Exclude blocks from metadata
    const { blocks, ...metadata } = fullBlog;
    return metadata;
  });

  // Sort by createdAt descending client-side to bypass composite index requirement
  return blogs.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });
}

/**
 * Fetches a single blog post by its slug, loading all blocks and full content.
 * Firestore treats this as a collection query and returns a query snapshot.
 */
// ── Firestore REST (crawler-safe) ────────────────────────────────────
// The Firestore SDK talks over a streaming channel that search-engine
// renderers often can't hold open; a failed load used to show "Post not
// found" (noindex) to Google. One plain HTTP GET works everywhere.

/** Firestore REST value -> plain JS (timestamps become Date). */
function restValue(v: any): any {
  if (!v || typeof v !== "object") return undefined;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("timestampValue" in v) return new Date(v.timestampValue);
  if ("nullValue" in v) return null;
  if ("arrayValue" in v) return (v.arrayValue.values ?? []).map(restValue);
  if ("mapValue" in v) return restFields(v.mapValue.fields ?? {});
  return undefined;
}

function restFields(fields: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(fields)) out[k] = restValue(v);
  return out;
}

/** The post by document id over REST: a post, null (no such doc), or undefined (couldn't tell). */
async function fetchBlogByIdRest(id: string): Promise<BlogPost | null | undefined> {
  if (!/^[A-Za-z0-9_-]{1,160}$/.test(id)) return undefined;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (!projectId || !apiKey) return undefined;
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${BLOGS_COLLECTION}/${encodeURIComponent(id)}?key=${encodeURIComponent(apiKey)}`
    );
    if (res.status === 404) return null;
    if (!res.ok) return undefined;
    const body = await res.json();
    return mapBlogData(id, restFields(body.fields ?? {}));
  } catch {
    return undefined;
  }
}

export async function fetchBlogBySlug(slug: string): Promise<BlogPost | null> {
  // 0. Blog URLs use the document id: one REST call, which crawlers can render.
  const byId = await fetchBlogByIdRest(slug);
  if (byId) return byId;

  // 1. Try querying by 'slug' field
  const q = query(
    collection(db, BLOGS_COLLECTION),
    where("slug", "==", slug),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return mapBlogDoc(querySnapshot.docs[0]);
  }

  // 2. Fallback: Try fetching directly by document ID (useful if slug is absent/blank in Firestore)
  try {
    const docRef = doc(db, BLOGS_COLLECTION, slug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return mapBlogDoc(docSnap);
    }
  } catch (error) {
    console.error("fetchBlogBySlug direct ID fallback fetch failed:", error);
  }

  return null;
}

