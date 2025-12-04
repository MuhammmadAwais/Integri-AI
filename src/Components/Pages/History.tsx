import React from "react";
import { useAppSelector, useAppDispatch } from "../hooks/useRedux";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { cn } from "../../utils/cn";
import { deleteChat } from "../../store/chatSlice";

const HistoryPage: React.FC = () => {
  const sessions = useAppSelector((state) => state.chat.sessions);
  const isDark = useAppSelector((state) => state.theme.isDark);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  return (
    <div className="max-w-5xl mx-auto p-8 animate-in fade-in duration-500">
      <h1
        className={cn(
          "text-3xl font-bold mb-8",
          isDark ? "text-white" : "text-gray-900"
        )}
      >
        Chat History
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              "p-5 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-lg relative group",
              isDark
                ? "bg-[#2A2B32] border-gray-700"
                : "bg-white border-gray-200"
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  isDark ? "bg-black/20" : "bg-indigo-50 text-indigo-600"
                )}
              >
                <MessageSquare size={20} />
              </div>
              <span className="text-xs opacity-50 font-mono">
                {new Date(session.date).toLocaleDateString()}
              </span>
            </div>

            <h3
              className={cn(
                "font-semibold text-lg mb-2 truncate",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {session.title}
            </h3>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => navigate(`/chat/${session.id}`)}
                className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                View Chat
              </button>
              <button
                onClick={() => dispatch(deleteChat(session.id))}
                className="px-3 py-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
