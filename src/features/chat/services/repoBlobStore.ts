/**
 * repoBlobStore.ts
 *
 * A thin module-level store for the non-serializable File blob produced by
 * useRepoPacker. This keeps the File object completely out of Redux (which
 * only accepts serializable values), while still making it globally accessible
 * to the Prompt Bridge in ChatInterface.
 *
 * Usage:
 *   repoBlobStore.set(blob)   — called by useRepoPacker after packing
 *   repoBlobStore.get()       — called by ChatInterface before sending
 *   repoBlobStore.clear()     — called after the file is consumed/cleared
 */

let _blob: File | null = null;

export const repoBlobStore = {
  set(file: File) {
    _blob = file;
  },
  get(): File | null {
    return _blob;
  },
  clear() {
    _blob = null;
  },
};
