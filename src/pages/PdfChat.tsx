import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Upload,
  FileText,
  X,
  MessageSquare,
  Eye,
  StickyNote,
  Trash2,
  Download,
  GripHorizontal, 
} from "lucide-react";
import { motion } from "framer-motion";
import ChatInterface from "../features/chat/components/ChatInterface";
import { useAppSelector } from "../hooks/useRedux";
import { ChatService } from "../features/chat/services/chatService";
import Button from "../Components/ui/Button";
import ParticleBackground from "../Components/ui/ParticleBackground";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import LoginModal from "../features/auth/components/LoginModal";
import SubscribeModal from "../features/subscriptions/components/SubscribeModal";

interface Note {
  id: string;
  x: number;
  y: number;
  text: string;
}

const PdfChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const token = useAppSelector((state: any) => state.auth.accessToken);
  const user = useAppSelector((state: any) => state.auth.user);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "pdf">("chat");
  const [isUploading, setIsUploading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  // --- NOTES STATE ---
  const [notes, setNotes] = useState<Note[]>([]);
  const [isNoteMode, setIsNoteMode] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // --- DRAG STATE ---
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (location.state?.file) {
      const url = URL.createObjectURL(location.state.file);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [location.state]);

  const handleFileUpload = async (file: File) => {
      if (!user) {
        setShowLoginModal(true);
        return
      }
    if (!token) return;
    if (!user?.isPremium) {
      setShowSubscriptionModal(true);
      return
    }
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

  // --- NOTE HANDLERS ---
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isNoteMode || !pdfContainerRef.current) return;

    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newNote: Note = {
      id: Date.now().toString(),
      x: Math.max(0, x - 20),
      y: Math.max(0, y - 20),
      text: "",
    };

    setNotes([...notes, newNote]);
    setIsNoteMode(false);
  };

  const updateNoteText = (id: string, text: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, text } : n)));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  // --- DRAG LOGIC START ---
  const handleDragStart = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation(); // Prevent triggering other clicks
    setDraggingNoteId(note.id);

    if (pdfContainerRef.current) {
      const containerRect = pdfContainerRef.current.getBoundingClientRect();
      // Calculate where inside the note the user clicked (the offset)
      const mouseXRel = e.clientX - containerRect.left;
      const mouseYRel = e.clientY - containerRect.top;

      dragOffsetRef.current = {
        x: mouseXRel - note.x,
        y: mouseYRel - note.y,
      };
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingNoteId || !pdfContainerRef.current) return;

      const containerRect = pdfContainerRef.current.getBoundingClientRect();

      // Calculate new position based on mouse position relative to container minus the initial click offset
      const newX = e.clientX - containerRect.left - dragOffsetRef.current.x;
      const newY = e.clientY - containerRect.top - dragOffsetRef.current.y;

      setNotes((prevNotes) =>
        prevNotes.map((n) =>
          n.id === draggingNoteId ? { ...n, x: newX, y: newY } : n
        )
      );
    },
    [draggingNoteId]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingNoteId(null);
  }, []);

  // Attach/Detach global listeners for dragging
  useEffect(() => {
    if (draggingNoteId) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingNoteId, handleMouseMove, handleMouseUp]);
  // --- DRAG LOGIC END ---

  // --- DOWNLOAD WITH NOTES ---
  const handleDownloadWithNotes = async () => {
    if (!pdfUrl) return;
    if (notes.length === 0) {
      alert("No notes to save. Add some notes first!");
      return;
    }

    try {
      const existingPdfBytes = await fetch(pdfUrl).then((res) =>
        res.arrayBuffer()
      );

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0]; // Currently maps everything to page 1 for iframe view
      const { width: pageWidth, height: pageHeight } = firstPage.getSize();

      if (!pdfContainerRef.current) return;
      const { clientWidth, clientHeight } = pdfContainerRef.current;

      for (const note of notes) {
        const relX = note.x / clientWidth;
        const relY = note.y / clientHeight;

        const x = relX * pageWidth;
        const y = pageHeight - relY * pageHeight;

        const boxWidth = 180;
        const boxHeight = 90;

        firstPage.drawRectangle({
          x: x,
          y: y - boxHeight,
          width: boxWidth,
          height: boxHeight,
          color: rgb(0.99, 0.94, 0.54),
          borderColor: rgb(0.9, 0.7, 0.1),
          borderWidth: 1,
        });

        firstPage.drawText(note.text, {
          x: x + 5,
          y: y - 15,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0),
          maxWidth: boxWidth - 10,
          lineHeight: 12,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `document_with_notes_${Date.now()}.pdf`;
      link.click();
    } catch (error) {
      console.error("Failed to save PDF", error);
      alert("Failed to generate PDF with notes.");
    }
  };

  if (!id) {
    return (
      <div
        className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center p-6"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
        <SubscribeModal
          featureName="PDF Chat"
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
        <ParticleBackground />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight bg-[#838996] bg-clip-text text-transparent">
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
                ? "border-gray-700 bg-transparent"
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
              <div className="h-16 w-16 rounded-2xl bg-[#d3d3d3] flex items-center justify-center text-gray-500">
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
          <ChatInterface features={false} />
        </div>

        {/* RIGHT SIDE: PDF PREVIEW */}
        <div
          className={`
          flex-1 flex flex-col min-w-0 bg-gray-100 dark:bg-[#0f0f0f] relative
          ${activeTab === "pdf" ? "flex" : "hidden lg:flex"}
        `}
        >
          {pdfUrl ? (
            <div className="h-full w-full flex flex-col">
              {/* Header */}
              <div
                className={`
                h-12 flex items-center justify-between px-4 border-b z-30
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

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`${
                      isNoteMode
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500 ring-1 ring-yellow-500"
                        : ""
                    }`}
                    onClick={() => setIsNoteMode(!isNoteMode)}
                    title="Click PDF to add a note"
                  >
                    {isNoteMode ? (
                      <StickyNote size={16} fill="currentColor" />
                    ) : (
                      <StickyNote size={16} />
                    )}
                    <span className="ml-2 text-xs">
                      {isNoteMode ? "Click PDF to Place" : "Add Note"}
                    </span>
                  </Button>

                  {/* Download Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownloadWithNotes}
                    title="Download with Notes"
                  >
                    <Download size={16} />
                    <span className="ml-2 text-xs hidden sm:inline">Save</span>
                  </Button>

                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1" />

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
              </div>

              {/* PDF Container */}
              <div
                ref={pdfContainerRef}
                className="flex-1 w-full h-full relative overflow-hidden"
              >
                {/* 1. PDF Iframe */}
                <iframe
                  src={pdfUrl}
                  className="absolute inset-0 w-full h-full border-0 z-0"
                  title="PDF Preview"
                  // Disabling pointer events on iframe while dragging prevents it from stealing mouse events
                  style={{ pointerEvents: draggingNoteId ? "none" : "auto" }}
                />

                {/* 2. Click Capture Overlay */}
                {isNoteMode && (
                  <div
                    className="absolute inset-0 z-10 cursor-crosshair bg-transparent"
                    onClick={handleOverlayClick}
                  />
                )}

                {/* 3. Notes Layer */}
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="absolute z-20 w-48 shadow-lg rounded-lg overflow-hidden animate-in zoom-in duration-200"
                    style={{
                      left: note.x,
                      top: note.y,
                      backgroundColor: isDark ? "#3f3f3f" : "#fef08a",
                      border: isDark ? "1px solid #555" : "1px solid #eab308",
                      cursor: draggingNoteId === note.id ? "grabbing" : "auto",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className="flex justify-between items-center p-1 bg-black/5 dark:bg-white/5 cursor-grab active:cursor-grabbing"
                      onMouseDown={(e) => handleDragStart(e, note)}
                    >
                      <div className="flex items-center gap-1 opacity-50 px-1">
                        <GripHorizontal size={14} />
                      </div>
                      <button
                        title="Delete Note"
                        onClick={() => deleteNote(note.id)}
                        className="text-red-500 hover:text-red-700 p-0.5 rounded"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <textarea
                      autoFocus
                      className={`w-full h-24 p-2 text-sm resize-none bg-transparent outline-none ${
                        isDark
                          ? "text-white placeholder:text-gray-400"
                          : "text-black placeholder:text-yellow-700"
                      }`}
                      placeholder="Type note..."
                      value={note.text}
                      onChange={(e) => updateNoteText(note.id, e.target.value)}
                    />
                  </div>
                ))}
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
