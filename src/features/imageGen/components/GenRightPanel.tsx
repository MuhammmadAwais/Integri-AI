import React from "react";
import { Download, Share2, Maximize2 } from "lucide-react";

interface Props {
  isDark: boolean;
}

// Dummy Data
const GALLERY_ITEMS = [
  {
    id: 1,
    url: "https://picsum.photos/id/28/800/600",
    prompt: "A cozy cottage in a snowy forest",
  },
  {
    id: 2,
    url: "https://picsum.photos/id/54/800/1000",
    prompt: "Abstract nebula explosion, 4k",
  },
  {
    id: 3,
    url: "https://picsum.photos/id/64/1000/800",
    prompt: "Cyberpunk girl portrait",
  },
  {
    id: 4,
    url: "https://picsum.photos/id/90/800/800",
    prompt: "Geometric patterns black and white",
  },
  {
    id: 5,
    url: "https://picsum.photos/id/103/800/600",
    prompt: "Old man portrait studio lighting",
  },
];

const GenRightPanel: React.FC<Props> = ({ isDark }) => {
  return (
    <div className="h-full w-full flex flex-col justify-center">
      {/* Title / Status Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10 pointer-events-none">
        <h1
          className={`text-2xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Gallery
        </h1>
      </div>

      {/* Horizontal Carousel Container */}
      <div className="w-full h-[85%] flex items-center overflow-x-auto px-8 gap-6 custom-scrollbar snap-x snap-mandatory">
        {GALLERY_ITEMS.map((item) => (
          <div
            key={item.id}
            className="snap-center shrink-0 h-full max-h-[700px] w-[500px] xl:w-[600px] flex flex-col justify-center"
          >
            {/* Card */}
            <div
              className={`relative w-full h-full rounded-3xl overflow-hidden group shadow-2xl transition-all duration-300
              ${isDark ? "bg-gray-900" : "bg-white"}
            `}
            >
              <img
                src={item.url}
                alt={item.prompt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                <p className="text-white font-medium text-lg line-clamp-2 mb-4">
                  "{item.prompt}"
                </p>
                <div className="flex items-center gap-3">
                  <button title="download" className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-black transition">
                    <Download size={20} />
                  </button>
                  <button title="share" className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-black transition">
                    <Share2 size={20} />
                  </button>
                  <div className="flex-1"></div>
                  <button title="fullscreen" className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black transition border border-white/20">
                    <Maximize2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty Spacer to allow scrolling to the end comfortably */}
        <div className="w-8 shrink-0"></div>
      </div>
    </div>
  );
};

export default GenRightPanel;
