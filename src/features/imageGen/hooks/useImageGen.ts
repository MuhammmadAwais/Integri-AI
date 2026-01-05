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
        // 1. Create a specific session for this generation
        // We use the selected model/provider.
        const sessionData = await SessionService.createSession(
          token,
          modelId,
          provider,
          null // No custom GPT
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

        // 4. Setup specific listeners for Image Gen
        socketService.onMessage((data) => {
          if (data.type === "stream") {
            // Requirement: Ignore streams
            return;
          }
          if (data.type === "status") {
            // Requirement: Trigger loader (already handled by isGenerating=true)
            // We could add specific status text state here if needed
          }
          if (data.type === "image_generated") {
            // Requirement: Replace loader with image
            setGeneratedImage({
              url: data.url,
              prompt: data.content || prompt,
              id: Date.now().toString(),
            });
            setIsGenerating(false);
            // Optional: Disconnect after success to save resources,
            // or keep open if follow-ups are allowed.
          }
          if (data.type === "error") {
            setError(data.content || "Generation failed");
            setIsGenerating(false);
          }
        });

        // 5. Construct Prompt (Prompt Engineering Logic)
        const engineeredPrompt = `${prompt} in ${quality} quality and ${aspectRatio} aspect ratio.`;

        // 6. Send Message
        // We use a small timeout to ensure socket connection or rely on the service's queue
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

  return {
    generateImage,
    generatedImage,
    isGenerating,
    error,
  };
};
