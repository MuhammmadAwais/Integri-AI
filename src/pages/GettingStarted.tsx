import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { completeOnboarding } from "../features/auth/slices/authSlice";
import { AuthService } from "../features/auth/services/authService";
import { Globe, MapPin, ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";

// Reusing configuration from Signup
const COUNTRIES = [
  { name: "United States", code: "US", dial: "+1", lang: "English" },
  { name: "Germany", code: "DE", dial: "+49", lang: "German" },
  { name: "Pakistan", code: "PK", dial: "+92", lang: "Urdu" },
  { name: "United Kingdom", code: "GB", dial: "+44", lang: "English" },
  { name: "India", code: "IN", dial: "+91", lang: "Hindi" },
  { name: "Canada", code: "CA", dial: "+1", lang: "English" },
  { name: "Australia", code: "AU", dial: "+61", lang: "English" },
];

const LANGUAGES = [
  "English",
  "German",
  "Spanish",
  "French",
  "Urdu",
  "Hindi",
  "Arabic",
];

const GettingStarted: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isNewUser } = useAppSelector((state) => state.auth);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Form state for Google Auth users who need to complete profile
  const [onboardingData, setOnboardingData] = useState({
    country: "",
    language: "",
  });
  const [loadingLocation, setLoadingLocation] = useState(true);

  // --- Geo Detection ---
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        if (data && data.country_name) {
          const matchedCountry =
            COUNTRIES.find((c) => c.code === data.country_code) ||
            COUNTRIES.find((c) => c.name === data.country_name);

          if (matchedCountry) {
            setOnboardingData((prev) => ({
              ...prev,
              country: matchedCountry.name,
              language: matchedCountry.lang,
            }));
          }
        }
      } catch (err) {
        console.warn("Geo-detection failed.");
      } finally {
        setLoadingLocation(false);
      }
    };
    detectLocation();
  }, []);

  // --- Animation ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(containerRef.current, { opacity: 0, duration: 1 }).from(
        contentRef.current,
        {
          y: 100,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          delay: 0.2,
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleGetStarted = async () => {
    if (isNewUser) {
      // If mandatory fields are missing, don't proceed (basic validation)
      if (!onboardingData.country || !onboardingData.language) {
        alert("Please select your Country and Language to continue.");
        return;
      }

      // Call AuthService to create/update the Firestore doc
      if (user?.id) {
        await AuthService.completeOnboarding(user.id, {
          country: onboardingData.country,
          language: onboardingData.language,
          email: user.email || "",
          name: user.name || "",
        });
      }
    }

    // Update Redux state and Redirect
    dispatch(completeOnboarding());
    navigate("/");
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full bg-black overflow-hidden flex items-center justify-center p-6"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black opacity-50" />

      <div
        ref={contentRef}
        className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center"
      >
        {/* Header Content */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-300 tracking-wide uppercase">
            Integri AI v1.0
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
          {isNewUser ? "Complete Your Profile" : "The Future of Chat"} <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500">
            {isNewUser ? "One Last Step" : "Is Here"}
          </span>
        </h1>

        {/* --- CONDITIONAL RENDERING: Onboarding Form vs Standard Welcome --- */}
        {isNewUser ? (
          <div className="w-full max-w-md bg-[#18181B] border border-[#27272A] rounded-2xl p-6 shadow-2xl mb-8">
            <p className="text-gray-400 mb-6 text-sm">
              We detected your location to customize your experience. Please
              confirm your details below.
            </p>

            <div className="space-y-4 text-left">
              {/* Country Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">
                  Country
                </label>
                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  />
                  <select
                    value={onboardingData.country}
                    onChange={(e) =>
                      setOnboardingData({
                        ...onboardingData,
                        country: e.target.value,
                      })
                    }
                    className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl py-3 pl-10 pr-4 text-white appearance-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  >
                    <option value="" disabled>
                      Select Country
                    </option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Language Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">
                  Language
                </label>
                <div className="relative">
                  <Globe
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  />
                  <select
                    value={onboardingData.language}
                    onChange={(e) =>
                      setOnboardingData({
                        ...onboardingData,
                        language: e.target.value,
                      })
                    }
                    className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl py-3 pl-10 pr-4 text-white appearance-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  >
                    <option value="" disabled>
                      Select Language
                    </option>
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-300 mb-10 text-lg md:text-xl max-w-lg leading-relaxed font-light">
            Unlock the potential of next-gen conversational AI. Integrated
            seamlessly into your workflow for maximum productivity.
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:bg-indigo-700 hover:scale-105 hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all duration-300 flex items-center justify-center gap-2"
          >
            {isNewUser ? "Complete & Continue" : "Get Started"}
            <ArrowRight size={20} />
          </button>

          {!isNewUser && (
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 hover:border-white/40 transition-all duration-300"
            >
              Log In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GettingStarted;
