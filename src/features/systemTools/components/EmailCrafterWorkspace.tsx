import React, { useState } from "react";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";
import Button from "../../../Components/ui/Button";
import { useAppSelector } from "../../../hooks/useRedux";
import { SystemToolsService } from "../../../api/backendApi";
import type { EmailCrafterResponse } from "../../../api/backendApi";

const getCountryCode = (countryName: string): string => {
  const norm = countryName.trim().toLowerCase();
  if (norm.includes("united states") || norm.includes("usa")) return "US";
  if (norm.includes("united kingdom") || norm === "uk" || norm === "gb" || norm.includes("britain")) return "GB";
  if (norm.includes("germany") || norm === "de") return "DE";
  if (norm.includes("france") || norm === "fr") return "FR";
  if (norm.includes("pakistan") || norm === "pk") return "PK";
  if (norm.includes("canada") || norm === "ca") return "CA";
  if (norm.includes("australia") || norm === "au") return "AU";
  if (norm.includes("india") || norm === "in") return "IN";
  if (norm.includes("spain") || norm === "es") return "ES";
  if (norm.includes("italy") || norm === "it") return "IT";
  return "US";
};

const EmailCrafterWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useAppSelector((state: any) => state.theme);
  const token = useAppSelector((state: any) => state.auth.accessToken);

  const [instructions, setInstructions] = useState("");
  const [country, setCountry] = useState("United States");
  const [languageCode, setLanguageCode] = useState("en");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EmailCrafterResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructions.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Karachi";
      const country_code = getCountryCode(country);
      const data = await SystemToolsService.craftEmail(token || "", {
        instructions,
        country,
        language_code: languageCode,
        country_code,
        timezone,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to craft email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "h-full w-full flex flex-col overflow-hidden",
        isDark ? "bg-[#07060A] text-white" : "bg-gray-50 text-gray-900"
      )}
    >
      {/* Header */}
      <div className={cn(
        "shrink-0 p-4 border-b flex items-center gap-4",
        isDark ? "border-white/5 bg-[#07060A]" : "border-gray-200 bg-white"
      )}>
        <button
          onClick={() => navigate("/agents")}
          className={cn(
            "p-2 rounded-lg transition-colors",
            isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
          )}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-lg">Email Crafter</h1>
          <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
            System Tool: GPT-4o-Mini
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "flex flex-col rounded-2xl border p-6 h-[800px] lg:h-auto",
              isDark ? "bg-[#07060A] border-white/5" : "bg-white border-gray-200 shadow-sm"
            )}
          >
            <h2 className="font-semibold mb-6">Input Configuration</h2>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-5">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-medium">Instructions</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Write a cold outreach email to a potential client about our new AI product."
                  className={cn(
                    "flex-1 p-4 rounded-xl border resize-none focus:ring-2 focus:ring-blue-500/50 outline-none transition-all",
                    isDark
                      ? "bg-black border-white/10 placeholder-gray-600 text-gray-200 focus:bg-[#18161C]"
                      : "bg-gray-50 border-gray-200 placeholder-gray-400 text-gray-800 focus:bg-white"
                  )}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Target Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={cn(
                      "p-3 rounded-xl border focus:ring-2 focus:ring-blue-500/50 outline-none transition-all",
                      isDark
                        ? "bg-black border-white/10 text-gray-200 focus:bg-[#18161C]"
                        : "bg-gray-50 border-gray-200 text-gray-800 focus:bg-white"
                    )}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Language Code</label>
                  <input
                    type="text"
                    value={languageCode}
                    onChange={(e) => setLanguageCode(e.target.value)}
                    placeholder="e.g. en, es, fr"
                    className={cn(
                      "p-3 rounded-xl border focus:ring-2 focus:ring-blue-500/50 outline-none transition-all",
                      isDark
                        ? "bg-black border-white/10 text-gray-200 focus:bg-[#18161C]"
                        : "bg-gray-50 border-gray-200 text-gray-800 focus:bg-white"
                    )}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 mt-auto"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {isLoading ? "Crafting..." : "Generate Email"}
              </Button>
            </form>
          </motion.div>

          {/* Output Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "flex flex-col rounded-2xl border p-6 min-h-[600px] lg:min-h-0",
              isDark ? "bg-[#07060A] border-white/5" : "bg-white border-gray-200 shadow-sm"
            )}
          >
            <h2 className="font-semibold mb-6">Generated Output</h2>
            
            {result ? (
              <div className="flex flex-col gap-6 flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase tracking-wider font-bold text-blue-500">
                    Localized Subject / Title
                  </label>
                  <div className={cn(
                    "p-4 rounded-xl border",
                    isDark ? "bg-black border-white/5" : "bg-gray-50 border-gray-200"
                  )}>
                    <p className="font-medium">{result.title}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-xs uppercase tracking-wider font-bold text-blue-500">
                    Localized Body
                  </label>
                  <div className={cn(
                    "p-4 rounded-xl border flex-1 whitespace-pre-wrap",
                    isDark ? "bg-black border-white/5" : "bg-gray-50 border-gray-200"
                  )}>
                    {result.email_body}
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-xs uppercase tracking-wider font-bold text-purple-500">
                    Translated Body (Base)
                  </label>
                  <div className={cn(
                    "p-4 rounded-xl border flex-1 whitespace-pre-wrap",
                    isDark ? "bg-black border-white/5" : "bg-gray-50 border-gray-200"
                  )}>
                    {result.translated_body}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 opacity-50">
                <Send size={48} className="mb-4 text-gray-400" />
                <p>Provide instructions and generate an email.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EmailCrafterWorkspace;
