import React, { useState, useRef, useEffect } from "react";
import { Loader2, Camera, User, Trash2, AlertTriangle } from "lucide-react";
import { updateProfile, deleteUser } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import { cn } from "../../../lib/utils";
import { useAppSelector, useAppDispatch } from "../../../hooks/useRedux";
import { auth, db, storage } from "../../../app/firebase";
import { setAuthUser } from "../../../features/auth/slices/authSlice";
import Button from "../../../Components/ui/Button";
import { COUNTRIES, LANGUAGES } from "../../../../Constants";
import { logoutUser } from "../../auth/thunks/authThunk";
import { useNavigate } from "react-router-dom";
import DeletionModal from "./DeletionModal"; // Import the new modal

const AccountSettings: React.FC = () => {
  const { isDark } = useAppSelector((state: any) => state.theme);
  const { user, accessToken } = useAppSelector((state: any) => state.auth);
  const dispatch = useAppDispatch();

  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setDisplayName(user.name || "");
      setCountry(user.country || "");
      setLanguage(user.language || "en");
      setPreviewImage(user.profile || null);
    }
  }, [user]);

  // Handle Image Upload
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);

      await uploadProfileImage(file);
    }
  };

  const uploadProfileImage = async (file: File) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      setIsUploading(true);
      const storageRef = ref(storage, `profiles/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await updateProfile(currentUser, { photoURL: downloadURL });

      const userRef = doc(db, "Users", currentUser.uid);
      await setDoc(userRef, { photoURL: downloadURL }, { merge: true });

      dispatch(
        setAuthUser({
          user: { ...user, profile: downloadURL },
          accessToken,
        })
      );

      toast.success("Profile picture updated!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      toast.warn("Username cannot be empty");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setIsUploading(true);
    try {
      if (currentUser.displayName !== displayName) {
        await updateProfile(currentUser, { displayName });
      }

      const userRef = doc(db, "Users", currentUser.uid);
      await setDoc(
        userRef,
        {
          name: displayName,
          country: country,
          language: language,
        },
        { merge: true }
      );

      dispatch(
        setAuthUser({
          user: {
            ...user,
            name: displayName,
            country: country,
            language: language,
          },
          accessToken: accessToken,
        })
      );

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsUploading(false);
    }
  };

  // Logic executed when user types 'delete' and confirms in the modal
  const handleConfirmDelete = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setIsDeleting(true);
      try {
        await deleteUser(currentUser);
        dispatch(logoutUser());
        toast.success("Account deleted successfully.");
        navigate("/login");
      } catch (error: any) {
        console.error("Error deleting account:", error);
        setIsDeleteModalOpen(false); // Close modal on error to show toast
        if (error.code === "auth/requires-recent-login") {
          toast.error(
            "Security requires you to re-login before deleting your account."
          );
        } else {
          toast.error("Failed to delete account. Please try again.");
        }
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="max-w-xl space-y-12">
      <DeletionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDark={isDark}
        isLoading={isDeleting}
      />

      <form onSubmit={handleUpdateProfile} className="space-y-8">
        {/* Profile Image Section */}
        <div className="flex flex-col gap-4">
          <label
            className={cn(
              "block text-sm font-medium",
              isDark ? "text-gray-300" : "text-gray-700"
            )}
          >
            Profile Picture
          </label>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div
                className={cn(
                  "w-24 h-24 rounded-full overflow-hidden border-2 flex items-center justify-center",
                  isDark
                    ? "border-zinc-700 bg-zinc-800"
                    : "border-gray-200 bg-gray-100"
                )}
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User
                    size={32}
                    className={isDark ? "text-zinc-500" : "text-gray-400"}
                  />
                )}
              </div>

              <button
                title="button"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="text-white" size={20} />
              </button>
              <input
                title="file"
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageSelect}
              />
            </div>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  " text-sm font-medium px-4 py-2 rounded-lg border transition-all hover:cursor-pointer",
                  isDark
                    ? "border-zinc-700 hover:bg-zinc-800 text-gray-200"
                    : "border-gray-300 hover:bg-gray-50 text-gray-700"
                )}
              >
                Change Picture
              </button>
              <p className="text-xs text-gray-500">
                JPG, GIF or PNG. Max size of 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label
            className={cn(
              "block text-sm font-medium mb-1.5",
              isDark ? "text-gray-300" : "text-gray-700"
            )}
          >
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={cn(
              "w-full px-4 py-2.5 rounded-xl border outline-none transition-all",
              isDark
                ? "bg-[#222] border-[#333] focus:border-blue-500 text-white"
                : "bg-white border-gray-300 focus:border-blue-500 text-gray-900"
            )}
            placeholder="Enter your name"
          />
        </div>

        {/* Country Selector */}
        <div>
          <label
            className={cn(
              "block text-sm font-medium mb-1.5",
              isDark ? "text-gray-300" : "text-gray-700"
            )}
          >
            Country
          </label>
          <div className="relative">
            <select
              title="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={cn(
                "w-full px-4 py-2.5 rounded-xl border outline-none transition-all appearance-none cursor-pointer",
                isDark
                  ? "bg-[#222] border-[#333] focus:border-blue-500 text-white"
                  : "bg-white border-gray-300 focus:border-blue-500 text-gray-900"
              )}
            >
              <option value="" disabled>
                Select your country
              </option>
              {COUNTRIES.map((c: any) => (
                <option key={c.code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Language Selector */}
        <div>
          <label
            className={cn(
              "block text-sm font-medium mb-1.5",
              isDark ? "text-gray-300" : "text-gray-700"
            )}
          >
            Language
          </label>
          <div className="relative">
            <select
              title="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={cn(
                "w-full px-4 py-2.5 rounded-xl border outline-none transition-all appearance-none cursor-pointer",
                isDark
                  ? "bg-[#222] border-[#333] focus:border-blue-500 text-white"
                  : "bg-white border-gray-300 focus:border-blue-500 text-gray-900"
              )}
            >
              <option value="" disabled>
                Select your language
              </option>
              {LANGUAGES.map((l: any) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-200/10">
          <Button
            className="bg-[#696969] hover:bg-gray-500"
            type="submit"
            disabled={isUploading || !displayName.trim()}
          >
            {isUploading ? (
              <Loader2 className="animate-spin mr-2 " size={18} />
            ) : null}
            Save Changes
          </Button>
        </div>
      </form>

      {/* --- Danger Zone (Delete Account) --- */}
      <div
        className={cn(
          "rounded-xl border p-6 space-y-4",
          isDark ? "border-red-900/30 bg-red-900/5" : "border-red-200 bg-red-50"
        )}
      >
        <div className="flex items-center gap-2 text-red-600 dark:text-red-500">
          <AlertTriangle size={20} />
          <h3 className="font-bold text-lg">Danger Zone</h3>
        </div>
        <p
          className={cn("text-sm", isDark ? "text-zinc-400" : "text-gray-600")}
        >
          Deleting your account is permanent. All your data, sessions, and
          agents will be wiped immediately.
        </p>
        <button
          onClick={() => setIsDeleteModalOpen(true)} // Open modal instead of window.confirm
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all hover:cursor-pointer",
            isDark
              ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
              : "bg-red-100 text-red-600 hover:bg-red-200"
          )}
        >
          <Trash2 size={16} />
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default AccountSettings;
