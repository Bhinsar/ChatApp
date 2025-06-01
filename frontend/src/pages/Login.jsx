import React, { useState } from "react";
import { axiosInstance } from "../lib/axois";
import {
  MessageSquare,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import AuthImagePatten from "../components/AuthImagePatten";
import { Link, useNavigate } from "react-router-dom";
import {ConnectionManager} from "../lib/socket.js";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showAlert, setShowAlert] = useState({
    show: false,
    message: "",
  });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setShowAlert({
        show: true,
        message: "All fields are required",
      });
      return;
    }
    if (formData.password.length < 6) {
      setShowAlert({
        show: true,
        message: "Password must be at least 6 characters",
      });
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await axiosInstance.post("/user/signin", formData);
      navigate("/home");
      const user = res.data.data;
      localStorage.setItem("userId", (user.id));
    } catch (error) {
      setShowAlert({
        show: true,
        message: error.response?.data?.message || "An error occurred during login",
      });
    } finally {
      ConnectionManager.connect();
      setIsLoggingIn(false);
      setTimeout(() => {
        setShowAlert({
          show: false,
          message: "",
        });
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
              <p className="text-base-content/60">
                Sign in to continue to your account
              </p>
            </div>
          </div>

          {showAlert.show && (
            <div className="alert alert-error">
              <span>{showAlert.message}</span>
            </div>
          )}

          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  name="email"
                  className="input input-bordered w-full px-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="input input-bordered w-full px-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
          <div className="text-center">
            <p className="text-base-content/60">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
      {/* right side */}
      <AuthImagePatten
        title="Welcome Back"
        desc="Sign in to continue to your account"
      />
    </div>
  );
}

export default Login;
