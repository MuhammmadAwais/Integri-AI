import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, Lock, User, ArrowRight, Chrome, Phone } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import {
  registerUser,
  loginWithGoogle,
} from "../features/auth/thunks/authThunk";
import AuthLayout from "../Components/layout/AuthLayout";
import AuthInput from "../features/auth/components/AuthInput";
import AuthButton from "../features/auth/components/AuthButton";
import NewUserBlockedModal from "../features/auth/components/NewUserBlockedModal";

// Device detection function
function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || navigator.vendor;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    ua.toLowerCase()
  );
}

const Signup: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "", // Optional, text only now
  });
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  // Redirect desktop users to QR code signup page
  useEffect(() => {
    // Only redirect if not already on QR page and not on mobile
    if (!isMobileDevice() && location.pathname === "/signup") {
      navigate("/signup-qr", { replace: true });
    }
  }, [navigate, location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError(t("signup.passwordsDoNotMatch"));
      return;
    }

    // Register without Country/Language (handled in GettingStarted)
    const result = await dispatch(
      registerUser({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        // @ts-ignore - Thunk updated to accept optional phone
        phoneNumber: formData.phoneNumber,
      })
    );

    if (registerUser.fulfilled.match(result)) {
      navigate("/getting-started");
    }
  };

  const handleGoogleLogin = async () => {
    const result = await dispatch(loginWithGoogle());
    if (loginWithGoogle.fulfilled.match(result)) {
      navigate("/getting-started");
    } else if (loginWithGoogle.rejected.match(result)) {
      const payload = result.payload as any;
      if (payload === "NEW_USER_BLOCKED") {
        setShowBlockedModal(true);
      }
    }
  };

  return (
    <AuthLayout
      title={t("signup.title")}
      subtitle={t("signup.subtitle")}
      logoTitleHorizontal={true}
    >
      <NewUserBlockedModal
        isOpen={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
      />
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label={t("signup.fullName")}
          type="text"
          placeholder={t("signup.fullNamePlaceholder")}
          icon={User}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <AuthInput
          label={t("signup.email")}
          type="email"
          placeholder={t("signup.emailPlaceholder")}
          icon={Mail}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <AuthInput
          label={t("signup.phoneOptional")}
          type="tel"
          placeholder={t("signup.phonePlaceholder")}
          icon={Phone}
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
        />

        <AuthInput
          label={t("signup.password")}
          type="password"
          placeholder={t("signup.passwordPlaceholder")}
          icon={Lock}
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
        <AuthInput
          label={t("signup.confirmPassword")}
          type="password"
          placeholder={t("signup.confirmPasswordPlaceholder")}
          icon={Lock}
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          required
        />

        {error ||
          (confirmPasswordError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl text-center">
              {error || confirmPasswordError}
            </div>
          ))}

        <div className="flex flex-row gap-4 mt-4">
          <AuthButton
            isLoading={isLoading}
            variant="createAccount"
            className="hover:cursor-pointer flex-1"
          >
            {t("signup.createAccount")} <ArrowRight size={18} />
          </AuthButton>

          <AuthButton
            type="button"
            variant="google"
            className="hover:cursor-pointer px-6"
            onClick={handleGoogleLogin}
          >
            <Chrome size={18} className="text-white" />
          </AuthButton>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t("signup.alreadyHaveAccount")}{" "}
          <Link
            to="/login"
            className="text-[#5EEAD4] hover:text-[#8FF0E0] font-semibold transition-colors hover:cursor-pointer"
          >
            {t("signup.signInLink")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Signup;
