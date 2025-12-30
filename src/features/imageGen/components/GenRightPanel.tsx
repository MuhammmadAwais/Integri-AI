import React from "react";
import { Share2 } from "lucide-react";
import ParticleBackground from "../../../Components/ui/ParticleBackground";

interface Props {
  isDark: boolean;
}

// Dummy Data for Gallery
const GALLERY_ITEMS = [
  {
    id: 1,
    url: "https://picsum.photos/600/1066",
    prompt: "Cyberpunk girl portrait, neon lighting",
  },
  {
    id: 2,
    url: "https://picsum.photos/601/1067",
    prompt: "Abstract nebula explosion, 4k vertical",
  },
  {
    id: 3,
    url: "https://picsum.photos/602/1068",
    prompt: "A cozy cottage in a snowy forest, 9:16",
  },
  {
    id: 4,
    url: "https://picsum.photos/603/1069",
    prompt: "Geometric patterns black and white",
  },
  {
    id: 5,
    url: "https://picsum.photos/604/1070",
    prompt: "Old man portrait studio lighting",
  },
];

const GenRightPanel: React.FC<Props> = ({ isDark }) => {
  return (
    <div
      className={`h-full w-full flex flex-col items-center justify-center relative overflow-hidden
      ${isDark ? "bg-zinc-950" : "bg-zinc-50"}`}
    >
      {/* Particles overlay behind background*/}
      <ParticleBackground/>
      {/* Background Pattern (Subtle) */}
      <div
        className={`absolute inset-0 opacity-[0.03] pointer-events-none
        ${
          isDark
            ? "bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-size-[24px_24px]"
            : "bg-[radial-gradient(circle_at_center,black_1px,transparent_1px)] bg-size-[24px_24px]"
        }`}
      />

      {/* Title / Status Bar */}
      <div className="absolute top-0 left-0 right-0 p-8 z-10 pointer-events-none flex justify-between items-start">
        <h1
          className={`text-2xl font-bold ${
            isDark ? "text-white" : "text-zinc-900"
          }`}
        >
         Prompt Gallery
        </h1>
        <div
          className={`pointer-events-auto px-2 py-2 rounded-full text-xs font-bold border backdrop-blur-md
          ${
            isDark
              ? "bg-zinc-900/50 border-zinc-800 text-zinc-400"
              : "bg-white/50 border-zinc-200 text-zinc-600"
          }`}
        >
          Prompts for you
        </div>
      </div>

      {/* Horizontal Carousel Container - Reels Style */}
      <div className="w-full h-full flex items-center overflow-x-auto px-10 gap-6 custom-scrollbar snap-x snap-mandatory pt-10 pb-10">
        {GALLERY_ITEMS.map((item) => (
          <div
            key={item.id}
            className="snap-center shrink-0 h-[85%] w-[45vh] lg:w-[50vh] flex flex-col relative group perspective-1000"
          >
            {/* Card Container */}
            <div
              className={`relative w-full h-full rounded-4xl overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-2
              ${
                isDark
                  ? "bg-zinc-900 shadow-black/50 border border-zinc-800"
                  : "bg-white shadow-zinc-200 border border-zinc-100"
              }
            `}
            >
              {/* Image */}
              <img
                src={item.url}
                alt={item.prompt}
                className="w-full h-full object-cover"
              />

              {/* Bottom Info Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-6 bg-linear-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end gap-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white/90 font-medium text-sm leading-relaxed line-clamp-3">
                  {item.prompt}
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button title="download" className="flex-1 py-3 bg-white text-black font-bold text-sm rounded-xl hover:bg-zinc-200 transition flex items-center justify-center gap-2">                   
                    Use Prompt
                  </button>
                  <button title="share" className="p-3 rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition border border-white/10">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty Spacer */}
        <div className="w-10 shrink-0"></div>
      </div>
    </div>
  );
};

export default GenRightPanel;
