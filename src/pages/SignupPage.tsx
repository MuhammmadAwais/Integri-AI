import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Chrome,
  Phone,
  Globe,
  MapPin,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import {
  registerUser,
  loginWithGoogle,
} from "../features/auth/thunks/authThunk";
import AuthLayout from "../Components/layout/AuthLayout";
import AuthInput from "../features/auth/components/AuthInput";
import AuthButton from "../features/auth/components/AuthButton";
import { cn } from "../lib/utils";

// --- Configuration Data ---
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

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    country: "",
    language: "",
    countryCode: "+1", // Default
  });
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  // --- 1. Automated Geo-Detection ---
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
            setFormData((prev) => ({
              ...prev,
              country: matchedCountry.name,
              countryCode: matchedCountry.dial,
              language: matchedCountry.lang,
            }));
          }
        }
      } catch (err) {
        console.warn("Geo-detection failed, falling back to defaults.");
      }
    };
    detectLocation();
  }, []);

  // --- Handlers ---
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = COUNTRIES.find((c) => c.name === e.target.value);
    setFormData((prev) => ({
      ...prev,
      country: e.target.value,
      countryCode: selectedCountry ? selectedCountry.dial : prev.countryCode,
      language: selectedCountry ? selectedCountry.lang : prev.language,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return;
    }

    // Combine Code + Number for full phone (Optional)
    const fullPhone = formData.phoneNumber
      ? `${formData.countryCode}${formData.phoneNumber}`
      : "";

    const result = await dispatch(
      registerUser({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        // Passing new fields to Thunk (ensure Thunk accepts them)
        // @ts-ignore
        country: formData.country,
        language: formData.language,
        phoneNumber: fullPhone,
      })
    );

    if (registerUser.fulfilled.match(result)) {
      navigate("/getting-started");
    }
  };

  const handleGoogleLogin = async () => {
    const result = await dispatch(loginWithGoogle());
    if (loginWithGoogle.fulfilled.match(result)) {
      // Logic handled in App.tsx or GettingStarted based on isNewUser flag
      navigate("/getting-started");
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join Integri AI to start building the future."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Full Name"
          type="text"
          placeholder="John Doe"
          icon={User}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <AuthInput
          label="Email"
          type="email"
          placeholder="name@example.com"
          icon={Mail}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        {/* --- Country & Language Row --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 group">
            <label className="text-sm font-medium text-gray-400 group-focus-within:text-white ml-1">
              Country
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10 pointer-events-none">
                <MapPin size={20} />
              </div>
              <select
                value={formData.country}
                onChange={handleCountryChange}
                required
                className={cn(
                  "w-full bg-[#27272A] border border-[#3F3F46] rounded-xl py-2 pl-12 pr-4 text-white placeholder-gray-500 appearance-none cursor-pointer",
                  "focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-[#303035]",
                  "transition-all duration-200 ease-out"
                )}
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

          <div className="space-y-2 group">
            <label className="text-sm font-medium text-gray-400 group-focus-within:text-white ml-1">
              Language
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10 pointer-events-none">
                <Globe size={20} />
              </div>
              <select
                value={formData.language}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
                required
                className={cn(
                  "w-full bg-[#27272A] border border-[#3F3F46] rounded-xl py-2 pl-12 pr-4 text-white placeholder-gray-500 appearance-none cursor-pointer",
                  "focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-[#303035]",
                  "transition-all duration-200 ease-out"
                )}
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

        {/* --- Phone Number with Code --- */}
        <div className="space-y-2 group">
          <label className="text-sm font-medium text-gray-400 group-focus-within:text-white ml-1">
            Phone Number (Optional)
          </label>
          <div className="flex gap-2">
            {/* Read-only code display (synced with Country) */}
            <div className="w-24 bg-[#27272A] border border-[#3F3F46] rounded-xl flex items-center justify-center text-gray-300 select-none">
              {formData.countryCode}
            </div>
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10 pointer-events-none">
                <Phone size={20} />
              </div>
              <input
                type="tel"
                placeholder="300 1234567"
                className={cn(
                  "w-full bg-[#27272A] border border-[#3F3F46] rounded-xl py-2 pl-12 pr-4 text-white placeholder-gray-500",
                  "focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-[#303035]",
                  "transition-all duration-200 ease-out"
                )}
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <AuthInput
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
        <AuthInput
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          required
        />

        {error ||
          (confirmPasswordError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl text-center">
              {error || confirmPasswordError}
            </div>
          ))}

        <div className="flex flex-row gap-4 mt-4">
          <AuthButton
            isLoading={isLoading}
            variant="createAccount"
            className="hover:cursor-pointer flex-1"
          >
            Create Account <ArrowRight size={18} />
          </AuthButton>

          <AuthButton
            type="button"
            variant="google"
            className="hover:cursor-pointer px-6"
            onClick={handleGoogleLogin}
          >
            <Chrome size={18} className="text-white" />
          </AuthButton>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-red-500 hover:text-red-400 font-semibold transition-colors hover:cursor-pointer"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Signup;
