import React, { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { object, string } from "yup";
import clsx from "clsx";
import Loader from "../SpinLoader";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import CustomInput from "@/src/common/FormElements/CustomInput";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Button from "@/src/common/Button";
import { MdClose, MdEmail, MdLock, MdArrowBack } from "react-icons/md";
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
    email: "business@houznext.com",
    password: "Houznext@758",
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const sliderRef = useRef<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
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
    return <Loader />;
  }

  const sliderSettings = {
    dots: true,
    appendDots: (dots: any) => (
      <div className="flex justify-center gap-2 mt-8">{dots}</div>
    ),
    beforeChange: (_current: number, next: number) => {
      setCurrentSlide(next);
    },
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    customPaging: (i: number) => (
      <div className="w-3 h-3 flex items-center justify-center">
        <div
          className={clsx(
            "transition-all duration-300 rounded-full",
            i === currentSlide
              ? "w-8 h-2 bg-blue-500"
              : "w-2 h-2 bg-blue-200 hover:bg-blue-300"
          )}
        />
      </div>
    ),
  };

  const listItems = [
    {
      id: 1,
      image: "/images/background/loginimage1.png",
      title: "Discover Dream Properties",
      subtitle:
        "Find your perfect home from our curated selection of premium properties",
    },
    {
      id: 2,
      image: "/images/background/loginimage2.jpg",
      title: "Expert Real Estate Solutions",
      subtitle:
        "Professional guidance for all your property investment decisions",
    },
    {
      id: 3,
      image: "/images/background/loginimage3.jpg",
      title: "Your Journey Starts Here",
      subtitle:
        "From elegant apartments to luxurious villas, we have it all",
    },
  ];

  return (
    <div className="w-full min-h-screen flex">
      {/* Left Side - Image Carousel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
        <div className="relative w-full flex flex-col">
          <Slider ref={sliderRef} {...sliderSettings} className="flex-1">
            {listItems.map((item, index) => (
              <div key={index} className="relative h-screen outline-none">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

                {/* Logo */}
                <div className="absolute top-8 left-8 z-20">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3">
                    <div className="relative w-12 h-12">
                      <Image
                        src="/images/background/newlogo.png"
                        alt="Houznext Logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-xl text-white">
                        HOUZ<span className="text-blue-400">NEXT</span>
                      </p>
                      <p className="text-[10px] text-white/70 tracking-wider">
                        Premium Interior Platform
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="absolute bottom-24 left-0 right-0 px-12 z-20">
                  <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                    {item.title}
                  </h2>
                  <p className="text-lg text-white/70 max-w-md">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="relative w-14 h-14">
              <Image
                src="/images/background/newlogo.png"
                alt="Houznext Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <p className="font-bold text-2xl text-gray-900">
                HOUZ<span className="text-blue-500">NEXT</span>
              </p>
              <p className="text-xs text-gray-500 tracking-wider">
                Premium Interior Platform
              </p>
            </div>
          </div>

          {/* Main Content */}
          {!showForgotPassword ? (
            // Login Form
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-100 max-w-lg mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Admin Sign In
                </h1>
                <p className="text-gray-500 label-text">
                  Use your Houznext admin credentials to access the dashboard.
                </p>
                <div className="mt-3 rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700">
                  <p className="font-semibold mb-1">Default admin credentials</p>
                  <p className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span>
                      <span className="font-medium">Email:</span>{" "}
                      <code className="bg-blue-100 px-1.5 py-0.5 rounded">
                        business@houznext.com
                      </code>
                    </span>
                    <span>
                      <span className="font-medium">Password:</span>{" "}
                      <code className="bg-blue-100 px-1.5 py-0.5 rounded">
                        Houznext@758
                      </code>
                    </span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <CustomInput
                  type="email"
                  name="email"
                  label="Email Address"
                  value={loginFormValues.email}
                  onChange={handleInputChange}
                  placeholder="business@houznext.com"
                  leftIcon={<MdEmail className="h-5 w-5" />}
                  required
                />

                <CustomInput
                  type="password"
                  name="password"
                  label="Password"
                  value={loginFormValues.password}
                  onChange={handleInputChange}
                  placeholder="Houznext@758"
                  leftIcon={<MdLock className="h-5 w-5" />}
                  required
                />

                <div className="flex items-center justify-end">
                  <Button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm font-medium text-[#3586FF] transition-colors"
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
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                      : "bg-gray-300 cursor-not-allowed"
                  )}
                >
                  Sign In
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-gray-500">
                By signing in, you agree to our{" "}
                <a
                  href="/terms"
                  className="text-[#3586FF] hover:text-blue-700 font-medium"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-[#3586FF] hover:text-blue-700 font-medium"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          ) : (
            // Forgot Password Form
            <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-gray-100">
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
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                      <FiMail className="w-5 h-5 text-[#3586FF]" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                      Forgot password?
                    </h1>
                    <p className="text-gray-500 label-text" >
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
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30"
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Check your email
                  </h2>
                  <p className="text-gray-500 mb-8 label-text ">
                    We sent a password reset link to
                    <br />
                    <span className="font-medium text-gray-700">
                      {forgotEmail}
                    </span>
                  </p>
                  <Button
                    onClick={resetForgotPassword}
                    className="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30 transition-all duration-300"
                  >
                    Back to Login
                  </Button>
                  <p className="mt-6 text-sm text-gray-500">
                    Didn&apos;t receive the email?{" "}
                    <Button
                      onClick={() => setForgotSuccess(false)}
                      className="text-[#3586FF] hover:text-blue-700 font-medium"
                    >
                      Click to resend
                    </Button>
                  </p>
                </div>
              )}
            </div>
          )}

          <p className="mt-8 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Houznext. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
