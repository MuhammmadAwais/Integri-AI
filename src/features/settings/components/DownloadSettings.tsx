import React, { useState } from "react";
import { cn } from "../../../lib/utils";
import { useAppSelector } from "../../../hooks/useRedux";
import DownloadModal from "../../../Components/ui/DownloadModal";
import appleLight from "../../../../public/light-theme-apple.png";
import appleDark from "../../../../public/dark-theme-apple.png";
import playstore from "../../../../public/playstore.png";
import qrCodeApple from "../../../../public/AppstoreQR.jpeg";
import qrCodeAndroid from "../../../../public/PlaystoreQR.jpeg";
import { motion } from "framer-motion";

interface AppButtonProps {
  iconSrc: string;
  title: string;
  subtitle: string;
  href: string;
  qrCodeImage?: string;
}

interface DownloadSettingsProps {
  isSidebar?: boolean;
  style?: React.CSSProperties; // New prop for dynamic positioning
  onMouseEnter?: () => void; // Keep menu open
  onMouseLeave?: () => void; // Close menu
}

const DownloadSettings: React.FC<DownloadSettingsProps> = ({
  isSidebar,
  style,
  onMouseEnter,
  onMouseLeave,
}) => {
  const isDark = useAppSelector((state: any) => state.theme.isDark);

  const AppButton: React.FC<AppButtonProps> = ({
    iconSrc,
    title,
    subtitle,
    href,
    qrCodeImage,
  }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        className={cn(
          "relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group min-w-[280px] w-full sm:w-auto flex-1",
          isDark
            ? "bg-[#121212] border-[#2A2B32] hover:border-gray-600 hover:bg-[#1A1A1A]"
            : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5"
        )}
      >
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 flex-1 mr-4"
        >
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 p-2 transition-colors",
              isDark ? "bg-white/5" : "bg-gray-50"
            )}
          >
            <img
              src={iconSrc}
              alt={title}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex flex-col">
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-wider mb-0.5",
                isDark ? "text-gray-400" : "text-gray-500"
              )}
            >
              {subtitle}
            </span>
            <span
              className={cn(
                "text-lg font-bold leading-none",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {title}
            </span>
          </div>
        </a>

        <div
          className={cn(
            "w-px h-8 mx-2",
            isDark ? "bg-gray-800" : "bg-gray-200"
          )}
        />

        <div
          className="relative flex flex-col items-center justify-center"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <DownloadModal
            isOpen={isHovered}
            isDark={isDark}
            qrCodeSrc={qrCodeImage}
            storeName={title}
          />

          <button
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              isHovered
                ? isDark
                  ? "bg-white/10 text-white"
                  : "bg-black/5 text-black"
                : isDark
                ? "text-gray-500 hover:text-gray-300"
                : "text-gray-400 hover:text-gray-600"
            )}
            aria-label="Show QR Code"
          >
            <img
              src={qrCodeImage}
              alt="QR Code"
              className="w-8 h-8 object-contain"
            />
          </button>
        </div>
      </div>
    );
  };

  // --- NEW SIDEBAR VARIANT ---
  if (isSidebar) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, x: -10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95, x: -10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={style}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={cn(
          "fixed z-9999 p-6 rounded-3xl border shadow-2xl backdrop-blur-xl max-w-[460px] w-auto hidden md:block",
          isDark
            ? "bg-[#18181b]/95 border-zinc-700/50 shadow-black/50"
            : "bg-white/95 border-gray-200 shadow-xl"
        )}
      >
        {/* Header */}
        <div className="mb-5 text-center">
          <h4
            className={cn(
              "text-lg font-bold",
              isDark ? "text-white" : "text-zinc-900"
            )}
          >
            Scan to Download
          </h4>
          <p
            className={cn(
              "text-xs mt-1",
              isDark ? "text-zinc-400" : "text-zinc-500"
            )}
          >
            Get the full Integri experience on mobile
          </p>
        </div>

        {/* QR Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* iOS Column */}
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-xl border w-full aspect-square flex items-center justify-center bg-white",
                isDark ? "border-zinc-700" : "border-zinc-100"
              )}
            >
              <img
                src={qrCodeApple}
                alt="App Store QR"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <img
                src={isDark ? appleDark : appleLight}
                alt="Apple"
                className="w-4 h-4 object-contain"
              />
              <span
                className={cn(
                  "text-xs font-semibold",
                  isDark ? "text-zinc-300" : "text-zinc-700"
                )}
              >
                iOS
              </span>
            </div>
          </div>

          {/* Android Column */}
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-xl border w-full aspect-square flex items-center justify-center bg-white",
                isDark ? "border-zinc-700" : "border-zinc-100"
              )}
            >
              <img
                src={qrCodeAndroid}
                alt="Play Store QR"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <img
                src={playstore}
                alt="Android"
                className="w-4 h-4 object-contain"
              />
              <span
                className={cn(
                  "text-xs font-semibold",
                  isDark ? "text-zinc-300" : "text-zinc-700"
                )}
              >
                Android
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // --- DEFAULT VARIANT (Settings Page) ---
  return (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h3
          className={cn(
            "text-lg font-semibold mb-1",
            isDark ? "text-white" : "text-black"
          )}
        >
          Get the Mobile App
        </h3>
        <p
          className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}
        >
          Experience the full power of our AI on the go. Available for iOS and
          Android.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <AppButton
          iconSrc={isDark ? appleDark : appleLight}
          title="App Store"
          subtitle="Download on the"
          href="https://apps.apple.com/us/app/integri/id6737592364"
          qrCodeImage={qrCodeApple}
        />

        <AppButton
          iconSrc={playstore}
          title="Google Play"
          subtitle="Get it on"
          href="https://play.google.com/store/apps/details?id=com.integri.integri&hl=en"
          qrCodeImage={qrCodeAndroid}
        />
      </div>
    </div>
  );
};

export default DownloadSettings;
