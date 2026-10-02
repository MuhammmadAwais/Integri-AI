import React, { useState, useRef } from "react";
import { ArrowLeft, Loader2, UploadCloud, FileText, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { cn } from "../../../lib/utils";
import Button from "../../../Components/ui/Button";
import { useAppSelector } from "../../../hooks/useRedux";
import backendApi, { SystemToolsService } from "../../../api/backendApi";
import type { DocumentExplainerResponse } from "../../../api/backendApi";

const DocumentExplainerWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useAppSelector((state: any) => state.theme);
  const token = useAppSelector((state: any) => state.auth.accessToken);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "ready">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DocumentExplainerResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startUploadPipeline = async () => {
    if (!file) return;

    setUploadStatus("uploading");
    setError(null);

    try {
      // 1. GET upload url
      const { data: { uploadUrl, fileId } } = await backendApi.get(
        `/api/v1/files/upload-url?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. PUT to S3
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      // 3. POST process
      await backendApi.post(
        `/api/v1/files/process`,
        { fileId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUploadStatus("processing");

      // 4. Poll for status
      let isReady = false;
      while (!isReady) {
        await new Promise((res) => setTimeout(res, 2000));
        const { data: statusData } = await backendApi.get(`/api/v1/files/${fileId}/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statusData.processing_status === "ready") {
          isReady = true;
        } else if (statusData.processing_status === "failed") {
          throw new Error("File processing failed on server.");
        }
      }

      setUploadStatus("ready");

      // 5. Explainer Tool Request
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Karachi";
      const explainerData = await SystemToolsService.explainDocument(token || "", {
        file_ids: [fileId],
        language_code: "en",
        country_code: "US",
        timezone,
      });
      setResult(explainerData);

    } catch (err: any) {
      setError(err.message || "An error occurred during upload or processing.");
      setUploadStatus("idle");
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
          <h1 className="font-bold text-lg">Document Explainer</h1>
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
              "flex flex-col rounded-2xl border p-6 min-h-[400px]",
              isDark ? "bg-[#07060A] border-white/5" : "bg-white border-gray-200 shadow-sm"
            )}
          >
            <h2 className="font-semibold mb-6">Upload Document</h2>
            
            <div className="flex flex-col flex-1 gap-6 justify-center">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt"
              />
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all h-64",
                  isDragging
                    ? "border-blue-500 bg-blue-500/10"
                    : isDark
                    ? "border-white/10 hover:border-white/20 bg-black/50"
                    : "border-gray-300 hover:border-blue-400 bg-gray-50"
                )}
              >
                <UploadCloud size={48} className={isDark ? "text-gray-500 mb-4" : "text-gray-400 mb-4"} />
                <p className="font-medium mb-1">
                  {file ? file.name : "Drag & drop a document here"}
                </p>
                <p className={cn("text-sm", isDark ? "text-gray-500" : "text-gray-400")}>
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "or click to browse"}
                </p>
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                onClick={startUploadPipeline}
                disabled={!file || uploadStatus === "uploading" || uploadStatus === "processing"}
                className="w-full flex justify-center items-center gap-2 mt-auto"
              >
                {(uploadStatus === "uploading" || uploadStatus === "processing") ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : uploadStatus === "ready" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <FileText size={18} />
                )}
                {uploadStatus === "uploading"
                  ? "Uploading..."
                  : uploadStatus === "processing"
                  ? "Processing Document..."
                  : "Explain Document"}
              </Button>
            </div>
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
            <h2 className="font-semibold mb-6">Explanation Output</h2>
            
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-6 flex-1 overflow-y-auto custom-scrollbar"
                >
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-xs uppercase tracking-wider font-bold text-blue-500">
                      Document Explanation (Markdown)
                    </label>
                    <div className={cn(
                      "p-4 rounded-xl border flex-1 prose max-w-none dark:prose-invert overflow-y-auto custom-scrollbar leading-relaxed text-sm",
                      isDark ? "bg-black border-white/5 text-gray-200" : "bg-gray-50 border-gray-200 text-gray-800"
                    )}>
                      <ReactMarkdown>{result.explanation}</ReactMarkdown>
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
                  {uploadStatus === "uploading" || uploadStatus === "processing" ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={48} className="animate-spin text-blue-500" />
                      <p>{uploadStatus === "uploading" ? "Uploading to S3..." : "Analyzing document with GPT-4.1..."}</p>
                    </div>
                  ) : (
                    <>
                      <FileText size={48} className="mb-4 text-gray-400" />
                      <p>Upload a document to generate an explanation.</p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DocumentExplainerWorkspace;
