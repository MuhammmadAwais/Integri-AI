import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

interface DownloadModalProps {
  isOpen: boolean;
  qrCodeSrc?: string;
  isDark: boolean;
  storeName: string;
}

const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  qrCodeSrc,
  isDark,
  storeName,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-4 z-50 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "relative p-4 rounded-2xl shadow-2xl border w-[200px] flex flex-col items-center text-center",
              isDark
                ? "bg-[#1A1A1A] border-[#333] text-white"
                : "bg-white border-gray-200 text-black"
            )}
          >
            {/* Arrow/Pointer */}
            <div
              className={cn(
                "absolute -bottom-2 right-6 w-4 h-4 rotate-45 border-r border-b",
                isDark
                  ? "bg-[#1A1A1A] border-[#333]"
                  : "bg-white border-gray-200"
              )}
            />

            <div className="mb-3 space-y-1">
              <h4 className="text-sm font-bold leading-tight">Download App</h4>
              <p
                className={cn(
                  "text-[10px]",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}
              >
                Scan to get it on {storeName}
              </p>
            </div>

            <div
              className={cn(
                "p-2 rounded-xl bg-white w-full aspect-square flex items-center justify-center overflow-hidden",
                isDark ? "border border-gray-800" : "border border-gray-100"
              )}
            >
              {qrCodeSrc ? (
                <img
                  src={qrCodeSrc}
                  alt={`${storeName} QR Code`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DownloadModal;
