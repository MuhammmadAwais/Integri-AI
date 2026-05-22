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
  const d = docSnap.data();
  return {
    id: docSnap.id,
    title: d.headline || d.title || "",
    slug: d.slug || docSnap.id || "",
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
export async function fetchBlogBySlug(slug: string): Promise<BlogPost | null> {
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

