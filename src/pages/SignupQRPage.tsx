import React from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../hooks/useRedux";
import AuthLayout from "../Components/layout/AuthLayout";
import { cn } from "../lib/utils";
import qrCodeApple from "../../public/AppstoreQR.jpeg";
import qrCodeAndroid from "../../public/PlaystoreQR.jpeg";
import appleLight from "../../public/light-theme-apple.png";
import appleDark from "../../public/dark-theme-apple.png";
import playstore from "../../public/playstore.png";
import { ArrowRight } from "lucide-react";

const SignupQRPage: React.FC = () => {
  const isDark = useAppSelector((state: any) => state.theme.isDark);

  return (
    <AuthLayout title="Sign up" subtitle="">
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-5 pb-6 md:pt-4 md:pb-6">
        {/* New Message Section with Color Accent */}
        <div className="text-center w-full max-w-[90%] sm:max-w-2xl mb-6 md:mb-8">
          <div className="inline-flex items-center gap-1 md:gap-1.5 px-2.5 md:px-4 py-1 md:py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border-2 border-blue-400/40 mb-2.5 md:mb-3">
            <span className="text-[9px] md:text-xs font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ✨ Limited Early Access ✨
            </span>
          </div>
          <p
            className={cn(
              "text-[11px] sm:text-xs md:text-sm lg:text-base leading-relaxed font-medium",
              isDark ? "text-zinc-100" : "text-zinc-900",
            )}
          >
            We're onboarding our next{" "}
            <span className="font-bold text-blue-400">100,000 users</span> —
            join early and enjoy the{" "}
            <span className="font-bold text-purple-400">free access</span> to
            all AI models
          </p>
        </div>

        {/* QR Codes Grid with Enhanced Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 w-full max-w-[90%] sm:max-w-md md:max-w-3xl mb-6 md:mb-8">
          {/* iOS QR Code */}
          <div className="flex flex-col items-center w-full">
            {/* Decorative accent line */}
            <div className="w-12 md:w-20 h-0.5 md:h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full opacity-60 mb-2.5 md:mb-4"></div>

            <div
              className={cn(
                "p-3 md:p-5 lg:p-6 rounded-lg md:rounded-2xl lg:rounded-3xl border-2 w-full max-w-[180px] sm:max-w-[200px] md:max-w-[280px] lg:max-w-[300px] aspect-square flex items-center justify-center bg-white transition-all duration-300 hover:scale-[1.01] relative overflow-hidden mb-3 md:mb-5 lg:mb-6",
                isDark
                  ? "border-blue-400/50 hover:border-blue-400/70"
                  : "border-blue-300 hover:border-blue-400",
              )}
            >
              {/* Colorful gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/15 via-purple-50/8 to-pink-50/8 pointer-events-none"></div>
              <img
                src={qrCodeApple}
                alt="App Store QR Code"
                className="w-full h-full object-contain rounded-md md:rounded-xl relative z-10"
              />
            </div>

            {/* Logo and Button Row */}
            <div className="flex items-center gap-2 md:gap-3 w-full max-w-[180px] sm:max-w-[200px] md:max-w-[280px] lg:max-w-[300px]">
              <div
                className={cn(
                  "p-1 md:p-1.5 lg:p-2 rounded-md md:rounded-lg flex-shrink-0 transition-all duration-200",
                  isDark
                    ? "bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-400/40"
                    : "bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300/60",
                )}
              >
                <img
                  src={isDark ? appleDark : appleLight}
                  alt="Apple"
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 object-contain"
                />
              </div>
              <a
                href="https://apps.apple.com/us/app/integri/id6737592364"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex-1 inline-flex items-center justify-center px-2.5 md:px-4 lg:px-5 py-1.5 md:py-2.5 lg:py-3 rounded-md md:rounded-lg lg:rounded-xl text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 hover:cursor-pointer",
                  isDark
                    ? "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white border-2 border-blue-400/70 hover:from-blue-400 hover:via-blue-500 hover:to-blue-600 hover:border-blue-300/90"
                    : "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white border-2 border-blue-400/70 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 hover:border-blue-500",
                )}
              >
                App Store
              </a>
            </div>
          </div>

          {/* Android QR Code */}
          <div className="flex flex-col items-center w-full">
            {/* Decorative accent line */}
            <div className="w-12 md:w-20 h-0.5 md:h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-full opacity-60 mb-2.5 md:mb-4"></div>

            <div
              className={cn(
                "p-3 md:p-5 lg:p-6 rounded-lg md:rounded-2xl lg:rounded-3xl border-2 w-full max-w-[180px] sm:max-w-[200px] md:max-w-[280px] lg:max-w-[300px] aspect-square flex items-center justify-center bg-white transition-all duration-300 hover:scale-[1.01] relative overflow-hidden mb-3 md:mb-5 lg:mb-6",
                isDark
                  ? "border-emerald-400/50 hover:border-emerald-400/70"
                  : "border-emerald-300 hover:border-emerald-400",
              )}
            >
              {/* Colorful gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/15 via-teal-50/8 to-cyan-50/8 pointer-events-none"></div>
              <img
                src={qrCodeAndroid}
                alt="Play Store QR Code"
                className="w-full h-full object-contain rounded-md md:rounded-xl relative z-10"
              />
            </div>

            {/* Logo and Button Row */}
            <div className="flex items-center gap-2 md:gap-3 w-full max-w-[180px] sm:max-w-[200px] md:max-w-[280px] lg:max-w-[300px]">
              <div
                className={cn(
                  "p-1 md:p-1.5 lg:p-2 rounded-md md:rounded-lg flex-shrink-0 transition-all duration-200",
                  isDark
                    ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-400/40"
                    : "bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-300/60",
                )}
              >
                <img
                  src={playstore}
                  alt="Android"
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 object-contain"
                />
              </div>
              <a
                href="https://play.google.com/store/apps/details?id=com.integri.integri&hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex-1 inline-flex items-center justify-center px-2.5 md:px-4 lg:px-5 py-1.5 md:py-2.5 lg:py-3 rounded-md md:rounded-lg lg:rounded-xl text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 hover:cursor-pointer",
                  isDark
                    ? "bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 text-white border-2 border-emerald-400/70 hover:from-emerald-400 hover:via-emerald-500 hover:to-emerald-600 hover:border-emerald-300/90"
                    : "bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 text-white border-2 border-emerald-400/70 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 hover:border-emerald-500",
                )}
              >
                Play Store
              </a>
            </div>
          </div>
        </div>

        {/* Ready to Log In Button with Enhanced Styling */}
        <div className="w-full max-w-[90%] sm:max-w-md mt-2 md:mt-4 lg:mt-6 px-1 md:px-0">
          <Link
            to="/login"
            className={cn(
              "w-full py-2.5 md:py-3.5 lg:py-4 px-3 md:px-5 lg:px-6 rounded-lg md:rounded-xl font-semibold text-[11px] sm:text-xs md:text-sm lg:text-base text-center transition-all duration-200 transform active:scale-[0.98] flex items-center justify-center gap-1.5 md:gap-2",
              isDark
                ? "bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white border-2 border-purple-400/60 hover:from-purple-500 hover:via-purple-600 hover:to-pink-500 hover:border-purple-300/80"
                : "bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white border-2 border-purple-400/60 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 hover:border-purple-500",
            )}
          >
            Ready to Log In? Click Here!
            <ArrowRight
              size={12}
              className="sm:w-[14px] sm:h-[14px] md:w-[16px] md:h-[16px] lg:w-[18px] lg:h-[18px] transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignupQRPage;
