import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { cn } from "../../lib/utils";
import { Check, Bot, Sparkles, Plus, Loader2 } from "lucide-react";

import { fetchAgents, fetchPublicAgents } from "../../features/agents/agentsSlice";
import { resolveModel } from "../../../Constants";

interface AgentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selectedId: string | null;
  onSelect: (agent: any | null) => void;
  isDark: boolean;
  token: string;
  position?: "top" | "bottom";
  align?: "left" | "right";
}

const AgentMenu: React.FC<AgentMenuProps> = ({
  isOpen,
  onClose,
  selectedId,
  onSelect,
  isDark,
  token,
  position = "bottom",
  align = "left",
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Tabs state
  const [activeTab, setActiveTab] = useState<"personal" | "public">("personal");

  // Select Agents directly from Redux
  const { items: agents, publicItems, isLoading, isPublicLoading, publicError } = useAppSelector(
    (state: any) => state.agents
  );

  // Positioning State
  const [coords, setCoords] = useState<{
    top?: number;
    left?: number;
    bottom?: number;
  } | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  // Reset tab when closing/opening
  useEffect(() => {
    if (!isOpen) {
      setActiveTab("personal");
    }
  }, [isOpen]);

  // 1. Calculate Position
  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const parent = anchorRef.current.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        const newCoords: any = {};

        // Horizontal
        if (align === "left") {
          newCoords.left = rect.left;
        } else {
          newCoords.left = rect.right - 256;
        }

        // Vertical
        if (position === "bottom") {
          newCoords.bottom = window.innerHeight - rect.top + 8;
          newCoords.top = "auto";
        } else {
          newCoords.top = rect.bottom + 8;
          newCoords.bottom = "auto";
        }
        setCoords(newCoords);
      }
    }
  }, [isOpen, align, position]);

  // 2. FETCH AGENTS ON OPEN (If list is empty)
  useEffect(() => {
    if (isOpen && token) {
      // If we have no agents and aren't currently loading, fetch them!
      if ((!agents || agents.length === 0) && !isLoading) {
        // Dispatch the Thunk to fetch from backend -> set to Redux
        dispatch(fetchAgents(token) as any);
      }
    }
  }, [isOpen, token, agents?.length, isLoading, dispatch]);

  // 3. FETCH PUBLIC AGENTS ON OPEN/TAB SWITCH (If list is empty)
  useEffect(() => {
    if (isOpen && activeTab === "public" && token) {
      if ((!publicItems || publicItems.length === 0) && !isPublicLoading) {
        dispatch(fetchPublicAgents(token) as any);
      }
    }
  }, [isOpen, activeTab, token, publicItems?.length, isPublicLoading, dispatch]);

  // Keep anchor in DOM
  if (!isOpen) return <div ref={anchorRef} className="hidden" />;

  return (
    <>
      <div ref={anchorRef} className="hidden" />
      {createPortal(
        <div
          className="font-sans text-base antialiased"
          style={{ zIndex: 99999 }}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-transparent cursor-default"
            style={{ zIndex: 99998 }}
            onClick={onClose}
          />

          {/* Menu Container */}
          <div
            style={{
              position: "fixed",
              ...coords,
              zIndex: 99999,
            }}
            className={cn(
              "w-64 p-2 rounded-xl border shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200",
              isDark
                ? "bg-[#18161C]/95 border-[#2A2830] shadow-black/50"
                : "bg-white/95 border-gray-200 shadow-lg"
            )}
          >
            <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              <span>Select AI Agent</span>
              {(isLoading || isPublicLoading) && (
                <Loader2 size={12} className="animate-spin text-indigo-500" />
              )}
            </div>

            {/* Tabs Selector */}
            <div className={cn(
              "flex p-0.5 rounded-lg mb-2 border",
              isDark ? "border-[#2A2830] bg-[#161618]" : "border-gray-100 bg-gray-50"
            )}>
              <button
                type="button"
                onClick={() => setActiveTab("personal")}
                className={cn(
                  "flex-1 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer",
                  activeTab === "personal"
                    ? isDark
                      ? "bg-zinc-800 text-white font-bold shadow-sm"
                      : "bg-white text-zinc-950 shadow-sm font-bold"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300"
                )}
              >
                Personal
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("public")}
                className={cn(
                  "flex-1 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer",
                  activeTab === "public"
                    ? isDark
                      ? "bg-zinc-800 text-white font-bold shadow-sm"
                      : "bg-white text-zinc-950 shadow-sm font-bold"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300"
                )}
              >
                Public
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              {activeTab === "personal" ? (
                <>
                  {/* Standard Chat Option */}
                  <button
                    onClick={() => {
                      onSelect(null);
                      onClose();
                    }}
                    className={cn(
                      "w-full px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between mb-1 group hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white hover:shadow-sm  hover:duration-150 hover:ease-in hover:cursor-pointer",
                      !selectedId
                        ? isDark
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-blue-50 text-blue-600"
                        : isDark
                        ? "text-gray-300 hover:bg-white/5"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Bot
                        size={16}
                        className={!selectedId ? "text-blue-500" : "text-gray-400"}
                      />
                      <span className="font-medium">Standard Chat</span>
                    </div>
                    {!selectedId && <Check size={14} className="shrink-0" />}
                  </button>

                  {/* Personal Agents List */}
                  {agents && agents.length > 0
                    ? agents.map((agent: any) => {
                        const isSelected = selectedId === agent.gpt_id;
                        return (
                          <button
                            key={agent.gpt_id}
                            onClick={() => {
                              onSelect(agent);
                              onClose();
                            }}
                            className={cn(
                              "w-full px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between mb-1 group hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white hover:shadow-sm  hover:duration-150 hover:ease-in hover:cursor-pointer",
                              isSelected
                                ? isDark
                                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                  : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                                : isDark
                                ? "text-gray-300 hover:bg-white/5 border border-transparent"
                                : "text-gray-700 hover:bg-gray-100 border border-transparent"
                            )}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Sparkles
                                size={14}
                                className={
                                  isSelected
                                    ? "text-indigo-500"
                                    : "text-gray-400 opacity-50"
                                }
                              />
                              <div className="flex flex-col items-start truncate">
                                <span className="font-medium truncate max-w-[140px]">
                                  {agent.name}
                                </span>
                                <span className="text-[10px] opacity-60 uppercase">
                                  {resolveModel(agent.recommended_model || agent.model).label}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <Check size={14} className="shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })
                    : !isLoading && (
                        <div className="px-3 py-4 text-xs text-center text-gray-505">
                          No personal agents found.
                        </div>
                      )}
                </>
              ) : (
                <>
                  {/* Public Agents List */}
                  {isPublicLoading && (!publicItems || publicItems.length === 0) ? (
                    <div className="flex items-center justify-center py-6 text-xs text-gray-505 gap-2">
                      <Loader2 size={14} className="animate-spin text-indigo-500" />
                      <span>Loading public agents...</span>
                    </div>
                  ) : publicError ? (
                    <div className="px-3 py-4 text-xs text-center text-red-500">
                      {publicError}
                    </div>
                  ) : publicItems && publicItems.length > 0 ? (
                    publicItems.map((agent: any) => {
                      const isSelected = selectedId === agent.gpt_id;
                      return (
                        <button
                          key={agent.gpt_id}
                          onClick={() => {
                            onSelect(agent);
                            onClose();
                          }}
                          className={cn(
                            "w-full px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between mb-1 group hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white hover:shadow-sm  hover:duration-150 hover:ease-in hover:cursor-pointer",
                            isSelected
                              ? isDark
                                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                              : isDark
                              ? "text-gray-300 hover:bg-white/5 border border-transparent"
                              : "text-gray-700 hover:bg-gray-100 border border-transparent"
                          )}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Sparkles
                              size={14}
                              className={
                                isSelected
                                  ? "text-indigo-500"
                                  : "text-gray-400 opacity-50"
                              }
                            />
                            <div className="flex flex-col items-start truncate">
                              <span className="font-medium truncate max-w-[140px]">
                                {agent.name}
                              </span>
                              <span className="text-[10px] opacity-60 uppercase">
                                {resolveModel(agent.recommended_model || agent.model).label}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <Check size={14} className="shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-3 py-4 text-xs text-center text-gray-505">
                      No public agents found.
                    </div>
                  )}
                </>
              )}

              {/* Create New Agent button - only show under Personal tab when not loading */}
              {activeTab === "personal" && !isLoading && (
                <button
                  onClick={() => {
                    onClose();
                    navigate("/agents");
                  }}
                  className={cn(
                    "w-full px-3 py-3 mt-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2 border border-dashed hover:shadow-sm hover:duration-150 hover:ease-in hover:cursor-pointer",
                    isDark
                      ? "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                      : "border-zinc-200 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
                  )}
                >
                  <Plus size={14} />
                  <span>Create New Agent</span>
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default AgentMenu;
