import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, MapPin, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { completeOnboarding } from "../features/auth/slices/authSlice";
import { AuthService } from "../features/auth/services/authService";
import { cn } from "../lib/utils";
import { COUNTRIES, LANGUAGES } from "../../Constants"; 

const GettingStarted: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // State now stores CODES (e.g., 'US', 'en')
  const [formData, setFormData] = useState({
    countryCode: "",
    languageCode: "",
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);

  // --- 1. Smart Geo-Detection (Mount) ---
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const response = await fetch("https://ipwho.is/");
        const data = await response.json();

        if (data && data.success) {
          // Attempt to match by code first (more reliable), then name
          const matchedCountry =
            COUNTRIES.find((c) => c.code === data.country_code) ||
            COUNTRIES.find((c) => c.name === data.country);

          if (matchedCountry) {
            setFormData((prev) => ({
              ...prev,
              countryCode: matchedCountry.code,
              // Default to English if language isn't set, or add logic to map region to language
              languageCode: prev.languageCode || "en",
            }));
          } else {
            // Fallback
            setFormData({ countryCode: "US", languageCode: "en" });
          }
        } else {
          setFormData({ countryCode: "US", languageCode: "en" });
        }
      } catch (err) {
        setFormData({ countryCode: "US", languageCode: "en" });
      } finally {
        setIsLoadingLocation(false);
      }
    };
    detectLocation();
  }, []);

  // --- 2. GSAP Entrance ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(bgImageRef.current, {
        scale: 1.1,
        opacity: 0,
        duration: 1.5,
        ease: "power2.out",
      })
        .from(containerRef.current, { opacity: 0, duration: 0.8 }, "-=1")
        .from(
          contentRef.current,
          { y: 60, opacity: 0, duration: 1, ease: "power3.out" },
          "-=0.5"
        );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // --- 3. Mouse Effect ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // --- Handler ---
  const handleCompleteSetup = async () => {
    if (!formData.countryCode || !formData.languageCode) return;

    setIsSubmitting(true);
    try {
      if (user?.id) {
        // We are sending CODES to the backend
        await AuthService.completeOnboarding(user.id, {
          country: formData.countryCode, // Sends 'US', 'DE', etc.
          language: formData.languageCode, // Sends 'en', 'de', etc.
          email: user.email || "",
          name: user.name || "",
        });
      }
      dispatch(completeOnboarding());
      navigate("/");
    } catch (error) {
      console.error("Onboarding Error", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full bg-black overflow-hidden flex items-center justify-center font-sans text-white"
    >
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img
          ref={bgImageRef}
          src="/gettingStarted.png"
          alt="Background"
          className="absolute inset-1 w-full h-full object-cover opacity-60"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1620641788421-7f1c338e61a9?q=80&w=2070";
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-transparent to-black/80" />
        <div
          className="absolute inset-0 z-10 opacity-40 transition-opacity duration-500"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.15), transparent 40%)`,
          }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="relative z-20 w-full max-w-7xl px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Hero Text */}
        <div ref={contentRef} className="max-w-2xl text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800 backdrop-blur-md"
          >
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-xs font-medium text-zinc-300 tracking-wider uppercase">
              Integri AI 
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight">
            The Future of Chat <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500">
              Is Here
            </span>
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-lg leading-relaxed font-light">
            Finalize your profile to unlock the potential of next-gen
            conversational AI.
          </p>
        </div>

        {/* Right: Onboarding Form (Gatekeeper) */}
        <div className="flex justify-center lg:justify-end">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1 }}
              className="w-full max-w-md bg-zinc-950/70 border border-zinc-800/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Welcome Aboard
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    {isLoadingLocation
                      ? "Identifying your region..."
                      : "Confirm your region settings."}
                  </p>
                </div>

                {isLoadingLocation ? (
                  <div className="flex justify-center py-8">
                    <Loader2
                      className="animate-spin text-indigo-500"
                      size={32}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Country Selector */}
                    <div className="space-y-2 group">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Region
                      </label>
                      <div className="relative">
                        <MapPin
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                          size={18}
                        />
                        <select
                          title="country"
                          value={formData.countryCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              countryCode: e.target.value,
                            })
                          }
                          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3.5 pl-11 pr-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer hover:bg-zinc-900"
                        >
                          <option value="" disabled>
                            Select Country
                          </option>
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.name}>
                              {/* SHIFT TO SEND COUNTRY NAME TO THE BACKEND FIREBASE */}
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Language Selector */}
                    <div className="space-y-2 group">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Language
                      </label>
                      <div className="relative">
                        <Globe
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                          size={18}
                        />
                        <select
                          title="language"
                          value={formData.languageCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              languageCode: e.target.value,
                            })
                          }
                          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3.5 pl-11 pr-4 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer hover:bg-zinc-900"
                        >
                          <option value="" disabled>
                            Select Language
                          </option>
                          {LANGUAGES.map((l) => (
                            <option key={l.code} value={l.code}>
                              {l.flag} {l.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCompleteSetup}
                      disabled={isSubmitting}
                      className={cn(
                        "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all duration-300 mt-4",
                        "bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 cursor-pointer"
                      )}
                    >
                      {isSubmitting ? (
                        <span className="animate-pulse">Finalizing...</span>
                      ) : (
                        <>
                          Get Started <CheckCircle2 size={20} />
                        </>
                      )}
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default GettingStarted;
