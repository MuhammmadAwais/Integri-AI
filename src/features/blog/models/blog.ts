export type BlockType = "heading" | "paragraph" | "list" | "image";

export interface BlogContentBlock {
  id: string;              // Client-side unique ID for element indexing keys
  type: BlockType;
  value: string | string[]; // Text content strings or array of lines for 'list' type
  order: number;           // Sequential execution order
}

export interface BlogPost {
  id?: string;             // Firestore automatic document hash
  title: string;
  slug: string;            // Standard URL format generated dynamically from the title
  thumbnail: string;       // Safe public storage string URL
  topic: string;           // Form drop-down indicator (e.g., General, Science)
  category: BlogCategory;  // Explicit string values specified below
  tags: string[];          // Keywords parsed from clean comma splits
  views: number;           // Defaults to 0 upon write initialization
  status: "draft" | "published";
  createdAt: any;          // Firestore serverTimestamp instance
  updatedAt: any;          // Firestore serverTimestamp instance
  blocks: BlogContentBlock[];
}

export type BlogCategory =
  | "General"
  | "Trending"
  | "AI & Deep Learning"
  | "Web Development"
  | "Software Architecture"
  | "Tutorials"
  | "Tech Insights";

// Lightweight blog metadata for list views & global search (excluding blocks)
export type BlogMetadata = Omit<BlogPost, "blocks">;
