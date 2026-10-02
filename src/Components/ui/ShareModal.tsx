import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Share2 } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "../../lib/utils";
import Portal from "./Portal";

export interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    isDark: boolean;
    // Optional custom URL to share. Defaults to window.location.href
    shareUrl?: string; 
    // Optional object to specify title/text for Web Share API
    shareData?: { title?: string; text?: string };
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, isDark, shareData, shareUrl }) => {
    const [copied, setCopied] = useState(false);
    
    const url = shareUrl || (typeof window !== "undefined" ? window.location.href : "");
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Handle copying link
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy link");
        }
    };

    // Native OS Web Share API (Primary mobile trigger)
    const handleWebShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareData?.title || document.title,
                    text: shareData?.text || "Check this out!",
                    url: url,
                });
            } catch (error: any) {
                if (error.name !== "AbortError") {
                    console.log("Error sharing", error);
                }
            }
        } else {
            handleCopy();
        }
    };

    // Social Shortcuts Configurations
    const shareLinks = [
        {
            name: "Embed",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            ),
            onClick: () => { handleCopy(); toast.info("Embed link copied!"); },
            bgCls: "bg-gray-100 hover:bg-gray-200 dark:bg-[#1F1D25] dark:hover:bg-[#2A2830] text-gray-900 dark:text-white"
        },
        {
            name: "WhatsApp",
            icon: (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
            ),
            href: `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`,
            bgCls: "bg-[#25D366] hover:bg-[#20b957] text-white"
        },
        {
            name: "Email",
            icon: (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
            ),
            href: `mailto:?subject=${encodeURIComponent(shareData?.title || "Check out this content from Integri AI")}&body=${encodeURIComponent(url)}`,
            bgCls: "bg-gray-400 hover:bg-gray-500 text-white"
        },
        {
            name: "X",
            icon: (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            ),
            href: `https://x.com/intent/tweet?url=${encodeURIComponent(url)}${shareData?.title ? `&text=${encodeURIComponent(shareData.title)}` : ""}`,
            bgCls: "bg-black hover:bg-[#18161C] dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black"
        },
        {
            name: "Discord",
            icon: (
                <svg viewBox="0 0 127.14 96.36" width="24" height="24" fill="currentColor"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77.7,77.7,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>
            ),
            onClick: () => { handleCopy(); toast.info("Link copied! Open Discord to paste."); },
            bgCls: "bg-[#5865F2] hover:bg-[#4752c4] text-white"
        },
        {
            name: "Instagram",
            icon: (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.822a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" /></svg>
            ),
            onClick: () => { handleCopy(); toast.info("Link copied! Open Instagram to paste."); },
            bgCls: "bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] hover:opacity-90 text-white"
        }
    ];

    return (
        <Portal>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />

                        {/* Modal container (slide up + glassmorphism) */}
                        <motion.div
                            ref={modalRef}
                            initial={{ y: 50, opacity: 0, scale: 0.98 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 50, opacity: 0, scale: 0.98 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className={cn(
                                "relative w-full max-w-md p-6 rounded-2xl shadow-xl overflow-hidden",
                                "border border-white/10",
                                isDark 
                                    ? "bg-[#18161C]/90 text-white" 
                                    : "bg-white/95 text-gray-900"
                            )}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold">Share</h2>
                                <button
                                    onClick={onClose}
                                    className={cn(
                                        "p-2 rounded-full transition-colors cursor-pointer",
                                        isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                                    )}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Social Icons Row (Scrollable wrapper) */}
                            <div className="flex gap-4 overflow-x-auto pb-4 mb-4 scrollbar-hide shrink-0 snap-x">
                                {/* Mobile trigger for Web Share API */}
                                {typeof navigator !== "undefined" && "share" in navigator && (
                                     <button
                                         onClick={handleWebShare}
                                         className="flex flex-col items-center gap-2 min-w-[72px] group snap-start cursor-pointer"
                                     >
                                         <div className={cn(
                                             "w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-105",
                                             isDark ? "bg-[#282828] text-white" : "bg-gray-100 text-gray-800"
                                         )}>
                                             <Share2 size={24} strokeWidth={1.5} />
                                         </div>
                                         <span className="text-xs font-medium">More</span>
                                     </button>
                                )}

                                {shareLinks.map((link) => (
                                    link.href ? (
                                        <a
                                            key={link.name}
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center gap-2 min-w-[72px] group snap-start cursor-pointer"
                                        >
                                            <div className={cn(
                                                "w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-105",
                                                link.bgCls
                                            )}>
                                                {link.icon}
                                            </div>
                                            <span className={cn(
                                                "text-xs font-medium",
                                                isDark ? "text-gray-300" : "text-gray-700"
                                            )}>{link.name}</span>
                                        </a>
                                    ) : (
                                        <button
                                            key={link.name}
                                            onClick={link.onClick}
                                            className="flex flex-col items-center gap-2 min-w-[72px] group snap-start cursor-pointer"
                                        >
                                            <div className={cn(
                                                "w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-105",
                                                link.bgCls
                                            )}>
                                                {link.icon}
                                            </div>
                                            <span className={cn(
                                                "text-xs font-medium",
                                                isDark ? "text-gray-300" : "text-gray-700"
                                            )}>{link.name}</span>
                                        </button>
                                    )
                                ))}
                            </div>

                            {/* Divider underneath social icons area */}
                            <div className={cn("h-px w-full mb-6", isDark ? "bg-white/10" : "bg-black/5")} />

                            {/* Copy Link Input Field */}
                            <div className={cn(
                                "flex items-center gap-2 p-1.5 pl-4 rounded-xl",
                                "border transition-colors outline-none",
                                isDark 
                                    ? "bg-[#0f0f0f] border-white/10" 
                                    : "bg-gray-50 border-gray-200"
                            )}>
                                <input
                                    type="text"
                                    readOnly
                                    value={url}
                                    className="flex-1 bg-transparent text-sm w-full outline-none truncate"
                                    onFocus={(e) => e.target.select()}
                                />
                                <button
                                    onClick={handleCopy}
                                    className={cn(
                                        "px-4 py-2 flex items-center gap-2 rounded-lg font-medium text-sm transition-all cursor-pointer",
                                        copied 
                                            ? "bg-green-500 text-white" 
                                            : "bg-blue-500 hover:bg-blue-600 text-white"
                                    )}
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                    {copied ? "Copied" : "Copy"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Portal>
    );
};

export default ShareModal;
