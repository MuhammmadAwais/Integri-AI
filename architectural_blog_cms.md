# ENGINEERING SPECIFICATION: ARCHITECTURAL BLOG CMS WITH FIRESTORE

## 1. System Overview & Core Objectives
This document mandates the absolute design and structural parameters for building a dual-sided Blog Content Management System.
- **Admin Panel Role:** Handles document listing, real-time compound queries, client-side pagination, asset storage pipeline transfers, and block-based text compilation.
- **Client App (Integri AI) Role:** Consumes documents dynamically filtered by slug, mapping a sequential flat array of structured blocks to semantic HTML components.
- **UI Styling Identity:** Flat minimalist approach. Plain backgrounds, zero shiny gradients, zero heavy outer glow variables. Optimized focus ring accessibility states (`focus:ring-2 focus:ring-blue-500`).

---

## 2. Shared Data Models (TypeScript)
All components must tightly validate payloads against these data schemas:

```typescript
export type BlockType = 'heading' | 'paragraph' | 'list' | 'image';

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
  status: 'draft' | 'published';
  createdAt: any;          // Firestore serverTimestamp instance
  updatedAt: any;          // Firestore serverTimestamp instance
  blocks: BlogContentBlock[];
}

export type BlogCategory = 'General' | 'Trending' | 'AI & Deep Learning' | 'Web Development' | 'Software Architecture' | 'Tutorials' | 'Tech Insights';
```
