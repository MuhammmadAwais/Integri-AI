import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Loader2,
  Camera,
  User,
  Trash2,
  AlertTriangle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import {
  updateProfile,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithPopup,
} from "firebase/auth";
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
import DeletionModal from "./DeletionModal";
import ErrorModal from "../../../Components/ui/ErrorModal";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";

// --- HELPERS FOR CALENDAR ---
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();

const AccountSettings: React.FC = () => {
  const { isDark } = useAppSelector((state: any) => state.theme);
  const { user, accessToken } = useAppSelector((state: any) => state.auth);
  const dispatch = useAppDispatch();

  // --- FORM STATE ---
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // --- CALENDAR STATE ---
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<"days" | "years">("days");
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
    origin: "top",
  });

  // --- MODAL STATE ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    open: boolean;
    title?: string;
    message: string;
  }>({
    open: false,
    message: "",
  });

  // --- REFS ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const dateInputRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarGridRef = useRef<HTMLDivElement>(null);

  // --- INITIALIZE DATA ---
  useEffect(() => {
    if (user) {
      setDisplayName(user.name || "");
      setCountry(user.country || "");
      setLanguage(user.language || "en");
      setPreviewImage(user.profile || null);

      // Handle Date: Firestore Timestamp vs String vs Date object
      if (user.dateOfBirth) {
        if (
          typeof user.dateOfBirth === "object" &&
          "seconds" in user.dateOfBirth
        ) {
          // Firestore Timestamp
          setDateOfBirth(new Date(user.dateOfBirth.seconds * 1000));
        } else {
          // String or Date
          setDateOfBirth(new Date(user.dateOfBirth));
        }
      }
    }
  }, [user]);

  // --- CALENDAR LOGIC (GSAP + Positioning) ---

  // GSAP Stagger Animation
  useEffect(() => {
    if (showCalendar && calendarGridRef.current) {
      gsap.fromTo(
        calendarGridRef.current.children,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.015, ease: "power2.out" }
      );
    }
  }, [showCalendar, viewDate, calendarView]);

  // Smart Positioning
  useEffect(() => {
    const updatePosition = () => {
      if (showCalendar && dateInputRef.current) {
        const rect = dateInputRef.current.getBoundingClientRect();
        const CALENDAR_HEIGHT = 320;
        const GAP = 8;

        let top = rect.bottom + GAP;
        let origin = "top";

        if (top + CALENDAR_HEIGHT > window.innerHeight) {
          top = rect.top - CALENDAR_HEIGHT - GAP;
          origin = "bottom";
        }

        setCoords({
          top: top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          origin,
        });
      }
    };

    if (showCalendar) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showCalendar]);

  // Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dateInputRef.current &&
        dateInputRef.current.contains(event.target as Node)
      )
        return;
      if (
        calendarRef.current &&
        calendarRef.current.contains(event.target as Node)
      )
        return;

      setShowCalendar(false);
      setCalendarView("days");
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar]);

  // --- CALENDAR HANDLERS ---
  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
  };

  const selectDate = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setDateOfBirth(newDate);
    setShowCalendar(false);
  };

  const selectYear = (year: number) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(year);
    setViewDate(newDate);
    setCalendarView("days");
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(
      viewDate.getFullYear(),
      viewDate.getMonth()
    );
    const firstDay = getFirstDayOfMonth(
      viewDate.getFullYear(),
      viewDate.getMonth()
    );
    const days = [];

    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(
        viewDate.getFullYear(),
        viewDate.getMonth(),
        i
      );
      const isSelected =
        dateOfBirth &&
        currentDate.toDateString() === dateOfBirth.toDateString();
      const isToday = new Date().toDateString() === currentDate.toDateString();

      days.push(
        <button
          key={i}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            selectDate(i);
          }}
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all hover:cursor-pointer ",
            isSelected
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-bold"
              : isDark
              ? "hover:bg-zinc-800 text-zinc-300"
              : "hover:bg-gray-100 text-gray-700",
            isToday &&
              !isSelected &&
              "text-blue-500 font-bold border border-blue-500/30"
          )}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  const renderYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear; y >= currentYear - 100; y--) {
      years.push(
        <button
          key={y}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            selectYear(y);
          }}
          className={cn(
            "py-2 px-4 rounded-lg text-sm transition-all border border-transparent hover:cursor-pointer",
            viewDate.getFullYear() === y
              ? "bg-blue-600 text-white font-bold"
              : isDark
              ? "hover:bg-zinc-800 text-zinc-300"
              : "hover:bg-gray-100 text-gray-700"
          )}
        >
          {y}
        </button>
      );
    }
    return years;
  };

  // --- PROFILE HANDLERS ---
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
        setAuthUser({ user: { ...user, profile: downloadURL }, accessToken })
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
          dateOfBirth: dateOfBirth, // Update Date of Birth
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
            dateOfBirth: dateOfBirth,
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

  const getAuthProviderId = () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return "password";
    const isGoogle = currentUser.providerData.some(
      (p) => p.providerId === "google.com"
    );
    return isGoogle ? "google.com" : "password";
  };

  const handleConfirmDelete = async (email: string, password?: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) return;

    if (email.toLowerCase() !== currentUser.email.toLowerCase()) {
      setErrorModal({
        open: true,
        title: "Verification Failed",
        message: "Email does not match our records.",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const providerId = getAuthProviderId();
      if (providerId === "google.com") {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(currentUser, provider);
      } else {
        if (!password) {
          setErrorModal({
            open: true,
            title: "Missing Credentials",
            message: "Password is required to delete account.",
          });
          setIsDeleting(false);
          return;
        }
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          password
        );
        await reauthenticateWithCredential(currentUser, credential);
      }
      await deleteUser(currentUser);
      dispatch(logoutUser());
      navigate("/login");
      toast.success("Account deleted successfully.");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      setIsDeleteModalOpen(false);
      if (error.code === "auth/wrong-password") {
        setErrorModal({
          open: true,
          title: "Authentication Failed",
          message: "The password you entered is incorrect. Please try again.",
        });
      } else if (error.code === "auth/popup-closed-by-user") {
        setErrorModal({
          open: true,
          title: "Action Cancelled",
          message: "Google verification was cancelled.",
        });
      } else if (error.code === "auth/requires-recent-login") {
        setErrorModal({
          open: true,
          title: "Security Alert",
          message:
            "For your security, please log out and log back in before deleting your account.",
        });
      } else {
        setErrorModal({
          open: true,
          title: "Deletion Failed",
          message:
            error.message ||
            "An unexpected error occurred. Please try again later.",
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-xl space-y-12 pb-10">
      <DeletionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDark={isDark}
        isLoading={isDeleting}
        authProvider={getAuthProviderId()}
        currentUserEmail={auth.currentUser?.email || ""}
      />

      <ErrorModal
        isOpen={errorModal.open}
        onClose={() => setErrorModal({ ...errorModal, open: false })}
        title={errorModal.title}
        message={errorModal.message}
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
              <ChevronDown size={14} />
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
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        {/* Date of Birth Selector (New Feature) */}
        <div>
          <label
            className={cn(
              "block text-sm font-medium mb-1.5",
              isDark ? "text-gray-300" : "text-gray-700"
            )}
          >
            Date of Birth
          </label>
          <div
            ref={dateInputRef}
            onClick={() => {
              if (!showCalendar) {
                setShowCalendar(true);
                if (dateOfBirth) setViewDate(dateOfBirth);
              }
            }}
            className={cn(
              "w-full px-4 py-2.5 rounded-xl border outline-none transition-all cursor-pointer flex items-center justify-between",
              isDark
                ? "bg-[#222] border-[#333] hover:border-[#444] text-white"
                : "bg-white border-gray-300 hover:border-gray-400 text-gray-900",
              showCalendar && "border-blue-500 ring-1 ring-blue-500"
            )}
          >
            <div className="flex items-center gap-3">
              <CalendarIcon
                size={18}
                className={isDark ? "text-zinc-500" : "text-gray-400"}
              />
              <span
                className={cn(
                  "text-sm",
                  !dateOfBirth && (isDark ? "text-zinc-500" : "text-gray-400")
                )}
              >
                {dateOfBirth
                  ? dateOfBirth.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Select Date of Birth"}
              </span>
            </div>
            <ChevronDown
              size={16}
              className={cn(
                "transition-transform duration-200",
                isDark ? "text-zinc-500" : "text-gray-400",
                showCalendar && "rotate-180"
              )}
            />
          </div>

          {/* PORTAL: Calendar Dropdown */}
          {createPortal(
            <AnimatePresence>
              {showCalendar && (
                <motion.div
                  ref={calendarRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: "absolute",
                    top: coords.top,
                    left: coords.left,
                    width: coords.width || 300,
                    transformOrigin: coords.origin,
                  }}
                  className={cn(
                    "z-9999 p-4 rounded-xl border shadow-2xl backdrop-blur-xl",
                    isDark
                      ? "bg-[#18181b]/95 border-zinc-700"
                      : "bg-white/95 border-gray-200"
                  )}
                >
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-4">
                    {calendarView === "days" && (
                      <button
                      title="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          changeMonth(-1);
                        }}
                        className={cn(
                          "p-1 rounded-full transition-colors hover:cursor-pointer",
                          isDark
                            ? "hover:bg-zinc-800 text-zinc-400 hover:text-white"
                            : "hover:bg-gray-100 text-gray-500 hover:text-black"
                        )}
                      >
                        <ChevronLeft size={18} />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCalendarView(
                          calendarView === "days" ? "years" : "days"
                        );
                      }}
                      className={cn(
                        "font-semibold transition-colors flex items-center gap-1 mx-auto hover:cursor-pointer",
                        isDark
                          ? "text-white hover:text-blue-400"
                          : "text-gray-900 hover:text-blue-600"
                      )}
                    >
                      {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                      <ChevronDown
                        size={14}
                        className={cn(
                          "opacity-50 transition-transform",
                          calendarView === "years" && "rotate-180"
                        )}
                      />
                    </button>

                    {calendarView === "days" && (
                      <button
                      title="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          changeMonth(1);
                        }}
                        className={cn(
                          "p-1 rounded-full transition-colors hover:cursor-pointer",
                          isDark
                            ? "hover:bg-zinc-800 text-zinc-400 hover:text-white"
                            : "hover:bg-gray-100 text-gray-500 hover:text-black"
                        )}
                      >
                        <ChevronRight size={18} />
                      </button>
                    )}
                  </div>

                  {/* Calendar Body */}
                  <div ref={calendarGridRef}>
                    {calendarView === "days" ? (
                      <>
                        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                          {DAYS.map((day) => (
                            <div
                              key={day}
                              className={cn(
                                "text-[10px] font-bold uppercase tracking-wide ",
                                isDark ? "text-zinc-500" : "text-gray-400"
                              )}
                            >
                              {day}
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1 place-items-center">
                          {renderCalendarDays()}
                        </div>
                      </>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                        {renderYears()}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}
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
          onClick={() => setIsDeleteModalOpen(true)}
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
