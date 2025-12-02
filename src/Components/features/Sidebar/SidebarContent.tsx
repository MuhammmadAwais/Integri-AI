import React from "react";
import SidebarHeader from "./SidebarHeader";
import ChatList from "./ChatList";
import UserProfile from "./UserProfile";
import { useAppSelector } from "../../hooks/useRedux";
import { cn } from "../../../utils/cn";

const SidebarContent: React.FC = () => {
  const isDark = useAppSelector((state) => state.theme.isDark);

  return (
    <div
      className={cn(
        "flex flex-col h-full w-full",
        isDark ? "bg-[#171717] text-gray-100" : "bg-[#F9F9FA] text-gray-900"
      )}
    >
      <SidebarHeader />
      <ChatList />
      <UserProfile />
    </div>
  );
};

export default SidebarContent;
