import React from "react";
import { cn } from "../../../lib/utils";
import { useAppSelector } from "../../../hooks/useRedux";
import Button from "../../../Components/ui/Button";

const SubscriptionSettings: React.FC = () => {
  const isDark = useAppSelector((state: any) => state.theme.isDark);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-6 border transition-all",
        isDark
          ? "bg-linear-to-br from-blue-900/20 to-[#18181b] border-blue-900/30"
          : "bg-linear-to-br from-blue-50 to-white border-blue-100"
      )}
    >
      <div
        className={cn(
          "absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-30",
          isDark ? "bg-blue-500" : "bg-blue-300"
        )}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
                isDark ? "bg-blue-500 text-white" : "bg-blue-600 text-white"
              )}
            >
              Free Plan
            </span>
          </div>
          <h3
            className={cn(
              "text-xl font-bold",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            Upgrade to Integri Pro
          </h3>
          <p
            className={cn(
              "mt-1 text-sm max-w-md",
              isDark ? "text-gray-400" : "text-gray-500"
            )}
          >
            Unlock advanced models (GPT-4, Claude 3), unlimited file uploads,
            voice mode, and priority support.
          </p>
        </div>
        <Button className="shrink-0">Manage Subscription</Button>
      </div>
    </div>
  );
};

export default SubscriptionSettings;
