import React, { useState } from "react";
import { cn } from "../../../lib/utils";
import { useAppSelector } from "../../../hooks/useRedux";
import DownloadModal from "../../../Components/ui/DownloadModal";
import appleLight from "../../../../public/light-theme-apple.png";
import appleDark from "../../../../public/dark-theme-apple.png";
import playstore from "../../../../public/playstore.png";
import qrCodeApple from "../../../../public/AppstoreQR.jpeg";
import qrCodeAndroid from "../../../../public/PlaystoreQR.jpeg";

interface AppButtonProps {
  iconSrc: string;
  title: string;
  subtitle: string;
  href: string;
  qrCodeImage?: string; // This is the actual QR code image to show in modal
}

interface DownloadSettingsProps {
  isSidebar?: boolean;
}
const DownloadSettings: React.FC<DownloadSettingsProps> = ({ isSidebar }) => {
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
        {/* Main Clickable Area for Link */}
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

        {/* Vertical Divider */}
        <div
          className={cn(
            "w-px h-8 mx-2",
            isDark ? "bg-gray-800" : "bg-gray-200"
          )}
        />

        {/* QR Code Trigger Area */}
        <div
          className="relative flex flex-col items-center justify-center"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* The Modal appears relative to this container */}
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


    if (isSidebar) {
      return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div
            className={cn(
              "flex flex-row gap-4 p-4 rounded-xl border",
              isDark
                ? "bg-[#18181b] border-white/5"
                : "bg-white border-gray-200 shadow-sm"
            )}
          >
            {/* Row 1: iOS */}
            <div className="flex flex-col items-center justify-between group">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-1.5 rounded-lg",
                  )}
                >
                  <p className="ml-1">Appstore</p>
                </div>
              </div>
              <div className="bg-white p-1 rounded-md border border-gray-100 shadow-sm">
                <img
                  src={qrCodeApple}
                  alt="iOS QR"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>     

            {/* Row 2: Android */}
            <div className="flex flex-col items-center justify-between group">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-1.5 flex gap-1 items-center rounded-lg "
                    
                  )}
                >
                 
                  <p className="ml-1">Playstore</p>
                </div>
              </div>
              <div className="bg-white p-1 rounded-md border border-gray-100 shadow-sm">
                <img
                  src={qrCodeAndroid}
                  alt="Android QR"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }


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
