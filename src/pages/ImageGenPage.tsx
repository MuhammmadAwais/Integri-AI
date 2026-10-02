import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import { useAppSelector } from "../hooks/useRedux";
import { useSubscription } from "../features/subscriptions/hooks/useSubscription";
import {
  ASPECT_RATIOS,
  EXAMPLE_PROMPTS,
  QUALITY_OPTIONS,
  STYLE_PRESETS,
  useImageStudio,
} from "../features/imageGen/hooks/useImageStudio";
import StudioComposer from "../features/imageGen/components/studio/StudioComposer";
import StudioThread from "../features/imageGen/components/studio/StudioThread";
import StudioOptionSheet from "../features/imageGen/components/studio/StudioOptionSheet";
import LoginModal from "../features/auth/components/LoginModal";
import SubscribeModal from "../features/subscriptions/components/SubscribeModal";

/**
 * Integri Studio — web port of the app's GenerateImageSection: empty state
 * with idea chips, a prompt/image thread, and a composer with Styles and
 * Image-settings sheets. Generation uses the same REST job API as the app.
 */
const ImageGenPage = () => {
  const { t } = useTranslation();
  const isDark = useAppSelector((state) => state.theme.isDark);
  const token = useAppSelector((state) => state.auth.accessToken);
  const limits = useAppSelector((state) => state.limits.limits);
  const { isFree } = useSubscription();

  const studio = useImageStudio();
  const [prompt, setPrompt] = useState("");
  const [sheet, setSheet] = useState<"styles" | "settings" | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Same rule as the app: unknown or non-positive limit = unlimited (no hint).
  const imageLimit = limits?.image_generation_limit ?? 0;
  const imagesRemaining =
    limits && imageLimit > 0 ? Math.max(0, imageLimit - limits.images_generated_this_month) : null;

  const isEmpty = studio.messages.length === 0 && !studio.isGenerating;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [studio.messages.length, studio.isGenerating]);

  const submit = async () => {
    if (!token) return setShowLogin(true);
    // The app unlocks a generation past the quota with rewarded ads; the web
    // has no rewarded format, so it offers the upgrade instead.
    if (imagesRemaining === 0) return setShowUpgrade(true);
    const text = prompt;
    setPrompt("");
    const sent = await studio.generate(text);
    if (!sent) setPrompt(text);
  };

  const composer = (
    <StudioComposer
      value={prompt}
      onChange={setPrompt}
      onSubmit={submit}
      isGenerating={studio.isGenerating}
      styleActive={studio.style !== null}
      settingsActive={studio.aspectRatio !== null || studio.quality !== null}
      onOpenStyles={() => setSheet("styles")}
      onOpenSettings={() => setSheet("settings")}
      imagesRemaining={token ? imagesRemaining : null}
    />
  );

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-zinc-50 dark:bg-[#07060A]">
      {/* Glass backdrop: vertical gradient + teal and violet glows (app: _GlassBackdrop) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden dark:block bg-[linear-gradient(180deg,#14121C_0%,#07060A_50%,#050409_100%)]" />
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.18),transparent_70%)]" />
      <div aria-hidden className="pointer-events-none absolute -left-24 bottom-16 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(124,92,255,0.12),transparent_70%)]" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-center gap-2 px-4 pb-1 pt-4">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-[#F2F4F7]">
          {t("imageStudio.title", "Create Image")}
        </h1>
        <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          {t("imageStudio.beta", "Beta")}
        </span>
      </header>

      {/* Body */}
      <main className={cn("relative z-10 min-h-0 flex-1 overflow-y-auto", isEmpty && "flex flex-col justify-center")}>
        {isEmpty ? (
          <section className="mx-auto flex w-full flex-col items-center pb-[8vh] pt-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#5EEAD4,#3BB8A0)] shadow-[0_0_24px_2px_rgba(94,234,212,0.28)]">
              <Sparkles size={30} className="text-[#07060A]" aria-hidden />
            </div>
            <h2 className="mt-6 text-[25px] font-light tracking-wide text-zinc-900 dark:text-[#F2F4F7]">
              {t("imageStudio.emptyTitle", "What should we create?")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {t("imageStudio.emptySubtitle", "Describe an image, or start from an idea below.")}
            </p>
            <div className="mt-7 w-full text-left">{composer}</div>
            <div className="flex max-w-xl flex-wrap justify-center gap-2.5 px-8">
              {EXAMPLE_PROMPTS.map((idea) => (
                <button
                  key={idea}
                  type="button"
                  onClick={() => {
                    setPrompt(idea);
                    document.getElementById("studio-prompt")?.focus();
                  }}
                  className="rounded-full border border-zinc-300 px-[18px] py-2.5 text-[13px] font-light text-zinc-800 transition-colors hover:border-zinc-400 hover:bg-white dark:border-zinc-700 dark:text-[#F2F4F7] dark:hover:border-zinc-500 dark:hover:bg-white/[0.03] hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--integri-accent-600)"
                >
                  {idea}
                </button>
              ))}
            </div>
          </section>
        ) : (
          <StudioThread
            messages={studio.messages}
            isGenerating={studio.isGenerating}
            pendingRatio={studio.pendingRatio}
            freshUrl={studio.freshUrl}
            showAds={isFree}
            isDark={isDark}
          />
        )}
        <div ref={bottomRef} />
      </main>

      {/* Composer: centred with the empty state, docked at the bottom once a thread exists */}
      {!isEmpty && <div className="relative z-10">{composer}</div>}

      <StudioOptionSheet
        open={sheet === "styles"}
        onClose={() => setSheet(null)}
        icon={Sparkles}
        title={t("imageStudio.styles", "Styles")}
        subtitle={t("imageStudio.stylesSubtitle", "Style keywords added to your prompt.")}
        sections={[
          {
            options: STYLE_PRESETS,
            value: studio.style,
            onChange: studio.setStyle,
            noneLabel: t("imageStudio.none", "None"),
          },
        ]}
      />
      <StudioOptionSheet
        open={sheet === "settings"}
        onClose={() => setSheet(null)}
        icon={SlidersHorizontal}
        title={t("imageStudio.settings", "Image settings")}
        subtitle={t("imageStudio.settingsSubtitle", "Optional — refines your prompt.")}
        sections={[
          {
            label: t("imageStudio.aspectRatio", "Aspect ratio"),
            options: ASPECT_RATIOS,
            value: studio.aspectRatio,
            onChange: studio.setAspectRatio,
          },
          {
            label: t("imageStudio.quality", "Quality"),
            options: QUALITY_OPTIONS,
            value: studio.quality,
            onChange: studio.setQuality,
          },
        ]}
        onReset={() => {
          studio.setAspectRatio(null);
          studio.setQuality(null);
        }}
      />

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        title={t("imageStudio.loginTitle", "Sign in to create images")}
        description={t("imageStudio.loginDescription", "Create a free account to generate images with Integri Studio.")}
      />
      <SubscribeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureName={t("imageStudio.featureName", "more image generations")}
      />
    </div>
  );
};

export default ImageGenPage;
