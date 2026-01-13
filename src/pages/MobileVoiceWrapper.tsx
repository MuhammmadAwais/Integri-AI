import React from "react";
import { useParams } from "react-router-dom";
import Voice from "./Voice"; // Ensure this import path points to your Voice page/component

const MobileVoiceWrapper: React.FC = () => {
  // Extract the JWT Token from the URL parameters
  const { token } = useParams<{ token: string }>();

  if (!token) {
    return (
      <div className="h-dvh w-full flex items-center justify-center bg-black text-white">
        <p className="text-red-500 font-mono">
          Error: Invalid Connection Token
        </p>
      </div>
    );
  }

  // Render Voice Component in Standalone Mode
  // We force a black background and full viewport height
  return (
    <div className="h-dvh w-full bg-black overflow-hidden relative">
      <Voice overrideToken={token} />
    </div>
  );
};

export default MobileVoiceWrapper;
