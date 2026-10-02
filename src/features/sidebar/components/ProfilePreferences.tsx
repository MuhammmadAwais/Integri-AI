import React, { useState } from "react";
import { Check, ChevronDown, Languages, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../../hooks/useRedux";
import { toggleTheme } from "../../theme/themeSlice";
import { cn } from "../../../lib/utils";
import i18n, {
  persistLocale,
  supportedLngs,
  languageMetadata,
  type SupportedLocale,
} from "../../../i18n";

/**
 * Theme + language, moved out of the top bar into the profile menu (where
 * ChatGPT and Gemini keep them). Language expands inline so the menu stays
 * a single popover.
 */
const ProfilePreferences: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector((state) => state.theme.isDark);
  const [langOpen, setLangOpen] = useState(false);
  const current = (i18n.language as SupportedLocale) in languageMetadata ? (i18n.language as SupportedLocale) : "en";

  const row = cn(
    "w-full text-left px-4 py-2 text-sm flex items-center gap-2 cursor-pointer transition-colors",
    isDark ? "text-gray-300 hover:bg-white/5" : "text-gray-700 hover:bg-gray-50"
  );

  return (
    <div className={cn("border-b py-1", isDark ? "border-gray-700/50" : "border-gray-100")}>
      <button type="button" className={row} onClick={() => dispatch(toggleTheme())}>
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
        <span className="flex-1">{isDark ? t("profile.lightMode", "Light mode") : t("profile.darkMode", "Dark mode")}</span>
      </button>

      <button type="button" className={row} onClick={() => setLangOpen(!langOpen)} aria-expanded={langOpen}>
        <Languages size={16} />
        <span className="flex-1">{t("profile.language", "Language")}</span>
        <span className="text-xs opacity-70">
          {languageMetadata[current].flag} {languageMetadata[current].name}
        </span>
        <ChevronDown size={14} className={cn("opacity-60 transition-transform", langOpen && "rotate-180")} />
      </button>

      {langOpen && (
        <div className="max-h-56 overflow-y-auto pb-1">
          {supportedLngs.map((lng) => {
            const meta = languageMetadata[lng];
            const selected = lng === current;
            return (
              <button
                key={lng}
                type="button"
                onClick={() => {
                  i18n.changeLanguage(lng);
                  persistLocale(lng);
                  setLangOpen(false);
                }}
                className={cn(row, "pl-10 py-1.5", selected && "font-medium")}
              >
                <span>{meta.flag}</span>
                <span className="flex-1">{meta.name}</span>
                {selected && <Check size={14} className="text-(--integri-accent-600)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfilePreferences;
