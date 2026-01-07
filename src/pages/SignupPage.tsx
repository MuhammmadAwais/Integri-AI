import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Chrome, Phone } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import {
  registerUser,
  loginWithGoogle,
} from "../features/auth/thunks/authThunk";
import AuthLayout from "../Components/layout/AuthLayout";
import AuthInput from "../features/auth/components/AuthInput";
import AuthButton from "../features/auth/components/AuthButton";

const Signup: React.FC = () => {
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
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
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
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join Integri AI to start building the future."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Full Name"
          type="text"
          placeholder="John Doe"
          icon={User}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <AuthInput
          label="Email"
          type="email"
          placeholder="name@example.com"
          icon={Mail}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <AuthInput
          label="Phone Number (Optional)"
          type="tel"
          placeholder="+1 234 567 890"
          icon={Phone}
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
        <AuthInput
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
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
            Create Account <ArrowRight size={18} />
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
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-red-500 hover:text-red-400 font-semibold transition-colors hover:cursor-pointer"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Signup;
