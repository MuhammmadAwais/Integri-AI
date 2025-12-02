import React from "react";
import { useParams } from "react-router-dom";
import ChatInput from "../Chat/ChatInput";

const ChatInterface: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Mock Chat History */}
        <div className="flex justify-end">
          <div className="bg-teal-600 text-white p-3 rounded-2xl rounded-tr-none max-w-[80%]">
            Hello, can you help me with React?
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-gray-200 dark:bg-[#2F3139] dark:text-gray-100 p-3 rounded-2xl rounded-tl-none max-w-[80%]">
            Of course! I'm ready to help you build your React application. ID:{" "}
            {id}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="w-full pb-4">
        <ChatInput />
      </div>
    </div>
  );
};

export default ChatInterface;
