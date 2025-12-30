import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon} from "lucide-react";

interface ImageUploaderProps {
  isDark: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ isDark }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-3">
      <input
      title="file"
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {!previewUrl ? (
        <div
          onClick={triggerUpload}
          className={`group relative h-40 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300
            ${
              isDark
                ? "border-gray-800 bg-gray-900/30 hover:bg-gray-900 hover:border-gray-600"
                : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
            }`}
        >
          <div
            className={`p-3 rounded-full mb-3 transition-transform group-hover:scale-110 ${
              isDark
                ? "bg-gray-800 text-gray-300"
                : "bg-white text-gray-700 shadow-sm"
            }`}
          >
            <Upload size={20} />
          </div>
          <p
            className={`text-sm font-medium ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Upload Reference Image
          </p>
          <p
            className={`text-xs mt-1 ${
              isDark ? "text-gray-600" : "text-gray-400"
            }`}
          >
            Click or Drag & Drop
          </p>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden group border border-gray-200 dark:border-gray-800">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover"
          />

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={triggerUpload}
              className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg text-white text-sm font-medium hover:bg-white/30 transition"
            >
              Change
            </button>
          </div>

          <button
          title="button"
            onClick={clearImage}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md transition"
          >
            <X size={14} />
          </button>

          <div className="absolute bottom-2 left-2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md flex items-center gap-2">
            <ImageIcon size={12} className="text-gray-300" />
            <span className="text-xs text-white font-medium">
              Reference.png
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
