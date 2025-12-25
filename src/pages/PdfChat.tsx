import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Upload,
  FileText,
  X,
  MessageSquare,
  Eye,
} from "lucide-react";
import { motion} from "framer-motion";
import ChatInterface from "../features/chat/components/ChatInterface";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { ChatService } from "../features/chat/services/chatService";
import Button from "../Components/ui/Button";

const PdfChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const token = useAppSelector((state: any) => state.auth.accessToken);

  // Local State
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "pdf">("chat"); // For mobile
  const [isUploading, setIsUploading] = useState(false);

  // 1. Check for PDF in Router State (Persist preview on navigation)
  useEffect(() => {
    if (location.state?.file) {
      const url = URL.createObjectURL(location.state.file);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [location.state]);

  // 2. Handle File Upload (Entry Point)
  const handleFileUpload = async (file: File) => {
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    setIsUploading(true);
    try {
      // Create a new Chat Session
      const sessionId = await ChatService.createChat(token, "gpt-4o"); // Defaulting to a high-perf model

      // Navigate to the new session with the file in state to trigger "Auto-Send"
      navigate(`/pdf/${sessionId}`, {
        state: {
          initialMessage: "Summarize this PDF",
          initialFile: file,
          file: file, // Keeping a ref for the preview
        },
      });

      // On Mobile, switch to PDF view initially so they see it worked
      setActiveTab("pdf");
    } catch (error) {
      console.error("Failed to start PDF chat", error);
      alert("Failed to initialize chat session.");
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
  };

  // --- RENDER HELPERS ---

  // Empty State (Upload Screen)
  if (!id) {
    return (
      <div
        className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center p-6 transition-colors duration-300"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Chat with PDF
            </h1>
            <p className="text-muted-foreground text-lg">
              Upload a document to instantly generate a summary and start asking
              questions.
            </p>
          </div>

          <div
            className={`
            border-2 border-dashed rounded-3xl p-10 transition-all duration-300 cursor-pointer
            ${
              isDark
                ? "border-gray-700 bg-gray-900/50 hover:bg-gray-800/50"
                : "border-gray-200 bg-white hover:bg-gray-50"
            }
            ${isUploading ? "opacity-50 pointer-events-none" : ""}
          `}
          >
            <input
              type="file"
              id="pdf-upload"
              className="hidden"
              accept="application/pdf"
              onChange={onFileSelect}
            />
            <label
              htmlFor="pdf-upload"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                {isUploading ? (
                  <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <Upload size={32} />
                )}
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-lg">
                  Click to upload or drag & drop
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF files only (max 10MB)
                </p>
              </div>
            </label>
          </div>
        </motion.div>
      </div>
    );
  }

  // Active Split View State
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden transition-colors duration-300">
      {/* Mobile Tab Toggle */}
      <div
        className={`lg:hidden flex border-b ${
          isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white"
        }`}
      >
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
            activeTab === "chat"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500"
          }`}
        >
          <MessageSquare size={16} /> Chat
        </button>
        <button
          onClick={() => setActiveTab("pdf")}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
            activeTab === "pdf"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-500"
          }`}
        >
          <Eye size={16} /> PDF Preview
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* --- LEFT SIDE: CHAT INTERFACE --- */}
        <div
          className={`
          flex-1 flex flex-col min-w-0 transition-all duration-300
          ${activeTab === "chat" ? "flex" : "hidden lg:flex"}
          lg:border-r ${isDark ? "border-gray-800" : "border-gray-200"}
        `}
        >
          {/* We assume ChatInterface takes full height. We wrap it to ensure it fits. */}
          <div className="flex-1 relative">
            <ChatInterface />
          </div>
        </div>

        {/* --- RIGHT SIDE: PDF PREVIEW --- */}
        <div
          className={`
          flex-1 flex flex-col min-w-0 bg-gray-100 dark:bg-[#0f0f0f]
          ${activeTab === "pdf" ? "flex" : "hidden lg:flex"}
        `}
        >
          {pdfUrl ? (
            <div className="h-full w-full flex flex-col">
              <div
                className={`
                h-12 flex items-center justify-between px-4 border-b
                ${
                  isDark
                    ? "bg-[#1a1a1a] border-gray-800"
                    : "bg-white border-gray-200"
                }
              `}
              >
                <span className="text-sm font-medium flex items-center gap-2">
                  <FileText size={14} className="text-blue-500" />
                  Document Preview
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPdfUrl(null);
                    // Optional: Navigate back to upload state
                    navigate("/pdf");
                  }}
                >
                  <X size={16} />
                </Button>
              </div>
              <iframe
                src={pdfUrl}
                className={`flex-1 w-full h-full border-0 ${
                  isDark ? "invert-[0.92] hue-rotate-180" : ""
                }`}
                title="PDF Preview"
              />
              {isDark && (
                <div className="text-center py-1 text-[10px] text-gray-500 bg-[#1a1a1a]">
                  PDF colors inverted for dark mode comfort
                </div>
              )}
            </div>
          ) : (
            // Fallback if user lands directly on /pdf/:id without state (Deep link)
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-50">
              <FileText size={48} className="mb-4 text-gray-400" />
              <p>No PDF preview available for this session.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/pdf")}
              >
                Upload New
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfChatPage;
