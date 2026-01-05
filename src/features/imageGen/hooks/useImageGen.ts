import { useState, useCallback, useEffect, useRef } from "react";
import { socketService } from "../../../services/WebSocketsService";
import { SessionService } from "../../../api/backendApi";
import { useAppSelector } from "../../../hooks/useRedux";

export interface GeneratedImage {
  url: string;
  prompt: string;
  id?: string;
}

interface GenerateParams {
  modelId: string;
  provider: string;
  prompt: string;
  aspectRatio: string;
  quality: string;
  imageFile: File | null;
}

export const useImageGen = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Store the current session ID to manage socket connections
  const sessionIdRef = useRef<string | null>(null);

  const token = useAppSelector((state: any) => state.auth.accessToken);

  // Clean up socket on unmount
  useEffect(() => {
    return () => {
      if (sessionIdRef.current) {
        socketService.disconnect();
      }
    };
  }, []);

  const generateImage = useCallback(
    async ({
      modelId,
      provider,
      prompt,
      aspectRatio,
      quality,
      imageFile,
    }: GenerateParams) => {
      if (!token) {
        setError("Authentication missing");
        return;
      }

      setIsGenerating(true);
      setError(null);
      setGeneratedImage(null);

      try {
        // 1. Create a specific session
        const sessionData = await SessionService.createSession(
          token,
          modelId,
          provider,
          null
        );

        const newSessionId = sessionData.session_id;
        sessionIdRef.current = newSessionId;

        // 2. Upload File if exists
        let fileIds: string[] = [];
        if (imageFile) {
          const uploadedId = await SessionService.uploadFile(token, imageFile);
          if (uploadedId) {
            fileIds.push(uploadedId);
          }
        }

        // 3. Connect Socket
        socketService.connect(token, newSessionId);

        // 4. Setup listeners
        socketService.onMessage((data) => {
          if (data.type === "stream") return;

          if (data.type === "image_generated") {
            setGeneratedImage({
              url: data.url,
              prompt: data.content || prompt,
              id: Date.now().toString(),
            });
            setIsGenerating(false);
          }

          if (data.type === "error") {
            setError(data.content || "Generation failed");
            setIsGenerating(false);
          }
        });

        // 5. Construct Prompt & Send
        const engineeredPrompt = `${prompt} in ${quality} quality and ${aspectRatio} aspect ratio.`;

        setTimeout(() => {
          socketService.sendMessage(
            engineeredPrompt,
            modelId,
            provider,
            fileIds
          );
        }, 500);
      } catch (err: any) {
        console.error("Image Generation Failed:", err);
        setError(err.message || "Failed to start generation");
        setIsGenerating(false);
      }
    },
    [token]
  );

  const downloadImage = useCallback(async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Download failed:", e);
      // Fallback for direct links
      window.open(url, "_blank");
    }
  }, []);

  const resetGen = () => {
    setGeneratedImage(null);
    setIsGenerating(false);
    setError(null);
  };

  return {
    generateImage,
    generatedImage,
    isGenerating,
    error,
    downloadImage,
    resetGen,
  };
};
