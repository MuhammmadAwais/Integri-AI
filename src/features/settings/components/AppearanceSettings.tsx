import React, { useState } from "react";
import { Sun, Moon, Monitor, Check, Loader2 } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { cn } from "../../../lib/utils";
import { useAppDispatch, useAppSelector } from "../../../hooks/useRedux";
import { setTheme } from "../../theme/themeSlice";
import { db } from "../../../app/firebase";

const AppearanceSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isDark} = useAppSelector((state: any) => state.theme); // Assuming theme slice has 'theme' ('light'|'dark'|'system')
  const user = useAppSelector((state: any) => state.auth.user);

  const [savingTheme, setSavingTheme] = useState<string | null>(null);

  const handleThemeChange = async (
    selectedTheme: "light" | "dark" | "system"
  ) => {
    // 1. Immediate UI Update
    const isDarkBoolean =
      selectedTheme === "dark" ||
      (selectedTheme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    dispatch(setTheme(isDarkBoolean));
    // Note: If your slice supports the string 'theme' prop, dispatch that too.

    setSavingTheme(selectedTheme);

    // 2. Persist to Firebase
    if (user?.id) {
      try {
        const userRef = doc(db, "users", user.id);
        await setDoc(userRef, { defaultTheme: selectedTheme }, { merge: true });
        toast.success(`Theme saved: ${selectedTheme}`, {
          theme: isDark ? "dark" : "light",
        });
      } catch (error) {
        console.error("Theme save error:", error);
        toast.error("Failed to save preference");
      }
    }
    setSavingTheme(null);
  };

  const ThemeCard = ({
    value,
    icon: Icon,
    label,
  }: {
    value: string;
    icon: any;
    label: string;
  }) => {
    // Simple check: if current redux state matches the value (you might need to adjust logic if your slice only stores boolean)
    const active =
      (value === "dark" && isDark) || (value === "light" && !isDark);
    const isSaving = savingTheme === value;

    return (
      <button
        onClick={() => handleThemeChange(value as any)}
        disabled={savingTheme !== null}
        className={cn(
          "flex-1 flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 relative text-left group hover:cursor-pointer",
          active
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
            : isDark
            ? "border-[#333] hover:border-gray-600 bg-[#222]"
            : "border-gray-100 hover:border-gray-300 bg-gray-50"
        )}
      >
        <div
          className={cn(
            "p-3 rounded-full mb-3 transition-colors",
            active
              ? "bg-blue-500 text-white"
              : isDark
              ? "bg-gray-800 text-gray-400"
              : "bg-white text-gray-500"
          )}
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Icon size={20} />
          )}
        </div>
        <span
          className={cn(
            "font-medium",
            isDark ? "text-gray-200" : "text-gray-700"
          )}
        >
          {label}
        </span>
        {active && (
          <div className="absolute top-2 right-2 text-blue-500">
            <Check size={16} strokeWidth={3} />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <ThemeCard value="light" icon={Sun} label="Light Mode" />
      <ThemeCard value="dark" icon={Moon} label="Dark Mode" />
      <ThemeCard value="system" icon={Monitor} label="System" />
    </div>
  );
};

export default AppearanceSettings;
