import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  isDark: boolean;
  onFileChange: (file: File | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  isDark,
  onFileChange,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onFileChange(file); // Lift state up
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    onFileChange(null); // Clear parent state
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        title="file"
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <label
        className={`text-xs font-bold uppercase tracking-wider ${
          isDark ? "text-zinc-500" : "text-zinc-400"
        }`}
      >
        Reference Image
      </label>

      {!previewUrl ? (
        <div
          onClick={triggerUpload}
          className={`group relative h-32 w-full rounded-2xl border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200
            ${
              isDark
                ? "border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200"
                : "border-zinc-300 bg-zinc-50 hover:bg-white hover:border-zinc-400 text-zinc-500 hover:text-zinc-700"
            }`}
        >
          <div className="flex flex-col items-center gap-2">
            <Upload
              size={20}
              className="opacity-50 group-hover:opacity-100 transition-opacity"
            />
            <span className="text-xs font-medium">Upload Image</span>
          </div>
        </div>
      ) : (
        <div
          className={`relative h-32 w-full rounded-2xl overflow-hidden border group
           ${isDark ? "border-zinc-800" : "border-zinc-200"}`}
        >
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500"
          />

          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={triggerUpload}
              className="px-3 py-1.5 bg-black/60 backdrop-blur text-white text-xs font-bold rounded-lg border border-white/20 hover:bg-black/80"
            >
              Change
            </button>
          </div>

          <button
            title="remove"
            onClick={clearImage}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 backdrop-blur-md transition"
          >
            <X size={14} />
          </button>

          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md flex items-center gap-1.5 border border-white/10">
            <ImageIcon size={10} className="text-zinc-300" />
            <span className="text-[10px] text-zinc-200 font-mono">ref.png</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
