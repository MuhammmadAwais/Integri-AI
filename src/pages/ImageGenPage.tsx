import { useAppSelector } from "../hooks/useRedux";
import GenLeftPanel from "../features/imageGen/components/GenLeftPanel";
import GenRightPanel from "../features/imageGen/components/GenRightPanel";

const ImageGenPage = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);
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
        <GenLeftPanel isDark={isDark} />
      </div>

      {/* Carousel Panel (Right) */}
      <div className="flex-1 h-full overflow-hidden relative z-10">
        <GenRightPanel isDark={isDark} />
      </div>
    </div>
  );
};

export default ImageGenPage;
