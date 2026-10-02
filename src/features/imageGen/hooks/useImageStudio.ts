import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/useRedux";
import {
  ImageGenService,
  IMAGE_GEN_MODEL,
  SessionService,
} from "../../../api/backendApi";
import { fetchLimits } from "../../limits/slices/limitsSlice";

// Option lists — identical to the mobile app's GenerateImageSectionController.
export const ASPECT_RATIOS = [
  "Square (1:1)",
  "Portrait (4:5)",
  "Classic Portrait (3:4)",
  "Vertical (9:16)",
  "Landscape (16:9)",
] as const;

export const QUALITY_OPTIONS = ["Standard", "HD"] as const;

export const STYLE_PRESETS = [
  "Realistic",
  "Cinematic",
  "3D Render",
  "Digital Art",
  "Anime",
  "Watercolor",
  "Oil Painting",
  "Sketch",
  "Cyberpunk",
  "Minimalist",
] as const;

export const EXAMPLE_PROMPTS = [
  "Portrait, neon light",
  "Double exposure",
  "Product shot",
  "Surreal landscape",
] as const;

export type StudioMessage =
  | { id: string; role: "user"; type: "prompt"; text: string }
  | { id: string; role: "assistant"; type: "image"; imageUrl: string; jobId: string; prompt: string }
  | { id: string; role: "assistant"; type: "error"; text: string };

const POLL_INTERVAL_MS = 3000;
const MAX_WAIT_MS = 5 * 60 * 1000;

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** Width / height for an aspect-ratio label, e.g. "Vertical (9:16)" → 9/16. */
export const ratioOf = (label: string | null): number => {
  const m = label?.match(/(\d+):(\d+)/);
  return m ? Number(m[1]) / Number(m[2]) : 1;
};

/**
 * Same prompt shaping as the app: prefix "generate the image" unless the user
 * already said generate/create, then append the optional style, quality and
 * aspect-ratio instructions.
 */
export function buildImagePrompt(
  text: string,
  opts: { style: string | null; quality: string | null; aspectRatio: string | null }
): string {
  let message = text.trim();
  const lower = message.toLowerCase();
  if (!lower.includes("generate") && !lower.includes("create")) {
    message = `generate the image ${message}`;
  }
  if (opts.style) message = `${message} \n\n Style: ${opts.style}`;
  if (opts.quality) message = `${message} \n\n Quality: ${opts.quality}`;
  if (opts.aspectRatio) message = `${message} \n\n Aspect Ratio Instruction: ${opts.aspectRatio}`;
  return message;
}

const errorText = (err: unknown): string => {
  const e = err as { response?: { data?: { detail?: unknown } }; message?: string };
  const detail = e?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  return e?.message || "Something went wrong";
};

export const useImageStudio = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.accessToken);

  const [messages, setMessages] = useState<StudioMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [style, setStyle] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string | null>(null);
  const [quality, setQuality] = useState<string | null>(null);
  /** Aspect ratio of the in-flight job, for the placeholder tile. */
  const [pendingRatio, setPendingRatio] = useState<string | null>(null);

  // One gpt-image-2 session per visit, created lazily like the app does.
  const sessionIdRef = useRef<string>("");
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const push = (msg: StudioMessage) => setMessages((prev) => [...prev, msg]);

  const pollUntilDone = useCallback(
    async (jobId: string, prompt: string) => {
      if (!token) return;
      const started = Date.now();
      while (!cancelledRef.current) {
        if (Date.now() - started > MAX_WAIT_MS) {
          push({ id: uid(), role: "assistant", type: "error", text: "Image generation timed out. Please try again." });
          return;
        }
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        if (cancelledRef.current) return;

        const res = await ImageGenService.getStatus(token, jobId);
        if (res.status === "ready" && res.image_url) {
          push({ id: uid(), role: "assistant", type: "image", imageUrl: res.image_url, jobId, prompt });
          // A generation was consumed: refresh the "images left" count.
          dispatch(fetchLimits(token));
          return;
        }
        if (res.status === "error") {
          push({ id: uid(), role: "assistant", type: "error", text: `Failed to generate image: ${res.error || "Generation failed"}` });
          return;
        }
      }
    },
    [token, dispatch]
  );

  /** Returns false when nothing was sent (empty prompt / already generating). */
  const generate = useCallback(
    async (text: string): Promise<boolean> => {
      const original = text.trim();
      if (!original || isGenerating || !token) return false;

      push({ id: uid(), role: "user", type: "prompt", text: original });
      setIsGenerating(true);
      setPendingRatio(aspectRatio);

      try {
        if (!sessionIdRef.current) {
          const session = await SessionService.createSession(token, IMAGE_GEN_MODEL, "openai", null);
          sessionIdRef.current = session.session_id;
        }
        const jobId = await ImageGenService.startJob(token, {
          content: buildImagePrompt(original, { style, quality, aspectRatio }),
          session_id: sessionIdRef.current,
        });
        await pollUntilDone(jobId, original);
      } catch (err) {
        push({ id: uid(), role: "assistant", type: "error", text: `An error occurred: ${errorText(err)}` });
      } finally {
        if (!cancelledRef.current) setIsGenerating(false);
      }
      return true;
    },
    [isGenerating, token, style, quality, aspectRatio, pollUntilDone]
  );

  /** Signed URLs expire; ask the backend for a fresh one before download. */
  const freshUrl = useCallback(
    async (jobId: string, fallback: string) => {
      if (!token) return fallback;
      try {
        return (await ImageGenService.getFreshUrl(token, jobId)) || fallback;
      } catch {
        return fallback;
      }
    },
    [token]
  );

  return {
    messages,
    isGenerating,
    pendingRatio,
    style,
    setStyle,
    aspectRatio,
    setAspectRatio,
    quality,
    setQuality,
    generate,
    freshUrl,
  };
};
