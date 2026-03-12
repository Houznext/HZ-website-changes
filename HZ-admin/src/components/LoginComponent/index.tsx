import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { object, string } from "yup";
import clsx from "clsx";
import Loader from "@/src/common/Loader";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import CustomInput from "@/src/common/FormElements/CustomInput";
import Button from "@/src/common/Button";
import { MdEmail, MdLock, MdArrowBack } from "react-icons/md";
import { FiMail } from "react-icons/fi";
import apiClient from "@/src/utils/apiClient";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginComponent() {
  const loginSchema = object({
    email: string().required(),
    password: string().min(8).required(),
  });

  const [loginFormValues, setLoginFormValues] = useState<LoginFormValues>({
    email: "",
    password: "",
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setLoginFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));

    loginSchema
      .validate({ ...loginFormValues, [name]: value }, { abortEarly: false })
      .then(() => {
        setIsFormValid(true);
      })
      .catch(() => {
        setIsFormValid(false);
      });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("email-login", {
        redirect: false,
        email: loginFormValues.email,
        password: loginFormValues.password,
        callbackUrl: "/dashboard",
      });

      if (result?.ok) {
        toast.success("Login successful");
        router.push("/dashboard");
      } else {
        toast.error("Invalid credentials");
        setLoading(false);
      }
    } catch (error: any) {
      toast.error("Something went wrong");
      console.error(error);
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: any) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await apiClient.post(
        `${apiClient.URLS.user}/forgot-password`,
        { email: forgotEmail }
      );

      if (res.status === 200) {
        setForgotSuccess(true);
        toast.success("Password reset link sent to your email");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to send reset link");
    } finally {
      setForgotLoading(false);
    }
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotEmail("");
    setForgotSuccess(false);
  };

  if (loading) {
    return <Loader tagline="Houznext Admin page is cooking for you!" />;
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#0f2a44]">
      <div className="w-full max-w-xl px-4 sm:px-6">
        {/* Brand logo top center - transparent background */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-56 h-12 sm:w-64 sm:h-14 mb-3 bg-transparent">
            <Image
              src="/images/houznext-logo.png"
              alt="Houznext Logo"
              fill
              className="object-contain bg-transparent"
              style={{ background: "transparent" }}
            />
          </div>
          <p className="text-xs sm:text-sm text-[#d1e0f2] tracking-widest uppercase">
            Admin Console
          </p>
        </div>

        {/* Main Content */}
          {!showForgotPassword ? (
            // Login Form
            <div className="bg-[#f5f7fa] rounded-3xl shadow-2xl p-8 sm:p-10 border border-[#d1e0f2] max-w-xl mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1f2933] mb-2">
                  Admin Sign In
                </h1>
                <p className="text-[#52606d] label-text">
                  Use your Houznext admin credentials to access the dashboard.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <CustomInput
                  type="email"
                  name="email"
                  label="Email Address"
                  value={loginFormValues.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  leftIcon={<MdEmail className="h-5 w-5" />}
                  required
                />

                <CustomInput
                  type="password"
                  name="password"
                  label="Password"
                  value={loginFormValues.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  leftIcon={<MdLock className="h-5 w-5" />}
                  required
                />

                <div className="flex items-center justify-end">
                  <Button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm font-medium text-[#2f80ed] hover:text-[#1c64d8] transition-colors"
                  >
                    Forgot password?
                  </Button>
                </div>

                <Button
                  type="submit"
                  disabled={!isFormValid}
                  className={clsx(
                    "w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-300",
                    isFormValid
                      ? "bg-gradient-to-r from-[#2f80ed] to-[#1c64d8] hover:from-[#1c64d8] hover:to-[#174ea6] shadow-lg shadow-[#2f80ed]/30 hover:shadow-xl hover:shadow-[#2f80ed]/40"
                      : "bg-gray-300 cursor-not-allowed"
                  )}
                >
                  Sign In
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-[#52606d]">
                By signing in, you agree to our{" "}
                <a
                  href="/terms"
                  className="text-[#2f80ed] hover:text-[#1c64d8] font-medium"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-[#2f80ed] hover:text-[#1c64d8] font-medium"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          ) : (
            // Forgot Password Form
            <div className="bg-[#f5f7fa] rounded-3xl shadow-xl p-8 sm:p-10 border border-[#d1e0f2] max-w-xl mx-auto">
              {!forgotSuccess ? (
                <>
                  <Button
                    onClick={resetForgotPassword}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
                  >
                    <MdArrowBack className="w-5 h-5" />
                    <span className="text-sm font-medium">Back to login</span>
                  </Button>

                  <div className="mb-8">
                    <div className="w-12 h-12 bg-[#d1e0f2] rounded-2xl flex items-center justify-center mb-6">
                      <FiMail className="w-5 h-5 text-[#2f80ed]" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#1f2933] mb-2">
                      Forgot password?
                    </h1>
                    <p className="text-[#52606d] label-text" >
                      No worries, we&apos;ll send you reset instructions.
                    </p>
                  </div>

                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <CustomInput
                      type="email"
                      name="forgotEmail"
                      label="Email Address"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter your email"
                      leftIcon={<MdEmail className="h-5 w-5" />}
                      required
                    />

                    <Button
                      type="submit"
                      disabled={forgotLoading || !forgotEmail}
                      className={clsx(
                        "w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-300",
                        forgotEmail && !forgotLoading
                          ? "bg-gradient-to-r from-[#2f80ed] to-[#1c64d8] hover:from-[#1c64d8] hover:to-[#174ea6] shadow-lg shadow-[#2f80ed]/30"
                          : "bg-gray-300 cursor-not-allowed"
                      )}
                    >
                      {forgotLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5"
                            viewBox="0 0 24 24"
                          >
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
                          Sending...
                        </span>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </form>
                </>
              ) : (
                // Success State
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-10 h-10 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-[#1f2933] mb-2">
                    Check your email
                  </h2>
                  <p className="text-[#52606d] mb-8 label-text ">
                    We sent a password reset link to
                    <br />
                    <span className="font-medium text-gray-700">
                      {forgotEmail}
                    </span>
                  </p>
                  <Button
                    onClick={resetForgotPassword}
                    className="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-[#2f80ed] to-[#1c64d8] hover:from-[#1c64d8] hover:to-[#174ea6] shadow-lg shadow-[#2f80ed]/30 transition-all duration-300"
                  >
                    Back to Login
                  </Button>
                  <p className="mt-6 text-sm text-[#52606d]">
                    Didn&apos;t receive the email?{" "}
                    <Button
                      onClick={() => setForgotSuccess(false)}
                      className="text-[#2f80ed] hover:text-[#1c64d8] font-medium"
                    >
                      Click to resend
                    </Button>
                  </p>
                </div>
              )}
            </div>
          )}

          <p className="mt-8 text-center text-sm text-[#d1e0f2]">
            &copy; {new Date().getFullYear()} Houznext. All rights reserved.
          </p>
        </div>
      </div>
    
  );
}
