import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import supabase from "../services/supabaseClient";

interface PasswordProtectionProps {
  children: (onLogout: () => void) => React.ReactNode;
}

const PasswordProtection: React.FC<PasswordProtectionProps> = ({
  children,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Check if Supabase is disabled
  const isSupabaseDisabled =
    (import.meta as any).env.VITE_DISABLE_SUPABASE === "true";

  const { isAuthenticated, isLoading, logout } = useAuth();

  // If Supabase is disabled, automatically authenticate
  useEffect(() => {
    if (isSupabaseDisabled) {
      console.log("🔓 Supabase authentication is disabled - bypassing login");
    }
  }, [isSupabaseDisabled]);

  const handleLogout = () => {
    // Clear all session-related storage
    const supabaseKeys = [
      "sb-access-token",
      "sb-refresh-token",
      "supabase.auth.token",
      "supabase.auth.expires_at",
      "supabase.auth.refresh_token",
      "auth-heartbeat",
    ];

    supabaseKeys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // Clear any other Supabase storage keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("sb-") || key.startsWith("supabase.")) {
        localStorage.removeItem(key);
      }
    });

    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("sb-") || key.startsWith("supabase.")) {
        sessionStorage.removeItem(key);
      }
    });

    logout();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // If Supabase is disabled, any email/password will work
    if (isSupabaseDisabled) {
      console.log("🔓 Bypassing authentication - Supabase is disabled");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      // Use Supabase's error message, or a friendlier version for common cases
      let friendlyMessage = error.message;
      if (error.message.includes("Invalid login credentials")) {
        friendlyMessage = "Incorrect email or password.";
      } else if (error.message.includes("User not found")) {
        friendlyMessage = "No account found with this email.";
      } else if (error.message.includes("Email not confirmed")) {
        friendlyMessage = "Please confirm your email before logging in.";
      } else if (error.message.includes("Network")) {
        friendlyMessage = "Network error. Please try again.";
      }
      setError(friendlyMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  // If Supabase is disabled, skip authentication entirely
  if (isSupabaseDisabled) {
    return <>{children(() => console.log("Logout disabled in bypass mode"))}</>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              BMW Motorrad R Series Dealership Toolkit
            </h1>
            <p className="text-gray-600">Log in to access the platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter email"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium"
            >
              Access Platform
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              This platform is for authorized BMW dealers only.
              <br />
              Unauthorized access is prohibited.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children(handleLogout)}</>;
};

export default PasswordProtection;
