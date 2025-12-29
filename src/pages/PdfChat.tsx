import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Upload, FileText, X, MessageSquare, Eye } from "lucide-react";
import { motion } from "framer-motion";
import ChatInterface from "../features/chat/components/ChatInterface";
import {  useAppSelector } from "../hooks/useRedux";
import { ChatService } from "../features/chat/services/chatService";
import Button from "../Components/ui/Button";
import ParticleBackground from "../Components/ui/ParticleBackground";

const PdfChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const token = useAppSelector((state: any) => state.auth.accessToken);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "pdf">("chat");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (location.state?.file) {
      const url = URL.createObjectURL(location.state.file);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [location.state]);

  const handleFileUpload = async (file: File) => {
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }
    setIsUploading(true);
    try {
      const sessionId = await ChatService.createChat(token, "gpt-4o");
      navigate(`/pdf/${sessionId}`, {
        state: {
          initialMessage: "Summarize this PDF",
          initialFile: file,
          file: file,
        },
      });
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

  if (!id) {
    return (
      <div
        className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center p-6"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <ParticleBackground/>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Chat with PDF
            </h1>
            <p className="text-muted-foreground text-lg">
              Upload a document to instantly generate a summary.
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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden">
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
        {/* LEFT SIDE: CHAT */}
        <div
          className={`
          flex-1 flex flex-col min-w-0 transition-all duration-300
          ${activeTab === "chat" ? "flex" : "hidden lg:flex"}
          lg:border-r ${isDark ? "border-gray-800" : "border-gray-200"}
        `}
        >
          {/* Use features={false} to hide extra tools and use cleaner input */}
          <ChatInterface features={false} />
        </div>

        {/* RIGHT SIDE: PDF PREVIEW */}
        <div
          className={`
          flex-1 flex flex-col min-w-0 bg-gray-100 dark:bg-[#0f0f0f]
          ${activeTab === "pdf" ? "flex" : "hidden lg:flex"}
        `}
        >
          {pdfUrl ? (
            <div className="h-full w-full flex flex-col">
              {/* Header */}
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
                <span className="text-sm font-medium flex items-center gap-2 truncate">
                  <FileText size={14} className="text-blue-500" />
                  <span className="truncate">Document Preview</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPdfUrl(null);
                    navigate("/pdf");
                  }}
                >
                  <X size={16} />
                </Button>
              </div>

              {/* PDF Iframe - Removed padding for cleaner mobile look */}
              <div className="flex-1 w-full h-full relative">
                <iframe
                  src={pdfUrl}
                  className={`absolute inset-0 w-full h-full border-0 ${
                    isDark ? "invert-[0.92] hue-rotate-180" : ""
                  }`}
                  title="PDF Preview"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-50">
              <FileText size={48} className="mb-4 text-gray-400" />
              <p>No PDF preview available.</p>
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
