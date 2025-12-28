import React from "react";
import { motion } from "framer-motion";
import { User, Palette, CreditCard, Download, HelpCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { useAppSelector } from "../hooks/useRedux";
import SettingsSection from "../features/settings/components/SettingsSection";
import AppearanceSettings from "../features/settings/components/AppearanceSettings";
import AccountSettings from "../features/settings/components/AccountSettings";
import SubscriptionSettings from "../features/settings/components/SubscriptionSettings";
import DownloadSettings from "../features/settings/components/DownloadSettings";
import HelpAndAbout from "../features/settings/components/HelpAndAbout";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const SettingsPage: React.FC = () => {
  const isDark = useAppSelector((state: any) => state.theme.isDark);

  return (
    // FIX SCROLL: Use h-full w-full with overflow-y-auto so it scrolls WITHIN the layout
    <div
      className={cn(
        "h-full w-full overflow-y-auto custom-scrollbar p-4 md:p-8 lg:p-12",
        isDark ? "bg-[#09090b] text-white" : "bg-gray-50 text-gray-900"
      )}
    >
      <div className="max-w-3xl mx-auto pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p
            className={cn(
              "text-muted-foreground mt-1",
              isDark ? "text-gray-400" : "text-gray-500"
            )}
          >
            Manage your account preferences and application settings.
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <SettingsSection
            icon={Palette}
            title="Appearance"
            description="Customize how Integri AI looks on your device."
            isDark={isDark}
          >
            <AppearanceSettings />
          </SettingsSection>

          <SettingsSection
            icon={User}
            title="Account"
            description="Update your profile details and personal information."
            isDark={isDark}
          >
            <AccountSettings />
          </SettingsSection>

          <SettingsSection
            icon={CreditCard}
            title="Subscription"
            description="Manage your plan, billing, and usage."
            isDark={isDark}
          >
            <SubscriptionSettings />
          </SettingsSection>

          <SettingsSection
            icon={Download}
            title="Get the App"
            description="Download Integri AI for all your devices."
            isDark={isDark}
          >
            <DownloadSettings />
          </SettingsSection>

          <SettingsSection
            icon={HelpCircle}
            title="Help & Support"
            description="Find answers, send feedback, or learn more about us."
            isDark={isDark}
          >
            <HelpAndAbout />
          </SettingsSection>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
