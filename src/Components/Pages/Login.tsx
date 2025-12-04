import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import { useLoginMutation } from "../../store/apis/authAPI";
import { useAppDispatch } from "../hooks/useRedux";
import { setCredentials } from "../../store/authSlice";
import AuthLayout from "../ui/auth/AuthLayout";
import AuthInput from "../ui/auth/AuthInput";
import AuthButton from "../ui/auth/AuthButton";



const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const result = await login(formData).unwrap();
    if (result) {
      dispatch(setCredentials(result));
      navigate("/");
    }
  } catch (err) {
    setError("Invalid email or password.");
  }
};
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Enter your credentials to access your workspace."
    >
      <form onSubmit={handleSubmit} className="space-y-6 mt-8">
        <AuthInput
          label="Email"
          icon={Mail}
          type="email"
          placeholder="name@company.com"
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

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="remember"
              className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
            >
              Remember me
            </label>
          </div>
          <a
            href="#"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Forgot password?
          </a>
        </div>

        {error && (
          <p className="text-red-500 text-sm font-medium animate-pulse">
            {error}
          </p>
        )}

        <AuthButton isLoading={isLoading}>
          Sign In <LogIn size={18} />
        </AuthButton>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Sign up for free
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
