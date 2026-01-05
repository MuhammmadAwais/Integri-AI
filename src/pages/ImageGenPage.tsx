import { useAppSelector } from "../hooks/useRedux";
import GenLeftPanel from "../features/imageGen/components/GenLeftPanel";
import GenRightPanel from "../features/imageGen/components/GenRightPanel";
import { useImageGen } from "../features/imageGen/hooks/useImageGen";

const ImageGenPage = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);

  // Use the new hook
  const { generateImage, generatedImage, isGenerating, error } = useImageGen();

  const handleGenerateRequest = (params: {
    model: any;
    prompt: string;
    ratio: any;
    res: any;
    file: File | null;
  }) => {
    generateImage({
      modelId: params.model.id,
      provider: params.model.provider,
      prompt: params.prompt,
      aspectRatio: params.ratio.label, // "Vertical (9:16)" or just ID depending on requirements.
      // Logic asked for "selected quality and aspect ratio".
      quality: params.res.label, // "HD Quality"
      imageFile: params.file,
    });
  };

  return (
    <div
      className={`flex h-[calc(100vh-64px)] w-full overflow-hidden transition-colors duration-200 font-sans
      ${isDark ? "bg-black text-white" : "bg-white text-zinc-900"}`}
    >
      {/* Input Panel (Left) */}
      <div
        className={`w-[380px] xl:w-[420px] shrink-0 h-full border-r z-20 relative flex flex-col
        ${isDark ? "border-zinc-800 bg-black" : "border-zinc-200 bg-white"}`}
      >
        <GenLeftPanel
          isDark={isDark}
          isGenerating={isGenerating}
          onGenerate={handleGenerateRequest}
        />
        {error && (
          <div className="p-2 text-red-500 text-xs text-center">{error}</div>
        )}
      </div>

      {/* Carousel Panel (Right) */}
      <div className="flex-1 h-full overflow-hidden relative z-10">
        <GenRightPanel
          isDark={isDark}
          generatedImage={generatedImage}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
};

export default ImageGenPage;
