import React, { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import ParticleBackground from "../../../Components/ui/ParticleBackground";
 // Assuming this exists or using simple div

interface Props {
  isDark: boolean;
  generatedImage: { url: string; prompt: string; id?: string } | null;
  isGenerating: boolean;
}

const DUMMY_GALLERY = [
  {
    id: "d1",
    url: "https://picsum.photos/600/1066",
    prompt: "Cyberpunk girl portrait",
  },
  {
    id: "d2",
    url: "https://picsum.photos/601/1067",
    prompt: "Abstract nebula explosion",
  },
  {
    id: "d3",
    url: "https://picsum.photos/602/1068",
    prompt: "A cozy cottage in a snowy forest",
  },
];

const GenRightPanel: React.FC<Props> = ({
  isDark,
  generatedImage,
  isGenerating,
}) => {
  const [gallery, setGallery] = useState(DUMMY_GALLERY);

  // When a new image is generated, prepend it to the gallery
  useEffect(() => {
    if (generatedImage) {
      setGallery((prev) => [generatedImage as any, ...prev]);
    }
  }, [generatedImage]);

  return (
    <div
      className={`h-full w-full flex flex-col items-center justify-center relative overflow-hidden ${
        isDark ? "bg-zinc-950" : "bg-zinc-50"
      }`}
    >
      <ParticleBackground />
      <div
        className={`absolute inset-0 opacity-[0.03] pointer-events-none ${
          isDark
            ? "bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-size-[24px_24px]"
            : "bg-[radial-gradient(circle_at_center,black_1px,transparent_1px)] bg-size-[24px_24px]"
        }`}
      />

      <div className="absolute top-0 left-0 right-0 p-8 z-10 pointer-events-none flex justify-between items-start">
        <h1
          className={`text-2xl font-bold ${
            isDark ? "text-white" : "text-zinc-900"
          }`}
        >
          Prompt Gallery
        </h1>
      </div>

      <div className="w-full h-full flex items-center overflow-x-auto px-10 gap-2 custom-scrollbar snap-x snap-mandatory pt-10">
        {/* Loading State Skeleton */}
        {isGenerating && (
          <div className="snap-center shrink-0 pt-2 h-[90%] w-[45vh] lg:w-[50vh] flex flex-col relative animate-pulse">
            <div
              className={`w-full h-full rounded-2xl ${
                isDark ? "bg-zinc-800" : "bg-zinc-200"
              }`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`font-bold ${
                    isDark ? "text-zinc-600" : "text-zinc-400"
                  }`}
                >
                  Creating Masterpiece...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Items */}
        {gallery.map((item) => (
          <div
            key={item.id}
            className="snap-center shrink-0 pt-2 h-[90%] w-[45vh] lg:w-[50vh] flex flex-col relative group perspective-1000"
          >
            <div
              className={`relative w-full h-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                isDark
                  ? "bg-zinc-900 shadow-black/50 border border-zinc-800"
                  : "bg-white shadow-zinc-200 border border-zinc-100"
              }`}
            >
              <img
                src={item.url}
                alt={item.prompt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-linear-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end gap-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white/90 font-medium text-sm leading-relaxed line-clamp-3">
                  {item.prompt}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <button className="hover:cursor-pointer flex-1 py-3 bg-white text-black font-bold text-sm rounded-xl hover:bg-zinc-200 transition flex items-center justify-center gap-2">
                    Use Prompt
                  </button>
                  <button title="share" className="hover:cursor-pointer p-3 rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition border border-white/10">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="w-10 shrink-0"></div>
      </div>
    </div>
  );
};

export default GenRightPanel;
