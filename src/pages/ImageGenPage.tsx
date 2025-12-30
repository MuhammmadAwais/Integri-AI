import { useAppSelector } from "../hooks/useRedux";
import GenLeftPanel from "../features/imageGen/components/GenLeftPanel";
import GenRightPanel from "../features/imageGen/components/GenRightPanel";


const ImageGenPage = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);

  return (
    <div
      className={`flex h-[calc(100vh-64px)] w-full overflow-hidden transition-colors duration-200 font-sans
      ${isDark ? "bg-black text-white" : "bg-white text-gray-900"}`}
    >
      {/* Input Panel (Left) - Fixed Width/Smaller */}
      <div className="w-[400px] xl:w-[450px] shrink-0 h-full border-r border-gray-200 dark:border-gray-800 z-10 relative">
        <GenLeftPanel isDark={isDark} />
      </div>

      {/* Carousel Panel (Right) - Expands to fill rest */}
      <div className="flex-1 h-full overflow-hidden relative bg-gray-50 dark:bg-[#0a0a0a]">
        <GenRightPanel isDark={isDark} />
      </div>
    </div>
  );
};

export default ImageGenPage;
