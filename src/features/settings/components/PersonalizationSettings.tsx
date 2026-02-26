import React from "react";
import { Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";

interface PersonalizationSettingsProps {
  isDark?: boolean;
}

const PersonalizationSettings: React.FC<PersonalizationSettingsProps> = ({ isDark }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div 
        className={cn(
          "p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200",
          isDark 
            ? "bg-white/5 border-white/10 hover:bg-white/10" 
            : "bg-white border-gray-200 shadow-sm hover:shadow-md"
        )}
        onClick={() => navigate("/settings/personalization")}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-lg flex items-center justify-center",
            isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600"
          )}>
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h4 className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
              Personalization Dashboard
            </h4>
            <p className={cn(
              "text-sm mt-0.5",
              isDark ? "text-gray-400" : "text-gray-500"
            )}>
              View memory stats, toggle extraction, and manage remembered data.
            </p>
          </div>
        </div>
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
          isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
        )}>
          &rarr;
        </div>
      </div>
    </div>
  );
};

export default PersonalizationSettings;
