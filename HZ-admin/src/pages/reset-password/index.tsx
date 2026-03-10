import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import toast from "react-hot-toast";
import clsx from "clsx";
import { MdLock, MdCheckCircle, MdError } from "react-icons/md";
import apiClient from "@/src/utils/apiClient";
import CustomInput from "@/src/common/FormElements/CustomInput";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{7,}$/;

  const isPasswordValid = passwordRegex.test(newPassword);
  const doPasswordsMatch = newPassword === confirmPassword && newPassword !== "";
  const canSubmit = isPasswordValid && doPasswordsMatch && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid reset link");
      return;
    }

    if (!isPasswordValid) {
      toast.error(
        "Password must be at least 7 characters with 1 uppercase, 1 number, and 1 special character"
      );
      return;
    }

    if (!doPasswordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await apiClient.post(`${apiClient.URLS.user}/reset-password`, {
        token: token as string,
        newPassword,
      });

      if (res.status === 200) {
        setSuccess(true);
        toast.success("Password reset successfully!");
      }
    } catch (err: any) {
      setError(
        err?.body?.message ||
          err?.message ||
          "Failed to reset password. The link may have expired."
      );
      toast.error(
        err?.body?.message || "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!newPassword) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (newPassword.length >= 7) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/\d/.test(newPassword)) strength++;
    if (/[!@#$%^&*]/.test(newPassword)) strength++;

    if (strength <= 1) return { strength: 25, label: "Weak", color: "bg-red-500" };
    if (strength === 2) return { strength: 50, label: "Fair", color: "bg-orange-500" };
    if (strength === 3) return { strength: 75, label: "Good", color: "bg-yellow-500" };
    return { strength: 100, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength();

  if (success) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-brand-surface rounded-3xl shadow-xl p-8 sm:p-10 border border-brand-muted text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MdCheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Password Reset Successful
            </h1>
            <p className="text-gray-500 mb-8">
              Your password has been successfully reset. You can now sign in with
              your new password.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-primary to-brand-primary-dark hover:from-brand-primary-dark hover:to-brand-primary-darker shadow-lg shadow-brand-primary/30 transition-all duration-300"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="relative w-14 h-14 flex-shrink-0">
            <Image
              src="/images/houznext-logo.png"
              alt="Houznext Logo"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <p className="font-bold text-2xl text-white">
              <span className="text-brand-muted">Houz</span>next
            </p>
            <p className="text-xs text-brand-muted/80 tracking-wider">
              Premium Interior Living
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-brand-surface rounded-3xl shadow-xl p-8 sm:p-10 border border-brand-muted">
          <div className="mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <MdLock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Set new password
            </h1>
            <p className="text-gray-500">
              Your new password must be different from previously used passwords.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <MdError className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MdLock className="h-5 w-5 text-gray-400" />
                </div>
                <CustomInput
                  type="password"
                  label="New Password"
                  value={newPassword}
                  name="password"
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white"
                  required
                />
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">
                      Password strength
                    </span>
                    <span
                      className={clsx(
                        "text-xs font-medium",
                        passwordStrength.strength <= 25 && "text-red-500",
                        passwordStrength.strength === 50 && "text-orange-500",
                        passwordStrength.strength === 75 && "text-yellow-600",
                        passwordStrength.strength === 100 && "text-green-500"
                      )}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        "h-full transition-all duration-300 rounded-full",
                        passwordStrength.color
                      )}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Password Requirements */}
              <div className="mt-3 space-y-1.5">
                <p
                  className={clsx(
                    "text-xs flex items-center gap-2",
                    newPassword.length >= 7 ? "text-green-600" : "text-gray-400"
                  )}
                >
                  <span
                    className={clsx(
                      "w-1.5 h-1.5 rounded-full",
                      newPassword.length >= 7 ? "bg-green-500" : "bg-gray-300"
                    )}
                  />
                  At least 7 characters
                </p>
                <p
                  className={clsx(
                    "text-xs flex items-center gap-2",
                    /[A-Z]/.test(newPassword)
                      ? "text-green-600"
                      : "text-gray-400"
                  )}
                >
                  <span
                    className={clsx(
                      "w-1.5 h-1.5 rounded-full",
                      /[A-Z]/.test(newPassword) ? "bg-green-500" : "bg-gray-300"
                    )}
                  />
                  One uppercase letter
                </p>
                <p
                  className={clsx(
                    "text-xs flex items-center gap-2",
                    /\d/.test(newPassword) ? "text-green-600" : "text-gray-400"
                  )}
                >
                  <span
                    className={clsx(
                      "w-1.5 h-1.5 rounded-full",
                      /\d/.test(newPassword) ? "bg-green-500" : "bg-gray-300"
                    )}
                  />
                  One number
                </p>
                <p
                  className={clsx(
                    "text-xs flex items-center gap-2",
                    /[!@#$%^&*]/.test(newPassword)
                      ? "text-green-600"
                      : "text-gray-400"
                  )}
                >
                  <span
                    className={clsx(
                      "w-1.5 h-1.5 rounded-full",
                      /[!@#$%^&*]/.test(newPassword)
                        ? "bg-green-500"
                        : "bg-gray-300"
                    )}
                  />
                  One special character (!@#$%^&*)
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MdLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={clsx(
                    "w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 bg-gray-50 focus:bg-white",
                    confirmPassword &&
                      (doPasswordsMatch
                        ? "border-green-300"
                        : "border-red-300")
                  )}
                  required
                />
              </div>
              {confirmPassword && !doPasswordsMatch && (
                <p className="mt-2 text-xs text-red-500">
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={clsx(
                "w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-300",
                canSubmit
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30"
                  : "bg-gray-300 cursor-not-allowed"
              )}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Remember your password?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to login
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} OneCasa. All rights reserved.
        </p>
      </div>
    </div>
  );
}
