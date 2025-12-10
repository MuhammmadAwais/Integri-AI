import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { registerUser } from "../features/auth/thunks/authThunk";
import AuthLayout from "../components/layout/AuthLayout";
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
      navigate("/getting-started"); // <--- The Redirect you wanted
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Integri AI to start your journey."
    >
      <form onSubmit={handleSubmit} className="space-y-6 mt-8">
        <AuthInput
          label="Full Name"
          icon={User}
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <AuthInput
          label="Email"
          icon={Mail}
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <AuthInput
          label="Password"
          icon={Lock}
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />

        {error && (
          <p className="text-red-500 text-sm font-medium text-center bg-red-500/10 p-2 rounded">
            {error}
          </p>
        )}

        <AuthButton isLoading={isLoading}>
          Create Account <ArrowRight size={18} className="ml-2" />
        </AuthButton>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-semibold">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Signup;
