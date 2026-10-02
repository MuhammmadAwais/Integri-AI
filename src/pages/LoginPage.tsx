import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, Lock, LogIn, Chrome } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { loginUser, loginWithGoogle, loginWithApple } from "../features/auth/thunks/authThunk";
import AuthLayout from "../Components/layout/AuthLayout";
import AuthInput from "../features/auth/components/AuthInput";
import AuthButton from "../features/auth/components/AuthButton";
import NewUserBlockedModal from "../features/auth/components/NewUserBlockedModal";

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(result)) {
      navigate("/");
    }
  };

  const handleGoogleLogin = async () => {
    const result = await dispatch(loginWithGoogle());
    if (loginWithGoogle.fulfilled.match(result)) {
      navigate("/");
    } else if (loginWithGoogle.rejected.match(result)) {
      const payload = result.payload as any;
      if (payload === "NEW_USER_BLOCKED") {
        setShowBlockedModal(true);
      }
    }
  };

  const handleAppleLogin = async () => {
    const result = await dispatch(loginWithApple());
    if (loginWithApple.fulfilled.match(result)) {
      navigate("/");
    } else if (loginWithApple.rejected.match(result)) {
      const payload = result.payload as any;
      if (payload === "NEW_USER_BLOCKED") {
        setShowBlockedModal(true);
      }
    }
  };

  return (
    <AuthLayout
      title={t("auth.welcomeBack")}
      subtitle={t("auth.enterCredentials")}
    >
      <NewUserBlockedModal
        isOpen={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
      />

      <form onSubmit={handleSubmit} className="space-y-5 mt-6">
        <AuthInput
          label={t("auth.email")}
          icon={Mail}
          type="email"
          placeholder={t("auth.emailPlaceholder")}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <div className="space-y-2">
          <AuthInput
            label={t("auth.password")}
            icon={Lock}
            type="password"
            placeholder={t("auth.passwordPlaceholder")}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-gray-400 hover:text-[#5EEAD4] transition-colors"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>
        </div>

        {error && error !== "NEW_USER_BLOCKED" && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        <AuthButton isLoading={isLoading} className="hover:cursor-pointer">
          {t("auth.signIn")} <LogIn size={18} />
        </AuthButton>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#3A3845]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#07060A] text-gray-500">
              {t("login.orContinueWith")}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <AuthButton
            type="button"
            variant="google"
            className="hover:cursor-pointer flex-1"
            onClick={handleGoogleLogin}
          >
            <Chrome size={18} className="text-white" />
            <span>Google</span>
          </AuthButton>

          <AuthButton
            type="button"
            variant="apple"
            className="hover:cursor-pointer flex-1"
            onClick={handleAppleLogin}
          >
            <img src="/dark-theme-apple.png" alt="Apple" className="w-5 h-5 object-contain" />
            <span>Apple</span>
          </AuthButton>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t("login.dontHaveAccount")}{" "}
          <Link
            to="/signup"
            className="text-[#5EEAD4] hover:text-[#8FF0E0] font-semibold transition-colors hover:cursor-pointer"
          >
            {t("login.signUpLink")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
