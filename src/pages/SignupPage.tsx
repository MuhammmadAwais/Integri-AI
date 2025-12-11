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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(result)) {
      navigate("/getting-started");
    }
  };

  // 2. Add Google Login Handler
  const handleGoogleLogin = async () => {
    const result = await dispatch(loginWithGoogle());
    if (loginWithGoogle.fulfilled.match(result)) {
      navigate("/getting-started");
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

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        <AuthButton isLoading={isLoading} className="hover:cursor-pointer">
          Create Account <ArrowRight size={18} />
        </AuthButton>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#3F3F46]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#18181B] text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* 3. Attach onClick Handler Here */}
        <AuthButton
          type="button"
          variant="google"
          className="hover:cursor-pointer"
          onClick={handleGoogleLogin}
        >
          <Chrome size={18} className="text-white " />
          <span>Google</span>
        </AuthButton>

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
