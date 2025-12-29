import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronDown, Mail, Search, BookOpen } from "lucide-react";
import { useAppSelector } from "../hooks/useRedux";
import { cn } from "../lib/utils";
import ParticleBackground from "../Components/ui/ParticleBackground";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: "General",
    question: "What is Integri AI?",
    answer:
      "Integri AI is an advanced AI assistant platform designed to integrate seamlessly with your documents, offering deep reasoning and analysis capabilities.",
  },
  {
    category: "General",
    question: "Is it free to use?",
    answer:
      "We offer a generous free tier with access to standard models. Premium features like GPT-4 and unlimited PDF uploads require a subscription.",
  },
  {
    category: "Account",
    question: "How do I change my email?",
    answer:
      "Currently, email changes are handled by support to ensure security. Please contact us using the email below.",
  },
  {
    category: "Features",
    question: "Can I upload Word documents?",
    answer:
      "Yes! In addition to PDFs, we support DOCX and TXT files for analysis.",
  },
  {
    category: "Privacy",
    question: "Is my data secure?",
    answer:
      "Absolutely. We use enterprise-grade encryption for all files and chats. Your data is not used to train public models.",
  },
];

const HelpPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useAppSelector((state: any) => state.theme);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={cn(
        "h-full w-full overflow-y-auto custom-scrollbar p-4 md:p-8 lg:p-12",
        isDark ? "bg-[#09090b] text-white" : "bg-gray-50 text-gray-900"
      )}
    >
      <ParticleBackground/>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            title="button"
            onClick={() => navigate(-1)}
            className={cn(
              "p-2 rounded-full transition-colors hover:cursor-pointer",
              isDark ? "hover:bg-[#1a1a1a]" : "hover:bg-gray-200"
            )}
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-10">
          <Search
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2",
              isDark ? "text-gray-500" : "text-gray-400"
            )}
            size={20}
          />
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              "w-full pl-12 pr-4 py-4 rounded-2xl outline-none border transition-all text-lg",
              isDark
                ? "bg-[#18181b] border-[#27272a] focus:border-blue-500 placeholder:text-gray-600"
                : "bg-white border-gray-200 focus:border-blue-500 shadow-sm"
            )}
          />
        </div>

        <div className="grid gap-8">
          {/* Contact Card */}
          <div
            className={cn(
              "p-6 rounded-2xl border flex items-center justify-between",
              isDark
                ? "bg-blue-900/10 border-blue-900/30"
                : "bg-blue-50 border-blue-100"
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "p-3 rounded-full",
                  isDark ? "bg-blue-500 text-white" : "bg-blue-600 text-white"
                )}
              >
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Still need help?</h3>
                <p
                  className={cn(
                    "text-sm",
                    isDark ? "text-blue-200" : "text-blue-700"
                  )}
                >
                  Our support team is available 24/7.
                </p>
              </div>
            </div>
            <a
              href="mailto:support@integri-ai.com"
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                isDark
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : "bg-white text-blue-600 shadow-sm hover:bg-gray-50"
              )}
            >
              Contact Us
            </a>
          </div>

          {/* FAQs */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-500" /> Frequently Asked
              Questions
            </h2>
            <div className="space-y-3">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-xl border overflow-hidden transition-all",
                    isDark
                      ? "bg-[#18181b] border-[#27272a]"
                      : "bg-white border-gray-200"
                  )}
                >
                  <button
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                    className="w-full flex items-center justify-between p-5 text-left hover:cursor-pointer"
                  >
                    <span className="font-medium text-lg pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={20}
                      className={cn(
                        "transition-transform duration-300 text-gray-500",
                        openIndex === index && "rotate-180"
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div
                          className={cn(
                            "px-5 pb-5 pt-0 text-sm leading-relaxed border-t",
                            isDark
                              ? "text-gray-400 border-[#27272a]"
                              : "text-gray-600 border-gray-100"
                          )}
                        >
                          <div className="pt-4">{faq.answer}</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              {filteredFaqs.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  No results found for "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
