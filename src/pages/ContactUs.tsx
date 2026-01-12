import React, { useState, useRef, useLayoutEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import {
  Mail,
  User,
  MessageSquare,
  Paperclip,
  Loader2,
  CheckCircle,
  Github,
  Twitter,
  Linkedin,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../lib/utils";
import ParticleBackground from "../Components/ui/ParticleBackground";


// Register GSAP
gsap.registerPlugin(ScrollTrigger);

// --- 1. MAGNETIC BUTTON COMPONENT ---
const MagneticButton = ({ children, onClick, disabled, className }: any) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current!.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((clientX - centerX) * 0.3); // Magnetic pull strength
    y.set((clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: mouseX, y: mouseY }}
      className={className}
    >
      {children}
    </motion.button>
  );
};

// --- 2. ANIMATED TEXT REVEAL ---
const RevealText = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  const letters = Array.from(text);
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.04 * i },
    }),
  };
  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
    hidden: { opacity: 0, y: 20 },
  };

  return (
    <motion.h1
      variants={container}
      initial="hidden"
      animate="visible"
      className={cn("flex flex-wrap justify-center", className)}
    >
      {letters.map((letter, index) => (
        <motion.span variants={child as any} key={index} className="whitespace-pre">
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.h1>
  );
};

// --- 3. ANIMATED "AURORA" VISUAL ---
const AbstractAurora = ({ isDark }: { isDark: boolean }) => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-zinc-900">
      <div
        className={cn(
          "absolute inset-0 z-0",
          isDark ? "bg-[#09090b]" : "bg-zinc-100"
        )}
      />
      {/* Animated Blobs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-zinc-600/30 blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-purple-600/20 blur-[100px]"
      />
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 mix-blend-overlay" />
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/globeAnimation.mp4" type="video/mp4" />
      </video>
    </div>
  );
};

// --- 4. 3D TILT CONTAINER ---
const TiltCard = ({
  children,
  isDark,
}: {
  children: React.ReactNode;
  isDark: boolean;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["2deg", "-2deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-2deg", "2deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;
    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={cn(
        "relative w-full max-w-6xl mx-auto rounded-4xl overflow-hidden transition-all duration-500",
        isDark
          ? "shadow-[0_0_50px_-12px_rgba(0,0,0,0.7)] border border-zinc-800"
          : "shadow-2xl border border-zinc-200"
      )}
    >
      {children}
    </motion.div>
  );
};

// --- 5. CUSTOM BOX INPUT ---
const BoxInput = ({
  label,
  value,
  onChange,
  icon: Icon,
  type = "text",
  textarea = false,
  isDark,
  placeholder,
  ...props
}: any) => {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={cn(
        "relative group rounded-xl px-4 py-3 transition-all duration-300 border",
        isDark
          ? "bg-[#27272a] border-zinc-700/50"
          : "bg-zinc-50 border-zinc-200",
        focused
          ? "border-zinc-500! ring-1 ring-zinc-500/20"
          : "hover:border-zinc-500/50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <label
            className={cn(
              "block text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors",
              isDark ? "text-zinc-500" : "text-zinc-500",
              focused && "text-zinc-500"
            )}
          >
            {label}
          </label>
          {textarea ? (
            <textarea
              {...props}
              value={value}
              onChange={onChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              rows={4}
              placeholder={placeholder}
              className={cn(
                "w-full bg-transparent outline-none resize-none font-medium text-sm placeholder-zinc-500/50",
                isDark ? "text-zinc-100" : "text-zinc-900"
              )}
            />
          ) : (
            <input
              {...props}
              type={type}
              value={value}
              onChange={onChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={placeholder}
              className={cn(
                "w-full bg-transparent outline-none font-medium text-sm placeholder-zinc-500/50",
                isDark ? "text-zinc-100" : "text-zinc-900"
              )}
            />
          )}
        </div>
        {Icon && (
          <div
            className={cn("mt-2", isDark ? "text-zinc-500" : "text-zinc-400")}
          >
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
};

// --- 6. MAIN CONTACT PAGE ---
const ContactUs: React.FC = () => {
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const handleChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Scale-in animation for the main card
      gsap.from(".main-card", {
        y: 100,
        opacity: 0,
        scale: 0.9,
        duration: 1.2,
        ease: "power4.out",
        delay: 0.5,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 4000);
      setFormData({ firstName: "", lastName: "", email: "", message: "" });
    }, 2000);
  };

  return (
    // FIX FOR SCROLLING: Use h-full + overflow-y-auto instead of h-screen
    <div
      ref={containerRef}
      className={cn(
        "h-full w-full overflow-y-auto overflow-x-hidden relative font-sans selection:bg-zinc-500/30",
        isDark ? "bg-[#09090b] text-zinc-100" : "bg-zinc-50 text-zinc-900"
      )}
    >
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <ParticleBackground />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center">
        {/* Animated Header */}
        <div className="text-center mb-16 space-y-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border",
              isDark
                ? "bg-zinc-900 border-zinc-800 text-zinc-400"
                : "bg-white border-zinc-200 text-zinc-600"
            )}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500"></span>
            </span>
            Ready to help anytime.
          </motion.div>

          <RevealText
            text="Let's Start a Conversation."
            className="text-4xl md:text-5xl font-bold tracking-tight"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className={cn(
              "text-lg",
              isDark ? "text-zinc-400" : "text-zinc-500"
            )}
          >
            Providing best AI support to our clients.
          </motion.p>
        </div>

        {/* --- MAIN SPLIT CARD --- */}
        <div className="main-card w-full perspective-1000 mb-20">
          <TiltCard isDark={isDark}>
            <div
              className={cn(
                "flex flex-col lg:flex-row min-h-[650px] relative bg-transparent",
                
              )}
            >
              <ParticleBackground/>
              {/* === LEFT: FORM === */}
              <div className="flex-1 p-8 lg:p-14 flex flex-col justify-center relative z-20">
                <div className="mb-10">
                  <h2 className="text-3xl font-bold mb-2">Get in touch</h2>
                  <p
                    className={cn(
                      "text-sm",
                      isDark ? "text-zinc-400" : "text-zinc-500"
                    )}
                  >
                    Or email us directly at{" "}
                    <span className="text-zinc-500 font-medium cursor-pointer hover:underline">
                      info@integri.app
                    </span>
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <BoxInput
                      isDark={isDark}
                      label="First Name"
                      placeholder="Jane"
                      value={formData.firstName}
                      onChange={(e: any) =>
                        handleChange("firstName", e.target.value)
                      }
                      icon={User}
                    />
                    <BoxInput
                      isDark={isDark}
                      label="Last Name"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e: any) =>
                        handleChange("lastName", e.target.value)
                      }
                      icon={User}
                    />
                  </div>

                  <BoxInput
                    isDark={isDark}
                    label="Email Address"
                    type="email"
                    placeholder="jane@company.com"
                    value={formData.email}
                    onChange={(e: any) => handleChange("email", e.target.value)}
                    icon={Mail}
                  />

                  <BoxInput
                    isDark={isDark}
                    label="Tell us about it"
                    textarea
                    placeholder="I'm interested in integrating AI reasoning into..."
                    value={formData.message}
                    onChange={(e: any) =>
                      handleChange("message", e.target.value)
                    }
                    icon={MessageSquare}
                  />

                  <div className="pt-2 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      className={cn(
                        "flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg transition-colors group hover:cursor-pointer",
                        isDark
                          ? "text-zinc-400 hover:text-white hover:bg-zinc-800"
                          : "text-zinc-500 hover:text-black hover:bg-zinc-100"
                      )}
                    >
                      <Paperclip
                        size={14}
                        className="group-hover:text-zinc-500 transition-colors"
                      />
                      <span className="hover:cursor-pointer">Attach file</span>
                    </button>

                    {/* Magnetic Button Wrapper */}
                    <MagneticButton
                      type="submit"
                      disabled={isSubmitting || isSuccess}
                      className={cn(
                        "px-8 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:shadow-zinc-500/20 hover:cursor-pointer",
                        isSuccess
                          ? "bg-green-500 text-white"
                          : "bg-zinc-600 hover:bg-zinc-700 text-white"
                      )}
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : isSuccess ? (
                        <>
                          Sent <CheckCircle size={16} />
                        </>
                      ) : (
                        <>
                          Send Message <ArrowUpRight size={16} />
                        </>
                      )}
                    </MagneticButton>
                  </div>
                </form>
              </div>

              {/* === RIGHT: ABSTRACT VISUAL & WAVE === */}
              <div className="hidden lg:block relative w-[45%] overflow-hidden">
                <AbstractAurora isDark={isDark} />

                {/* THE ORGANIC WAVE SEPARATOR */}
                <div
                  className={cn(
                    "absolute top-0 bottom-0 -left-px z-20 w-20 h-full pointer-events-none",
                    isDark ? "text-[#18181b]" : "text-white"
                  )}
                >
                  
                  <svg
                    viewBox="0 0 100 800"
                    preserveAspectRatio="none"
                    className="w-full h-full fill-current"
                  >
                    <path d="M0,0 C30,150 80,300 50,400 C20,500 40,650 0,800 Z" />
                  </svg>
                </div>

                {/* Overlay Content */}
                <div className="absolute inset-0 z-30 flex flex-col justify-end p-10 text-white">
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="p-6 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-zinc-400 to-cyan-300 flex items-center justify-center text-black font-bold text-xs">
                          AI
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            Integri Support
                          </p>
                          <p className="text-xs text-white/60">Global Team</p>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-white/90">
                        "We empower developers to build smarter systems. Whether
                        you have a technical question or a partnership idea, our
                        team is ready to listen."
                      </p>
                    </motion.div>

                    <div className="flex gap-3 justify-end">
                      {[Twitter, Github, Linkedin].map((Icon, i) => (
                        <motion.a
                          key={i}
                          href="#"
                          whileHover={{ scale: 1.1, y: -2 }}
                          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all"
                        >
                          <Icon size={16} />
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TiltCard>
        </div>

        {/* Bottom Contacts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl text-center pb-10">
          {[
            { icon: Mail, label: "Email", val: "info@integri.app" },
            { icon: MapPin, label: "Office", val: "San Francisco, CA" },
            { icon: User, label: "Support", val: "+1 (555) 012-3456" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              viewport={{ once: true }}
              className={cn(
                "p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-lg",
                isDark
                  ? "bg-zinc-900/50 border-zinc-800"
                  : "bg-white border-zinc-200"
              )}
            >
              <div className="w-10 h-10 mx-auto rounded-full bg-zinc-500/10 text-zinc-500 flex items-center justify-center mb-3">
                <item.icon size={20} />
              </div>
              <h3
                className={cn(
                  "font-bold text-sm",
                  isDark ? "text-zinc-200" : "text-zinc-800"
                )}
              >
                {item.label}
              </h3>
              <p
                className={cn(
                  "text-xs mt-1",
                  isDark ? "text-zinc-500" : "text-zinc-500"
                )}
              >
                {item.val}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
