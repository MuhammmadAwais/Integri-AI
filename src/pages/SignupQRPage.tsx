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
    <AuthLayout
      title="Download the App"
      subtitle="Sign up via mobile app"
    >
      <div className="flex flex-col items-center space-y-8 w-full max-w-md mx-auto">
        {/* Message */}
        <div className="text-center space-y-3">
          <div className="text-2xl">🌟 Unlock the Full Potential of Integri! 🌟</div>
          <p className={cn(
            "text-sm leading-relaxed",
            isDark ? "text-gray-300" : "text-gray-600"
          )}>
            To enhance your experience with Integri, we invite you to download our app! 
            Once you sign up, you will have access to all AI Language models, all for free!
          </p>
        </div>

        {/* QR Codes Grid */}
        <div className="grid grid-cols-2 gap-6 w-full">
          {/* iOS QR Code */}
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                "p-4 rounded-2xl border w-full aspect-square flex items-center justify-center bg-white",
                isDark ? "border-zinc-700" : "border-zinc-200"
              )}
            >
              <img
                src={qrCodeApple}
                alt="App Store QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <img
                src={isDark ? appleDark : appleLight}
                alt="Apple"
                className="w-5 h-5 object-contain"
              />
              <span
                className={cn(
                  "text-sm font-semibold",
                  isDark ? "text-zinc-300" : "text-zinc-700"
                )}
              >
                iOS
              </span>
            </div>
            <a
              href="https://apps.apple.com/us/app/integri/id6737592364"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-xs underline",
                isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
              )}
            >
              Download on App Store
            </a>
          </div>

          {/* Android QR Code */}
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                "p-4 rounded-2xl border w-full aspect-square flex items-center justify-center bg-white",
                isDark ? "border-zinc-700" : "border-zinc-200"
              )}
            >
              <img
                src={qrCodeAndroid}
                alt="Play Store QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <img
                src={playstore}
                alt="Android"
                className="w-5 h-5 object-contain"
              />
              <span
                className={cn(
                  "text-sm font-semibold",
                  isDark ? "text-zinc-300" : "text-zinc-700"
                )}
              >
                Android
              </span>
            </div>
            <a
              href="https://play.google.com/store/apps/details?id=com.integri.integri&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-xs underline",
                isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
              )}
            >
              Download on Play Store
            </a>
          </div>
        </div>

        {/* Ready to Log In Button */}
        <Link
          to="/login"
          className={cn(
            "w-full py-4 px-6 rounded-xl font-semibold text-center transition-all transform active:scale-[0.98] flex items-center justify-center gap-2",
            isDark
              ? "bg-white text-black hover:bg-zinc-200"
              : "bg-black text-white hover:bg-zinc-800"
          )}
        >
          Ready to Log In? Click Here!
          <ArrowRight size={18} />
        </Link>
      </div>
    </AuthLayout>
  );
};

export default SignupQRPage;
