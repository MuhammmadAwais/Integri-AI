import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  MapPin,
  CheckCircle2,
  Sparkles,
  Loader2,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { completeOnboarding } from "../features/auth/slices/authSlice";
import { AuthService } from "../features/auth/services/authService";
import { cn } from "../lib/utils";
import { COUNTRIES, LANGUAGES } from "../../Constants";// Adjust path if needed

// --- HELPERS FOR CALENDAR ---
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();

const GettingStarted: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.auth);

  // --- FORM STATE ---
  const [formData, setFormData] = useState<{
    countryCode: string;
    languageCode: string;
    dateOfBirth: Date | null;
  }>({
    countryCode: "",
    languageCode: "",
    dateOfBirth: null,
  });

  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // --- CALENDAR STATE ---
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(2000, 0, 1)); // Default view to year 2000 for easier DOB selection
  const [calendarView, setCalendarView] = useState<"days" | "years">("days");

  // Positioning State for Portal
  const [coords, setCoords] = useState({ top: 0, left: 0, origin: "top" });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);

  // Specific Refs for Calendar Positioning
  const dateInputRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarGridRef = useRef<HTMLDivElement>(null);

  // --- 1. Smart Geo-Detection ---
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const response = await fetch("https://ipwho.is/");
        const data = await response.json();

        if (data && data.success) {
          const matchedCountry =
            COUNTRIES.find((c: any) => c.code === data.country_code) ||
            COUNTRIES.find((c: any) => c.name === data.country);

          if (matchedCountry) {
            setFormData((prev) => ({
              ...prev,
              countryCode: matchedCountry.code,
              languageCode: prev.languageCode || "en",
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              countryCode: "US",
              languageCode: "en",
            }));
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            countryCode: "US",
            languageCode: "en",
          }));
        }
      } catch (err) {
        setFormData((prev) => ({
          ...prev,
          countryCode: "US",
          languageCode: "en",
        }));
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

  // --- 3. GSAP Calendar Internal Animation ---
  // Triggers whenever the view (days vs years) or the month changes while open
  useEffect(() => {
    if (showCalendar && calendarGridRef.current) {
      gsap.fromTo(
        calendarGridRef.current.children,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.015, ease: "power2.out" }
      );
    }
  }, [showCalendar, viewDate, calendarView]);

  // --- 4. Mouse Effect ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // --- 5. Positioning Logic & Outside Click ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If click is on trigger input OR inside calendar portal, ignore
      if (
        dateInputRef.current &&
        dateInputRef.current.contains(event.target as Node)
      )
        return;

      if (
        calendarRef.current &&
        calendarRef.current.contains(event.target as Node)
      )
        return;

      setShowCalendar(false);
      setCalendarView("days");
    };

    const updatePosition = () => {
      if (showCalendar && dateInputRef.current) {
        const rect = dateInputRef.current.getBoundingClientRect();
        const CALENDAR_HEIGHT = 320; // Approx max height
        const GAP = 8;

        let top = rect.bottom + GAP;
        let origin = "top";

        // Flip if not enough space below
        if (top + CALENDAR_HEIGHT > window.innerHeight) {
          top = rect.top - CALENDAR_HEIGHT - GAP;
          origin = "bottom";
        }

        setCoords({
          top: top + window.scrollY, // Account for scroll
          left: rect.left + window.scrollX,
          origin,
        });
      }
    };

    if (showCalendar) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  // --- HANDLERS ---
  const handleCompleteSetup = async () => {
    if (
      !formData.countryCode ||
      !formData.languageCode ||
      !formData.dateOfBirth
    )
      return;

    setIsSubmitting(true);
    try {
      if (user?.id) {
        await AuthService.completeOnboarding(user.id, {
          country: formData.countryCode,
          language: formData.languageCode,
          dateOfBirth: formData.dateOfBirth,
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

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
  };

  const selectDate = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setFormData({ ...formData, dateOfBirth: newDate });
    setShowCalendar(false);
  };

  const selectYear = (year: number) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(year);
    setViewDate(newDate);
    setCalendarView("days");
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(
      viewDate.getFullYear(),
      viewDate.getMonth()
    );
    const firstDay = getFirstDayOfMonth(
      viewDate.getFullYear(),
      viewDate.getMonth()
    );
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(
        viewDate.getFullYear(),
        viewDate.getMonth(),
        i
      );
      const isSelected =
        formData.dateOfBirth &&
        currentDate.toDateString() === formData.dateOfBirth.toDateString();
      const isToday = new Date().toDateString() === currentDate.toDateString();

      days.push(
        <button
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            selectDate(i);
          }}
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all hover:cursor-pointer",
            isSelected
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 font-bold"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300",
            isToday &&
              !isSelected &&
              "text-indigo-500 font-bold border border-indigo-500/30"
          )}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  const renderYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear; y >= currentYear - 100; y--) {
      years.push(
        <button
          key={y}
          onClick={(e) => {
            e.stopPropagation();
            selectYear(y);
          }}
          className={cn(
            "py-2 px-4 rounded-lg text-sm transition-all border border-transparent hover:cursor-pointer",
            viewDate.getFullYear() === y
              ? "bg-indigo-600 text-white font-bold"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
          )}
        >
          {y}
        </button>
      );
    }
    return years;
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

        {/* Right: Onboarding Form */}
        <div className="flex justify-center lg:justify-end">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1 }}
              className="w-full max-w-md bg-zinc-950/70 border border-zinc-800/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative"
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
                    {/* 1. Country Selector */}
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
                          {COUNTRIES.map((c: any) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 2. Language Selector */}
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
                          {LANGUAGES.map((l: any) => (
                            <option key={l.code} value={l.code}>
                              {l.flag} {l.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 3. Custom Date of Birth Trigger */}
                    <div className="space-y-2 group">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Date of Birth
                      </label>

                      <div
                        ref={dateInputRef}
                        onClick={() => {
                          if (!showCalendar) setShowCalendar(true);
                        }}
                        className={cn(
                          "relative w-full bg-zinc-900/50 border rounded-xl py-3.5 pl-11 pr-4 text-white cursor-pointer transition-all hover:bg-zinc-900 select-none",
                          showCalendar
                            ? "border-indigo-500 ring-2 ring-indigo-500/20"
                            : "border-zinc-800 hover:border-zinc-700"
                        )}
                      >
                        <CalendarIcon
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                          size={18}
                        />
                        <span
                          className={cn(
                            "text-sm",
                            !formData.dateOfBirth && "text-zinc-500"
                          )}
                        >
                          {formData.dateOfBirth
                            ? formData.dateOfBirth.toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "Select Date of Birth"}
                        </span>
                        <ChevronDown
                          size={16}
                          className={cn(
                            "absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-transform duration-200",
                            showCalendar && "rotate-180"
                          )}
                        />
                      </div>
                    </div>

                    {/* PORTAL: Calendar Dropdown */}
                    {createPortal(
                      <AnimatePresence>
                        {showCalendar && (
                          <motion.div
                            ref={calendarRef}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            style={{
                              position: "absolute",
                              top: coords.top,
                              left: coords.left,
                              width: dateInputRef.current?.offsetWidth || 300,
                              transformOrigin: coords.origin,
                            }}
                            className="z-9999 p-4 rounded-xl border border-zinc-700/50 bg-[#121212]/95 backdrop-blur-xl shadow-2xl"
                          >
                            {/* Calendar Header */}
                            <div className="flex items-center justify-between mb-4">
                              {calendarView === "days" && (
                                <button
                                title="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    changeMonth(-1);
                                  }}
                                  className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors hover:cursor-pointer"
                                >
                                  <ChevronLeft size={18} />
                                </button>
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCalendarView(
                                    calendarView === "days" ? "years" : "days"
                                  );
                                }}
                                className="font-semibold text-white hover:text-indigo-400 transition-colors flex items-center gap-1 mx-auto hover:cursor-pointer"
                              >
                                {MONTHS[viewDate.getMonth()]}{" "}
                                {viewDate.getFullYear()}
                                <ChevronDown
                                  size={14}
                                  className={cn(
                                    "opacity-50 transition-transform",
                                    calendarView === "years" && "rotate-180"
                                  )}
                                />
                              </button>

                              {calendarView === "days" && (
                                <button
                                title="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    changeMonth(1);
                                  }}
                                  className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors hover:cursor-pointer"
                                >
                                  <ChevronRight size={18} />
                                </button>
                              )}
                            </div>

                            {/* Calendar Body */}
                            <div ref={calendarGridRef}>
                              {calendarView === "days" ? (
                                <>
                                  <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                                    {DAYS.map((day) => (
                                      <div
                                        key={day}
                                        className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide"
                                      >
                                        {day}
                                      </div>
                                    ))}
                                  </div>
                                  <div className="grid grid-cols-7 gap-1 place-items-center">
                                    {renderCalendarDays()}
                                  </div>
                                </>
                              ) : (
                                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                                  {renderYears()}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>,
                      document.body
                    )}

                    {/* Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCompleteSetup}
                      disabled={isSubmitting || !formData.dateOfBirth}
                      className={cn(
                        "w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all duration-300 mt-4",
                        "bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 cursor-pointer",
                        (!formData.dateOfBirth || isSubmitting) &&
                          "opacity-50 cursor-not-allowed grayscale"
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
