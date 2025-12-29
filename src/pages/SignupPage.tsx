
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Chrome } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import {
  registerUser,
  loginWithGoogle,
} from "../features/auth/thunks/authThunk"; //
import AuthLayout from "../Components/layout/AuthLayout";
import AuthInput from "../features/auth/components/AuthInput";
import AuthButton from "../features/auth/components/AuthButton";

const Signup: React.FC = () => {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (formData.password !== formData.confirmPassword) {
        setConfirmPasswordError("Passwords do not match.");
        return;
      }
      const result = await dispatch(registerUser(formData));
      if (registerUser.fulfilled.match(result)) {
        navigate("/getting-started");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // 2. Add Google Login Handler
  const handleGoogleLogin = async () => {
    try {
      const result = await dispatch(loginWithGoogle());
      if (loginWithGoogle.fulfilled.match(result)) {
        navigate("/getting-started");
      }
    } catch (error) {
      console.error("Error logging in with Google:", error);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Integri AI to start your journey."
    >
      <form onSubmit={handleSubmit} className="space-y-5 mt-6">
        <AuthInput
          label="Full Name"
          icon={User}
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <AuthInput
          label="Email"
          icon={Mail}
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <AuthInput
          label="Password"
          icon={Lock}
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
        <AuthInput
          label="Confirm Password"
          icon={Lock}
          type="password"
          placeholder="••••••••"
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
            className="hover:cursor-pointer"
          >
            Create Account <ArrowRight size={18} />
          </AuthButton>

          <div className="relative p-2">
           
          </div>

          {/* 3. Attach onClick Handler Here */}
          <AuthButton
            type="button"
            variant="google"
            className="hover:cursor-pointer "
            onClick={handleGoogleLogin}
          >
            <Chrome size={18} className="text-white" />

            <span>Google</span>
          </AuthButton>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-red-500 hover:text-red-400 font-semibold transition-colors hover:cursor-pointer"
          >
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Signup;
