import { useAppSelector } from "../hooks/useRedux";
import GenLeftPanel from "../features/imageGen/components/GenLeftPanel";
import GenRightPanel from "../features/imageGen/components/GenRightPanel";
import ImagePreview from "../features/imageGen/components/ImagePreview";
import { useImageGen } from "../features/imageGen/hooks/useImageGen";

const ImageGenPage = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);

  // Hook State
  const {
    generateImage,
    generatedImage,
    isGenerating,
    error,
    downloadImage,
    resetGen,
  } = useImageGen();

  // Handler for generation
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
      aspectRatio: params.ratio.label,
      quality: params.res.label,
      imageFile: params.file,
    });
  };
  
  {generatedImage || isGenerating ? console.log(generatedImage , "url") : null}
  return (
    <div
      className={`flex flex-col md:flex-row h-[calc(100vh-64px)] w-full overflow-hidden transition-colors duration-200 font-sans
      ${isDark ? "bg-black text-white" : "bg-white text-zinc-900"}`}
    >
      {/* LEFT PANEL: Inputs
         - On Mobile: Order 1 (Top)
         - On Desktop: Left Side, fixed width
      */}
      <div
        className={`
          order-1 md:order-1
          w-full md:w-[380px] xl:w-[420px] 
          shrink-0 
          md:h-full h-auto 
          border-b md:border-b-0 md:border-r 
          z-20 relative flex flex-col
          ${isDark ? "border-zinc-800 bg-black" : "border-zinc-200 bg-white"}
        `}
      >
        {/* We pass a max-height style for mobile to allow scrolling within the panel if needed */}
        <div className="h-full overflow-hidden">
          <GenLeftPanel
            isDark={isDark}
            isGenerating={isGenerating}
            onGenerate={handleGenerateRequest}
          />
        </div>

        {/* Error Toast / Notification Area */}
        {error && (
          <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-xs font-medium text-center">
            {error}
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Preview or Gallery
         - On Mobile: Order 2 (Bottom), takes remaining height
         - On Desktop: Right Side, takes remaining width
      */}
      <div className="order-2 md:order-2 flex-1 h-full overflow-hidden relative z-10">
        {/* Conditional Logic: Show Preview if generating or image exists, otherwise Show Gallery */}
        {generatedImage || isGenerating ? (
          <ImagePreview
            isDark={isDark}
            isLoading={isGenerating}
            imageSrc={generatedImage?.url || ""}
            prompt={generatedImage?.prompt || ""}
            onDownload={() =>
              generatedImage &&
              downloadImage(generatedImage.url, `generated-${Date.now()}.png`)
            }
            onClose={resetGen}
          />
        ) : (
          <GenRightPanel
            isDark={isDark}
            generatedImage={generatedImage}
            isGenerating={isGenerating}
          />
        )}
      </div>
    </div>
  );
};

export default ImageGenPage;
