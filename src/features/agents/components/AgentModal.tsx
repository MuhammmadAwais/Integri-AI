import React, { useState, useEffect } from "react";
import { X, Loader2, Bot, Plus } from "lucide-react";
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
    model: "integri",
  });

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
          model: agent.recommended_model || agent.model || "integri",
        });
        setConversationStarters(agent.conversation_starters || []);
      } else {
        setFormData({
          name: "",
          description: "",
          instructions: "",
          model: "integri",
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

      if (agent) await AgentService.updateAgent(token, agent.gpt_id, payload);
      else await AgentService.createAgent(token, payload);

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to save agent.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = cn(
    "flex w-full border px-4 py-3 text-sm font-medium transition-all outline-none",
    isDark
      ? "bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-white focus:bg-black"
      : "bg-zinc-50 border-zinc-200 text-black placeholder:text-zinc-400 focus:border-black focus:bg-white"
  );

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 border p-8 shadow-2xl animate-in fade-in-0 zoom-in-95",
          isDark ? "bg-black border-zinc-800" : "bg-white border-zinc-200"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 border",
                isDark
                  ? "border-zinc-700 bg-zinc-900"
                  : "border-zinc-200 bg-zinc-100"
              )}
            >
              <Bot size={20} className={isDark ? "text-white" : "text-black"} />
            </div>
            <h2
              className={cn(
                "text-xl font-bold tracking-tight uppercase",
                isDark ? "text-white" : "text-black"
              )}
            >
              {agent ? "Edit Protocol" : "New Agent"}
            </h2>
          </div>
          <button
          title="button"
            onClick={onClose}
            className={cn(
              "p-1 hover:rotate-90 transition-transform",
              isDark ? "text-white" : "text-black"
            )}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name & Desc */}
          <div className="space-y-4">
            <input
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="AGENT DESIGNATION (NAME)"
              className={inputClass}
            />
            <input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="OPERATIONAL BRIEF (DESCRIPTION)"
              className={inputClass}
            />
          </div>

          {/* Model Select */}
          <div>
            <select
              title="select"
              value={formData.model}
              onChange={(e) =>
                setFormData({ ...formData, model: e.target.value })
              }
              className={inputClass}
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Instructions */}
          <textarea
            required
            rows={4}
            value={formData.instructions}
            onChange={(e) =>
              setFormData({ ...formData, instructions: e.target.value })
            }
            placeholder="SYSTEM DIRECTIVES (INSTRUCTIONS)"
            className={cn(inputClass, "resize-none")}
          />

          {/* Starters */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                value={conversationStarter}
                onChange={(e) => setConversationStarter(e.target.value)}
                placeholder="ADD COMMAND PROTOCOL (STARTER)"
                className={inputClass}
              />
              <button
              title="button"
                type="button"
                onClick={() => {
                  if (!conversationStarter.trim()) return;
                  setConversationStarters([
                    ...conversationStarters,
                    conversationStarter.trim(),
                  ]);
                  setConversationStarter("");
                }}
                className={cn(
                  "px-4 border transition-colors",
                  isDark
                    ? "border-zinc-700 hover:bg-white hover:text-black"
                    : "border-zinc-300 hover:bg-black hover:text-white"
                )}
              >
                <Plus size={20} />
              </button>
            </div>
            {conversationStarters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {conversationStarters.map((starter, index) => (
                  <span
                    key={index}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1 text-xs font-mono uppercase border",
                      isDark
                        ? "border-zinc-800 bg-zinc-900 text-zinc-300"
                        : "border-zinc-200 bg-zinc-50 text-zinc-600"
                    )}
                  >
                    {starter}
                    <button
                      type="button"
                      onClick={() =>
                        setConversationStarters((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 text-sm font-mono text-red-500 border border-red-500/20 bg-red-500/5">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={cn(
                "px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors",
                isDark
                  ? "text-zinc-500 hover:text-white"
                  : "text-zinc-500 hover:text-black"
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "px-8 py-3 text-sm font-bold uppercase tracking-widest transition-all",
                isDark
                  ? "bg-white text-black hover:bg-zinc-200"
                  : "bg-black text-white hover:bg-zinc-800"
              )}
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : agent ? (
                "Save System"
              ) : (
                "Deploy Agent"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AgentModal;
