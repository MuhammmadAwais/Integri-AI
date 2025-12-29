import React from "react";
import { motion , type Variants } from "framer-motion";
import { cn } from "../../../lib/utils"; // Adjust path if needed relative to folder

interface SettingsSectionProps {
  icon: any;
  title: string;
  description?: string;
  children: React.ReactNode;
  isDark: boolean;
}

const itemVariants : Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

const SettingsSection: React.FC<SettingsSectionProps> = ({
  icon: Icon,
  title,
  children,
  description,
  isDark,
}) => {
  return (
    <motion.section
      variants={itemVariants}
      className={cn(
        "rounded-2xl border p-6 transition-all duration-300 mb-6",
        isDark
          ? "bg-[#18181b] border-[#27272a]"
          : "bg-white border-gray-200 shadow-sm"
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className={cn(
            "p-2 rounded-lg",
            isDark ? "bg-[#424247] text-blue-400" : "bg-blue-50 text-blue-600"
          )}
        >
          <Icon size={20} className="bg-transparent" />
        </div>
        <div>
          <h2
            className={cn(
              "text-lg font-semibold",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            {title}
          </h2>
          {description && (
            <p
              className={cn(
                "text-sm mt-0.5",
                isDark ? "text-gray-400" : "text-gray-500"
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="pl-0 md:pl-11">{children}</div>
    </motion.section>
  );
};

export default SettingsSection;
