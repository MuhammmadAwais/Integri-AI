import React, { useState, useEffect } from "react";
import { X, Loader2, Bot } from "lucide-react";
import { cn } from "../../../lib/utils";
import { AgentService } from "../../../api/backendApi";
import AVAILABLE_MODELS from "../../../../Constants";

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  agent?: any;
  isDark: boolean;
}

const AgentModal: React.FC<AgentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  token,
  agent,
  isDark,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    instructions: "",
    model: "gpt-4o-mini",
  });

  // Conversation starters state
  const [conversationStarter, setConversationStarter] = useState("");
  const [conversationStarters, setConversationStarters] = useState<string[]>(
    []
  );

  useEffect(() => {
    if (isOpen) {
      setError(null);

      if (agent) {
        setFormData({
          name: agent.name || "",
          description: agent.description || "",
          instructions: agent.instructions || "",
          // FIX 4: Robust check. Prioritize recommended_model, fallback to model, then default.
          model: agent.recommended_model || agent.model || "gpt-4o-mini",
        });

        setConversationStarters(agent.conversation_starters || []);
      } else {
        setFormData({
          name: "",
          description: "",
          instructions: "",
          model: "gpt-4o-mini",
        });

        setConversationStarters([]);
      }

      setConversationStarter("");
    }
  }, [isOpen, agent]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const selectedModelObj = AVAILABLE_MODELS.find(
        (m) => m.id === formData.model
      );

      const provider = selectedModelObj?.provider || "openai";

      const payload = {
        name: formData.name,
        description: formData.description,
        instructions: formData.instructions,
        conversation_starters: conversationStarters,
        recommended_model: formData.model,
        recommended_provider: provider,
      };

      if (agent) {
        // FIX 5: Use 'gpt_id' (which is the actual ID field in your Agent interface)
        await AgentService.updateAgent(token, agent.gpt_id, payload);
      } else {
        await AgentService.createAgent(token, payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to save agent", err);
      setError(
        err.response?.data?.detail || "Failed to save agent. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6 shadow-2xl animate-in fade-in-0 zoom-in-95",
          isDark
            ? "bg-[#18181b] border-[#27272a] text-gray-100"
            : "bg-white border-gray-200 text-gray-900"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bot
              className={isDark ? "text-indigo-400" : "text-indigo-600"}
              size={22}
            />
            {agent ? "Edit Agent" : "Create New Agent"}
          </h2>
          <button
          title="button"
            onClick={onClose}
            className={cn(
              "rounded-full p-1 transition-colors",
              isDark
                ? "hover:bg-gray-800 text-gray-400"
                : "hover:bg-gray-100 text-gray-500"
            )}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name</label>
            <input
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Coding Assistant"
              className={cn(
                "flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2",
                isDark
                  ? "bg-gray-900 border-gray-800 focus-visible:ring-indigo-500"
                  : "bg-white border-gray-200 focus-visible:ring-indigo-500"
              )}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="What does this agent do?"
              className={cn(
                "flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2",
                isDark
                  ? "bg-gray-900 border-gray-800 focus-visible:ring-indigo-500"
                  : "bg-white border-gray-200 focus-visible:ring-indigo-500"
              )}
            />
          </div>

          {/* Conversation Starters */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Conversation Starters</label>

            <div className="flex gap-2">
              <input
                value={conversationStarter}
                onChange={(e) => setConversationStarter(e.target.value)}
                placeholder="e.g. How can I help you today?"
                className={cn(
                  "flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2",
                  isDark
                    ? "bg-gray-900 border-gray-800 focus-visible:ring-indigo-500"
                    : "bg-white border-gray-200 focus-visible:ring-indigo-500"
                )}
              />
              <button
                type="button"
                onClick={() => {
                  if (!conversationStarter.trim()) return;
                  setConversationStarters((prev) => [
                    ...prev,
                    conversationStarter.trim(),
                  ]);
                  setConversationStarter("");
                }}
                className="px-4 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
              >
                Add
              </button>
            </div>

            {conversationStarters.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {conversationStarters.map((starter, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-indigo-500/10 text-indigo-400"
                  >
                    {starter}
                    <button
                      type="button"
                      onClick={() =>
                        setConversationStarters((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="hover:text-red-400"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Model */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Base Model</label>
            <select
            title="select"
              value={formData.model}
              onChange={(e) =>
                setFormData({ ...formData, model: e.target.value })
              }
              className={cn(
                "flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2",
                isDark
                  ? "bg-gray-900 border-gray-800 focus-visible:ring-indigo-500"
                  : "bg-white border-gray-200 focus-visible:ring-indigo-500"
              )}
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} ({m.provider})
                </option>
              ))}
            </select>
          </div>

          {/* Instructions */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">System Instructions</label>
            <textarea
              required
              rows={5}
              value={formData.instructions}
              onChange={(e) =>
                setFormData({ ...formData, instructions: e.target.value })
              }
              placeholder="You are a helpful assistant who..."
              className={cn(
                "flex w-full rounded-md border px-3 py-2 text-sm resize-none focus-visible:ring-2 focus-visible:ring-offset-2",
                isDark
                  ? "bg-gray-900 border-gray-800 focus-visible:ring-indigo-500"
                  : "bg-white border-gray-200 focus-visible:ring-indigo-500"
              )}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={cn(
                "px-4 py-2 text-sm rounded-md",
                isDark
                  ? "text-gray-300 hover:bg-gray-800"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm rounded-md text-white",
                isSubmitting
                  ? "bg-indigo-600/50 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              )}
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {agent ? "Save Changes" : "Create Agent"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AgentModal;
