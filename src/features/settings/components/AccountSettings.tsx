import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { cn } from "../../../lib/utils";
import { useAppSelector, useAppDispatch } from "../../../hooks/useRedux";
import { auth, db } from "../../../app/firebase";
import { setAuthUser } from "../../../features/auth/slices/authSlice"; // Import the action
import Button from "../../../Components/ui/Button";

const AccountSettings: React.FC = () => {
  const { isDark } = useAppSelector((state: any) => state.theme);
  const user = useAppSelector((state: any) => state.auth.user);
  const dispatch = useAppDispatch();

  const [displayName, setDisplayName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation
    if (!displayName.trim()) {
      toast.warn("Username cannot be empty");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("You must be logged in to update your profile.");
      return;
    }

    setIsUploading(true);
    try {
      const newName = displayName.trim();

      // 2. Update Auth Profile (Firebase)
      await updateProfile(currentUser, {
        displayName: newName,
      });

      // 3. Update Firestore
      if (user?.id) {
        const userRef = doc(db, "users", user.id);
        await setDoc(userRef, { displayName: newName }, { merge: true });
      }

      // 4. INSTANT APP UPDATE (Dispatch to Redux)
      if (user) {
        dispatch(
          setAuthUser({
            user: { ...user, name: newName },
            accessToken: auth.currentUser
              ? await auth.currentUser.getIdToken()
              : null,
          })
        );
      }

      // 5. Success Feedback & Clear Input
      toast.success("Username updated successfully!", {
        theme: isDark ? "dark" : "light",
      });
      setDisplayName("");
    } catch (error: any) {
      console.error("Profile Update Error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpdateProfile} className="max-w-md space-y-4">
      <div>
        <label
          className={cn(
            "block text-sm font-medium mb-1.5",
            isDark ? "text-gray-300" : "text-gray-700"
          )}
        >
          Display Name
        </label>
        <div className="relative">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={cn(
              "w-full px-4 py-2.5 rounded-xl border outline-none transition-all",
              isDark
                ? "bg-[#222] border-[#333] focus:border-blue-500 text-white placeholder:text-gray-500"
                : "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-900"
            )}
            placeholder={user?.name || "Enter new name"}
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isUploading || !displayName.trim()}>
          {isUploading ? (
            <Loader2 className="animate-spin mr-2" size={18} />
          ) : null}
          Save Changes
        </Button>
        <div
          className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-400")}
        >
          Current:{" "}
          <span className="font-medium text-blue-500">{user?.name}</span>
        </div>
      </div>
    </form>
  );
};

export default AccountSettings;
