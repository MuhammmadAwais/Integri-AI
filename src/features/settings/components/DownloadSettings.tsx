import React from "react";
import { cn } from "../../../lib/utils";
import { useAppSelector } from "../../../hooks/useRedux";

import playstore from "../../../../public/playstore.png";
import appleLight from "../../../../public/light-theme-apple.png";
import appleDark from "../../../../public/dark-theme-apple.png";

interface AppButtonProps {
  iconSrc: string;
  title: string;
  subtitle: string;
  href: string;
}

const DownloadSettings: React.FC = () => {
  const isDark = useAppSelector((state: any) => state.theme.isDark);

  const AppButton: React.FC<AppButtonProps> = ({
    iconSrc,
    title,
    subtitle,
    href,
  }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group flex-1 min-w-[200px]",
        isDark
          ? "bg-[#222] border-[#333] hover:bg-[#2a2a2a] hover:border-[#444]"
          : "bg-[#F9FAFB] text-black border-gray-200 hover:bg-gray-100 hover:shadow-lg"
      )}
    >
      <img src={iconSrc} alt={title} className="w-10 h-10 object-contain" />
      <div>
        <div
          className={cn("text-xs", isDark ? "text-gray-400" : "text-black")}
        >
          {subtitle}
        </div>
        <div className={cn("text-sm font-bold" , isDark ? "text-white" : "text-black")}>{title}</div>
      </div>
    </a>
  );

  return (
    <div className="flex flex-wrap gap-3">
      <AppButton
        iconSrc={isDark ? appleDark : appleLight}
        title="App Store"
        subtitle="Download on the"
        href="https://apps.apple.com/us/app/integri/id6737592364"
      />
      <AppButton
        iconSrc={playstore}
        title="Google Play"
        subtitle="Get it on"
        href="https://play.google.com/store/apps/details?id=com.integri.integri&hl=en"
      />
    </div>
  );
};

export default DownloadSettings;
