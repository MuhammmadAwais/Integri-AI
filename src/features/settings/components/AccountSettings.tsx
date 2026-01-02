import React, { useState, useRef, useEffect } from "react";
import { Loader2, Camera, User } from "lucide-react";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import { cn } from "../../../lib/utils";
import { useAppSelector, useAppDispatch } from "../../../hooks/useRedux";
import { auth, db, storage } from "../../../app/firebase";
import { setAuthUser } from "../../../features/auth/slices/authSlice";
import Button from "../../../Components/ui/Button";
import { COUNTRIES } from "../../../../Constants";

const AccountSettings: React.FC = () => {
  const { isDark } = useAppSelector((state: any) => state.theme);
  const { user, accessToken } = useAppSelector((state: any) => state.auth);
  const dispatch = useAppDispatch();

  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.name || "");
      setCountry(user.country || "");
      setPreviewImage(user.avatar || null);
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

      // Preview
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
      // Upload to Firebase Storage
      const storageRef = ref(storage, `avatars/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // 1. Update Auth Profile
      await updateProfile(currentUser, { photoURL: downloadURL });

      // 2. Update Firestore (so it persists across sessions as "custom")
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(userRef, { photoURL: downloadURL }, { merge: true });

      // 3. Update Redux
      dispatch(
        setAuthUser({
          user: { ...user, avatar: downloadURL },
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
      // 1. Update Auth Display Name
      if (currentUser.displayName !== displayName) {
        await updateProfile(currentUser, { displayName });
      }

      // 2. Update Firestore (Name & Country)
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(
        userRef,
        { name: displayName, country: country },
        { merge: true }
      );

      // 3. Update Redux
      dispatch(
        setAuthUser({
          user: { ...user, name: displayName, country: country },
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

  return (
    <form onSubmit={handleUpdateProfile} className="space-y-8 max-w-xl">
      {/* Profile Image */}
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

      {/* Name */}
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

      {/* Country */}
      <div>
        <label
          className={cn(
            "block text-sm font-medium mb-1.5",
            isDark ? "text-gray-300" : "text-gray-700"
          )}
        >
          Country
        </label>
        <div className="relative ">
          <select
            title="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={cn(
              "w-full px-4 py-2.5  rounded-xl border outline-none transition-all appearance-none",
              isDark
                ? "bg-[#222] border-[#333] focus:border-blue-500 text-white"
                : "bg-white border-gray-300 focus:border-blue-500 text-gray-900"
            )}
          >
            <option value="" disabled>
              Select your country
            </option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
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
  );
};

export default AccountSettings;
