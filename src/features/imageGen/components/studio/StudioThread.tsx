import React, { useEffect, useState } from "react";
import { AlertCircle, Download, ExternalLink, Loader2, Maximize2, Sparkles, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import AdUnit from "../../../../Components/ads/AdUnit";
import { AD_SLOTS } from "../../../../config/ads";
import { ratioOf, type StudioMessage } from "../../hooks/useImageStudio";

interface StudioThreadProps {
  messages: StudioMessage[];
  isGenerating: boolean;
  pendingRatio: string | null;
  freshUrl: (jobId: string, fallback: string) => Promise<string>;
  showAds: boolean;
  isDark: boolean;
}

/** Prompt bubbles + generated images, newest at the bottom (app: reverse list). */
const StudioThread: React.FC<StudioThreadProps> = ({ messages, isGenerating, pendingRatio, freshUrl, showAds, isDark }) => {
  const [viewer, setViewer] = useState<{ url: string; jobId: string; prompt: string } | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6" aria-live="polite">
      {messages.map((m) => {
        if (m.role === "user") {
          return (
            <div key={m.id} className="flex justify-end">
              <p className="max-w-[80%] whitespace-pre-wrap rounded-3xl rounded-br-lg bg-zinc-100 px-4 py-2.5 text-[15px] text-zinc-900 dark:bg-[#1F1D25] dark:text-zinc-50">
                {m.text}
              </p>
            </div>
          );
        }
        if (m.type === "error") {
          return (
            <div key={m.id} className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
              <span>{m.text}</span>
            </div>
          );
        }
        return (
          <React.Fragment key={m.id}>
            <ImageTile
              url={m.imageUrl}
              prompt={m.prompt}
              onOpen={() => setViewer({ url: m.imageUrl, jobId: m.jobId, prompt: m.prompt })}
              onDownload={async () => downloadImage(await freshUrl(m.jobId, m.imageUrl))}
            />
            {showAds && (
              <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <AdUnit slot={AD_SLOTS.IMAGE_GEN_GALLERY} format="auto" responsive isDark={isDark} testId="ad-imagestudio" />
              </div>
            )}
          </React.Fragment>
        );
      })}

      {isGenerating && <GeneratingPlaceholder aspectRatio={pendingRatio} />}

      {viewer && (
        <Lightbox
          {...viewer}
          freshUrl={freshUrl}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
};

const ImageTile: React.FC<{ url: string; prompt: string; onOpen: () => void; onDownload: () => Promise<void> }> = ({
  url,
  prompt,
  onOpen,
  onDownload,
}) => {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  return (
    <figure className="group relative w-full max-w-md overflow-hidden rounded-[18px] border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
      <button type="button" onClick={onOpen} className="block w-full hover:cursor-zoom-in" aria-label={t("imageStudio.open", "Open image")}>
        <img src={url} alt={prompt} className="block h-auto w-full" loading="lazy" />
      </button>
      <div className="absolute right-2 top-2 flex gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <TileButton label={t("imageStudio.open", "Open image")} onClick={onOpen}>
          <Maximize2 size={15} />
        </TileButton>
        <TileButton
          label={t("imageStudio.download", "Download")}
          onClick={async () => {
            setBusy(true);
            await onDownload();
            setBusy(false);
          }}
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
        </TileButton>
      </div>
    </figure>
  );
};

const TileButton: React.FC<{ label: string; onClick: () => void; children: React.ReactNode }> = ({ label, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md hover:bg-black/75 hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
  >
    {children}
  </button>
);

/** Port of ImageGeneratingPlaceholder: shimmer tile at the chosen ratio. */
const GeneratingPlaceholder: React.FC<{ aspectRatio: string | null }> = ({ aspectRatio }) => {
  const { t } = useTranslation();
  const ratio = ratioOf(aspectRatio);
  return (
    <div
      role="status"
      className="relative w-full max-w-md overflow-hidden rounded-[18px] border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
      style={{ aspectRatio: String(ratio), maxHeight: "42vh", minHeight: 170 }}
    >
      <div
        aria-hidden
        className="absolute inset-0 animate-[studio-shimmer_1.6s_ease-in-out_infinite] bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.55)_50%,transparent_75%)] bg-[length:200%_100%] dark:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.06)_50%,transparent_75%)]"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
        <Sparkles size={26} className="animate-pulse text-(--integri-accent-600)" aria-hidden />
        <span className="animate-pulse text-[12.5px] font-semibold text-zinc-500 dark:text-zinc-400">
          {t("imageStudio.generating", "Generating…")}
        </span>
      </div>
    </div>
  );
};

const Lightbox: React.FC<{
  url: string;
  jobId: string;
  prompt: string;
  freshUrl: (jobId: string, fallback: string) => Promise<string>;
  onClose: () => void;
}> = ({ url, jobId, prompt, freshUrl, onClose }) => {
  const { t } = useTranslation();
  const [src, setSrc] = useState(url);

  // The app's viewer swaps in a fresh signed URL as soon as it opens.
  useEffect(() => {
    let alive = true;
    freshUrl(jobId, url).then((u) => alive && setSrc(u));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      alive = false;
      document.removeEventListener("keydown", onKey);
    };
  }, [jobId, url, freshUrl, onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={prompt} className="fixed inset-0 z-[70] flex flex-col bg-black/90 backdrop-blur-sm">
      <div className="flex items-center justify-end gap-2 p-3">
        <TileButton label={t("imageStudio.download", "Download")} onClick={() => downloadImage(src)}>
          <Download size={16} />
        </TileButton>
        <TileButton label={t("imageStudio.openTab", "Open in new tab")} onClick={() => window.open(src, "_blank", "noopener")}>
          <ExternalLink size={16} />
        </TileButton>
        <TileButton label={t("common.close", "Close")} onClick={onClose}>
          <X size={16} />
        </TileButton>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center p-4" onClick={onClose}>
        <img src={src} alt={prompt} className="max-h-full max-w-full rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
      </div>
      {prompt && <p className="px-6 pb-6 text-center text-sm text-zinc-300">{prompt}</p>}
    </div>
  );
};

async function downloadImage(url: string) {
  try {
    const blob = await (await fetch(url)).blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `integri-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  } catch {
    // Cross-origin storage without CORS: let the browser handle it.
    window.open(url, "_blank", "noopener");
  }
}

export default StudioThread;
