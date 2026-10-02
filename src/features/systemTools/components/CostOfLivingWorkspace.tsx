import React, { useState } from "react";
import { ArrowLeft, Loader2, MapPin, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import Button from "../../../Components/ui/Button";
import { useAppSelector } from "../../../hooks/useRedux";
import { SystemToolsService } from "../../../api/backendApi";
import type { CostOfLivingResponse } from "../../../api/backendApi";

const CostOfLivingWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useAppSelector((state: any) => state.theme);
  const token = useAppSelector((state: any) => state.auth.accessToken);

  const [city1, setCity1] = useState("");
  const [city2, setCity2] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CostOfLivingResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city1.trim() || !city2.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Karachi";
      const data = await SystemToolsService.compareCostOfLiving(token || "", {
        city1: city1.trim(),
        city2: city2.trim(),
        language_code: "en",
        language_name: "English",
        timezone,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to compare cities");
    } finally {
      setIsLoading(false);
    }
  };

  const ComparisonRow = ({ label, val1, val2 }: { label: string; val1: any; val2: any }) => {
    const num1 = parseFloat(String(val1).replace(/[^\d.-]/g, "")) || 0;
    const num2 = parseFloat(String(val2).replace(/[^\d.-]/g, "")) || 0;
    const diff = num2 - num1;
    const isHigher = diff > 0;

    const lowerLabel = label.toLowerCase();
    const invertColor =
      lowerLabel.includes("purchasing") ||
      lowerLabel.includes("power") ||
      lowerLabel.includes("health") ||
      lowerLabel.includes("care") ||
      lowerLabel.includes("safety");

    let colorClass = "";
    if (diff !== 0) {
      if (invertColor) {
        colorClass = isHigher ? "text-emerald-500" : "text-red-500";
      } else {
        colorClass = isHigher ? "text-red-500" : "text-emerald-500";
      }
    }

    return (
      <div className={cn(
        "grid grid-cols-3 gap-4 py-3 px-4 border-b last:border-0 items-center text-sm",
        isDark ? "border-white/5" : "border-gray-100"
      )}>
        <div className="font-medium text-gray-500 dark:text-gray-400">{label}</div>
        <div className="font-semibold text-center">{String(val1)}</div>
        <div className="font-semibold text-center flex flex-col items-center">
          <span>{String(val2)}</span>
          {diff !== 0 && !isNaN(diff) && (
            <span className={cn("text-[10px] font-bold", colorClass)}>
              {isHigher ? "+" : ""}{diff.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    );
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
          <h1 className="font-bold text-lg">Cost of Living Comparator</h1>
          <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
            System Tool: GPT-4.1
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
              "flex flex-col rounded-2xl border p-6 h-[400px]",
              isDark ? "bg-[#07060A] border-white/5" : "bg-white border-gray-200 shadow-sm"
            )}
          >
            <h2 className="font-semibold mb-6">Select Cities</h2>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-6 justify-center">
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Base City (City 1)</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={city1}
                    onChange={(e) => setCity1(e.target.value)}
                    placeholder="e.g. New York, NY"
                    className={cn(
                      "w-full pl-10 p-3 rounded-xl border focus:ring-2 focus:ring-blue-500/50 outline-none transition-all",
                      isDark
                        ? "bg-black border-white/10 text-gray-200 focus:bg-[#18161C]"
                        : "bg-gray-50 border-gray-200 text-gray-800 focus:bg-white"
                    )}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Comparison City (City 2)</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={city2}
                    onChange={(e) => setCity2(e.target.value)}
                    placeholder="e.g. London, UK"
                    className={cn(
                      "w-full pl-10 p-3 rounded-xl border focus:ring-2 focus:ring-blue-500/50 outline-none transition-all",
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
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                {isLoading ? "Comparing..." : "Compare Cities"}
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
            <h2 className="font-semibold mb-6">Comparison Output</h2>
            
            <AnimatePresence mode="wait">
              {result && result.comparison ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-6 flex-1 overflow-y-auto custom-scrollbar"
                >
                  
                  {/* Table Header */}
                  <div className={cn(
                    "rounded-xl border overflow-hidden",
                    isDark ? "border-white/5 bg-black" : "border-gray-200 bg-white"
                  )}>
                    <div className={cn(
                      "grid grid-cols-3 gap-4 py-3 px-4 font-bold text-xs uppercase tracking-wider border-b",
                      isDark ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-200"
                    )}>
                      <div>Metric</div>
                      <div className="text-center">{city1}</div>
                      <div className="text-center">{city2}</div>
                    </div>
                    
                    {/* Dynamic Rows */}
                    <div className="flex flex-col">
                      {Object.entries(result.comparison).map(([category, cities]) => {
                        // Find matching values for city keys dynamically since strings are exact requested city names
                        const val1 = cities[city1] ?? cities[city1.trim()] ?? Object.values(cities)[0] ?? "-";
                        const val2 = cities[city2] ?? cities[city2.trim()] ?? Object.values(cities)[1] ?? "-";
                        return (
                          <ComparisonRow
                            key={category}
                            label={category}
                            val1={val1}
                            val2={val2}
                          />
                        );
                      })}
                    </div>
                  </div>

                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center flex-1 opacity-50"
                >
                  <Search size={48} className="mb-4 text-gray-400" />
                  <p>Enter two cities to compare their cost of living.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CostOfLivingWorkspace;
