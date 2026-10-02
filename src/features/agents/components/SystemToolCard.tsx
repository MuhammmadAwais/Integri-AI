import React from "react";
import { Link } from "react-router-dom";
import { Box } from "lucide-react";
import { cn } from "../../../lib/utils";
import { motion } from "framer-motion";

interface SystemToolCardProps {
  id: string;
  title: string;
  description: string;
  model: string;
  link: string;
  isDark: boolean;
}

const SystemToolCard: React.FC<SystemToolCardProps> = ({
  title,
  description,
  model,
  link,
  isDark,
}) => {
  return (
    <Link to={link} className="block group">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "relative flex flex-col h-[260px] p-6 rounded-2xl border transition-all duration-300 overflow-hidden",
          isDark
            ? "bg-[#07060A] border-white/10 hover:border-white/20 hover:bg-[#18161C]"
            : "bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"
        )}
      >
        {/* Subtle grid pattern background */}
        <div
          className={cn(
            "absolute inset-0 opacity-[0.03] pointer-events-none transition-opacity duration-300 group-hover:opacity-[0.06]",
            isDark
              ? "[background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]"
              : "[background-image:linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)]"
          )}
          style={{ backgroundSize: "24px 24px" }}
        />
        
        {/* Header Icon */}
        <div className="mb-4">
          <div
            className={cn(
              "w-12 h-12 flex items-center justify-center rounded-xl",
              isDark ? "bg-white/5" : "bg-gray-100"
            )}
          >
            <Box size={24} className={isDark ? "text-gray-300" : "text-gray-600"} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3
            className={cn(
              "text-lg font-bold mb-2",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              "text-sm leading-relaxed",
              isDark ? "text-gray-400" : "text-gray-600"
            )}
          >
            {description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex items-center">
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded",
              isDark ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-700"
            )}
          >
            {model}
          </span>
        </div>
      </motion.div>
    </Link>
  );
};

export default SystemToolCard;
