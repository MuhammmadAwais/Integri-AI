import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Send, Star, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../app/firebase"; // Ensure correct path
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../lib/utils";
import Button from "../Components/ui/Button";
import ParticleBackground from "../Components/ui/ParticleBackground";

const CATEGORIES = [
  "Bug Report",
  "Feature Request",
  "General Feedback",
  "Billing",
];

const SendFeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useAppSelector((state: any) => state.theme);
  const user = useAppSelector((state: any) => state.auth.user);

  const [category, setCategory] = useState("General Feedback");
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.warn("Please enter a message.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate or Real Firestore Submission
      if (db) {
        await addDoc(collection(db, "feedback"), {
          userId: user?.id || "anonymous",
          userEmail: user?.email || "anonymous",
          category,
          rating,
          message,
          timestamp: new Date().toISOString(),
        });
      }

      toast.success("Feedback sent! Thank you.", {
        theme: isDark ? "dark" : "light",
      });
      setTimeout(() => navigate("/settings"), 1500);
    } catch (error) {
      console.error("Feedback error", error);
      toast.error("Failed to send feedback.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "h-full w-full overflow-y-auto custom-scrollbar p-4 md:p-8 lg:p-12",
        isDark ? "bg-[#09090b] text-white" : "bg-gray-50 text-gray-900"
      )}
    >
      <ParticleBackground />
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            title="button"
            onClick={() => navigate(-1)}
            className={cn(
              "p-2 rounded-full transition-colors",
              isDark ? "hover:bg-[#1a1a1a]" : "hover:bg-gray-200"
            )}
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold tracking-tight">Send Feedback</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-2xl border p-8 shadow-sm",
            isDark
              ? "bg-[#18181b] border-[#27272a]"
              : "bg-white border-gray-200"
          )}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className={cn(
                "p-3 rounded-xl",
                isDark
                  ? "bg-purple-500/10 text-purple-400"
                  : "bg-purple-50 text-purple-600"
              )}
            >
              <MessageSquare className="text-[#a9a9a9]" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">We value your opinion</h2>
              <p
                className={cn(
                  "text-sm",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}
              >
                Help us improve Integri AI by sharing your thoughts.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label
                className={cn(
                  "block text-sm font-medium mb-3",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}
              >
                Rate your experience
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    title="button"
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className={cn(
                      "p-1 transition-transform hover:scale-110 hover:cursor-pointer",
                      rating >= star
                        ? "text-yellow-400"
                        : isDark
                        ? "text-gray-700"
                        : "text-gray-300"
                    )}
                  >
                    <Star
                      size={32}
                      fill={rating >= star ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label
                className={cn(
                  "block text-sm font-medium mb-3",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}
              >
                Topic
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium border transition-all hover:cursor-pointer",
                      category === cat
                        ? isDark
                          ? "bg-white text-black border-white"
                          : "bg-black text-white border-black"
                        : isDark
                        ? "bg-transparent border-[#333] text-gray-400 hover:border-gray-500"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label
                className={cn(
                  "block text-sm font-medium mb-2",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}
              >
                Your Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Tell us what you like, or what we can improve..."
                className={cn(
                  "w-full px-4 py-3 rounded-xl border outline-none resize-none transition-all",
                  isDark
                    ? "bg-[#222] border-[#333] focus:border-purple-500 text-white placeholder:text-gray-600"
                    : "bg-gray-50 border-gray-200 focus:border-purple-500 text-gray-900 placeholder:text-gray-400"
                )}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className=" bg-gray-700 hover:bg-gray-800 w-full sm:w-auto"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send size={18} className="mr-2" /> Send Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SendFeedbackPage;
