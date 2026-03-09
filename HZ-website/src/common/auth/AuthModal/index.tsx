import React, { useEffect, useRef, useState } from "react";
import Modal from "@/common/Modal";
import CustomInput from "@/common/FormElements/CustomInput";
import Button from "@/common/Button";
import Image from "next/image";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import apiClient from "@/utils/apiClient";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { MdArrowBack } from "react-icons/md";

type Step = "LOGIN" | "OTP" | "SIGNUP" | "SUCCESS";

interface AuthModalProps {
  isOpen: boolean;
  closeModal: () => void;
  callbackUrl?: string;
}

const InlineSpinner = ({ className = "w-4 h-4 mr-2" }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24">
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
      d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
    />
  </svg>
);

const LoadingOverlay = ({
  show,
  label = "Please wait…",
}: {
  show: boolean;
  label?: string;
}) => {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center rounded-2xl bg-white/60 backdrop-blur-[2px]">
      <InlineSpinner className="w-6 h-6 mb-2" />
      <p className="label-text text-gray-600">{label}</p>
    </div>
  );
};

const StepPill = ({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) => (
  <div
    className={`px-2.5 py-1 rounded-[6px] text-xs font-medium border
    ${active
        ? "bg-blue-50 text-[#3586FF] border-blue-200"
        : "bg-gray-50 text-gray-600 border-gray-200"
      }`}
  >
    {children}
  </div>
);

const AuthModal = ({ isOpen, closeModal, callbackUrl }: AuthModalProps) => {
  const router = useRouter();
  const [step, setStep] = useState<Step>("OTP");
  const [method, setMethod] = useState<"phone" | "email">("phone");

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [isAgent, setIsAgent] = useState<boolean | null>(null);

  const identifier = method === "email" ? email : phone;

  const [otpVerified, setOtpVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const safeTarget =
    callbackUrl ||
    (typeof router.query.callbackUrl === "string" &&
      router.query.callbackUrl.startsWith("/")
      ? router.query.callbackUrl
      : "/");

  useEffect(() => {
    if (isOpen) {
      setStep("LOGIN");
      setMethod("phone");
      setPhone("");
      setEmail("");
      setFullName("");
      setPassword("");
      setIsAgent(null);
      setOtpVerified(false);
      setError("");
      setOtp(["", "", "", ""]);
      setTimeLeft(30);
      setCanResend(false);
    }
  }, [isOpen]);

  // OTP timer
  useEffect(() => {
    if (step === "OTP" && timeLeft > 0) {
      const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
      return () => clearInterval(t);
    }
    if (step === "OTP" && timeLeft <= 0) setCanResend(true);
  }, [step, timeLeft]);

  // ---------- Actions ----------
  const sendOtp = async () => {
    if (!identifier) return setError(`Please enter your ${method}.`);
    if (method === "email" && !/^\S+@\S+\.\S+$/.test(email)) {
      return setError("Please enter a valid email address.");
    }
    if (method === "phone" && phone.replace(/\D/g, "").length < 10) {
      return setError("Please enter a valid phone number.");
    }

    setLoading(true);
    setError("");
    try {
      const payload = method === "email" ? { email } : { phone };
      const res = await apiClient.post(`${apiClient.URLS.otp}/send`, payload);
      if (res.status === 201) {
        toast.success("OTP sent!");
        setStep("OTP");
        setTimeLeft(30);
        setCanResend(false);
      } else {
        setError("We couldn't send an OTP. Please try again.");
      }
    } catch {
      setError("We couldn't send an OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      const payload = method === "email" ? { email } : { phone };
      await apiClient.post(`${apiClient.URLS.otp}/resend`, payload);
      toast.success("OTP resent");
      setTimeLeft(30);
      setCanResend(false);
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  const checkUserExists = async () => {
    const payload = method === "email" ? { email } : { phone };
    const res = await apiClient.post(
      `${apiClient.URLS.otp}/check-user`,
      payload
    );
    return !!res?.body?.status;
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 4) return;
    setLoading(true);
    setError("");
    try {
      const exists = await checkUserExists();
      if (!exists) {
        toast("Looks like you're new. Let's create your account.", {
          icon: "👋",
        });
        setOtpVerified(true);
        setStep("SIGNUP");
        return;
      }
      const result = await signIn("otp-login", {
        redirect: false,
        identifier,
        otp: code,
      });
      if (result?.ok) {
        toast.success("Welcome back!");
        setBusy(true);
        closeModal();
        router.push(safeTarget);
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setBusy(false), 800);
    }
  };
  const completeSignup = async () => {
    if (!fullName.trim()) return setError("Full name is required.");
    if (!email.trim()) return setError("Email is required.");
    if (!/^\S+@\S+\.\S+$/.test(email))
      return setError("A valid email is required.");
    if (!phone.trim()) return setError("Phone number is required.");
    if (!/^[6-9]\d{9}$/.test(phone))
      return setError("Phone number must start with 6,7,8,9 and be 10 digits.");
    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{10,}$/.test(password)) {
      return setError(
        "Password must be at least 10 characters, contain one uppercase, one number, and one special character."
      );
    }
    if (isAgent === null) return setError("Please select if you're an agent.");

    setLoading(true);
    setError("");
    try {
      const payload = {
        fullName,
        password,
        agent: isAgent,
        email,
        phone,
      };
      const res = await apiClient.post(apiClient.URLS.user, payload);

      if (res.status === 201) {
        const login = await signIn("credentials", {
          redirect: false,
          identifier: email,
          password,
        });
        if (login?.ok) {
          toast.success("Account created!");
          setStep("SUCCESS");
          setBusy(true);
          setTimeout(() => {
            closeModal();
            router.push(safeTarget);
          }, 900);
        } else {
          setError(
            "Signup succeeded, but login failed. Please try logging in."
          );
        }
      } else {
        setError("We couldn't create your account. Please try again.");
      }
    } catch (e: any) {
      setError(
        e?.body?.message || "We couldn't create your account. Please try again."
      );
    } finally {
      setLoading(false);
      setTimeout(() => setBusy(false), 900);
    }
  };

  const OTPBoxes = () => (
    <div
      className="flex justify-center gap-3 mb-4"
      onPaste={(e) => {
        const data = e.clipboardData
          .getData("text")
          .replace(/\D/g, "")
          .slice(0, 4);
        if (!data) return;
        const next = data.split("");
        while (next.length < 4) next.push("");
        setOtp(next);
        const idx = Math.min(3, data.length);
        inputsRef.current[idx]?.focus();
      }}
    >
      {otp.map((v, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el) as any}
          value={v}
          maxLength={1}
          inputMode="numeric"
          className="w-10 h-10 md:text-xl text-[12px] text-center border-2 border-gray-200 rounded-xl
                     focus:border-[#3586FF] focus:ring-2 focus:ring-blue-100 bg-white shadow-sm transition"
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            const next = [...otp];
            next[i] = val;
            setOtp(next);
            if (val && i < otp.length - 1) inputsRef.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !otp[i] && i > 0)
              inputsRef.current[i - 1]?.focus();
          }}
          onFocus={(e) => e.target.select()}
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      closeModal={() => {
        setError("");
        closeModal();
      }}
      title=""
      className="max-w-[640px] p-0"
      rootCls="z-[9999]"
    >
      <div className="relative">
        <LoadingOverlay show={busy} />

        <div className="px-6 pt-6 pb-4 md:px-8 flex md:flex-row flex-col items-center md:gap-3 gap-2">
          <div className=" flex items-center md:space-x-3 space-x-2">
            <div className="relative w-9 h-9">
              <Image
                src="/images/logobb.png"
                alt="OneCasa logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="leading-tight">
              <h2 className="text-[18px] md:text-[20px]  font-bold text-gray-900">
                Welcome to{" "}
                <span className="text-[#3586FF] font-bold">OneCasa</span>
              </h2>
              <p className="text-[10px] md:text-[12px] font-regular text-gray-500 tracking-wide">
                One Roof Every Solution
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <StepPill active={step === "LOGIN"}>Login</StepPill>
            <StepPill active={step === "OTP"}>Verify</StepPill>
            <StepPill active={step === "SIGNUP"}>Sign up</StepPill>
          </div>
        </div>
        <div className="h-px w-full bg-gray-100" />
        <div className="px-6 md:py-6 py-4 md:px-8">
          {step === "LOGIN" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendOtp();
              }}
              className="space-y-5"
            >
              <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                <Button
                  onClick={() => {
                    setMethod("phone");
                    setError("");
                  }}
                  className={`px-3  py-1 rounded-md label-text font-medium transition
                    ${method === "phone"
                      ? "bg-white shadow-sm text-[#3586FF]"
                      : "text-gray-600 hover:text-gray-900"
                    }`}
                  aria-pressed={method === "phone"}
                >
                  Phone
                </Button>
                <Button
                  onClick={() => {
                    setMethod("email");
                    setError("");
                  }}
                  className={`px-3 py-1 rounded-md label-text transition font-medium
                    ${method === "email"
                      ? "bg-white shadow-sm text-[#3586FF]"
                      : "text-gray-600 hover:text-gray-900"
                    }`}
                  aria-pressed={method === "email"}
                >
                  Email
                </Button>
              </div>

              <CustomInput
                name={method}
                label={method === "email" ? "Email" : "Phone number"}
                type={method === "email" ? "email" : "number"}
                value={method === "email" ? email : phone}
                onChange={(e) => {
                  setError("");
                  method === "email"
                    ? setEmail(e.target.value)
                    : setPhone(e.target.value);
                }}
                placeholder={
                  method === "email" ? "sachin@gmail.com" : "e.g. 9876543210"
                }
                errorMsg={error}
                required
                className="py-1 md:py-1"
              />

              <Button
                type="submit"
                className="w-full bg-[#3586FF] md:text-[16px] text-[14px] hover:bg-[#3586FF] text-white md:py-2 py-1 rounded-lg font-medium shadow-sm transition disabled:opacity-60"
                disabled={loading || !identifier}
              >
                {loading ? "Sending OTP…" : "Login"}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <HiOutlineShieldCheck className="text-gray-400" />
                <span>Secure & encrypted • No spam ever</span>
              </div>
              <div className="text-center md:text-sm text-[12px] font-medium text-gray-500 ">
                Don't have an account?{" "}
                <Button
                  type="button"
                  onClick={() => {
                    setOtpVerified(false);
                    setStep("SIGNUP");
                  }}
                  className="text-[#3586FF] font-medium hover:underline"
                >
                  Sign Up
                </Button>
              </div>
            </form>
          )}

          {step === "OTP" && (
            <div className="space-y-5">
              <Button
                className="label-text text-gray-600 hover:text-gray-900"
                onClick={() => setStep("LOGIN")}
              >
                ← Back
              </Button>

              <p className="text-gray-700 text-[12px]">
                Enter the 4-digit code sent to{" "}
                <span className="font-medium text-[#3586FF]">
                  {identifier}
                </span>
              </p>

              {OTPBoxes()}

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 label-text text-red-700">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between label-text">
                {canResend ? (
                  <Button
                    onClick={resendOtp}
                    className="text-[#3586FF] font-medium hover:underline"
                  >
                    Resend code
                  </Button>
                ) : (
                  <p className="text-gray-500">
                    Resend available in {timeLeft}s
                  </p>
                )}
                <Button
                  onClick={() => setStep("LOGIN")}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Change email/phone
                </Button>
              </div>

              <Button
                className="w-full bg-[#3586FF] hover:bg-blue-500 md:text-[16px] text-[14px] text-white md:py-2 py-1 rounded-lg font-medium shadow-sm transition disabled:opacity-60"
                onClick={verifyOtp}
                disabled={loading || otp.some((d) => !d)}
              >
                {loading ? "Verifying…" : "Verify & Continue"}
              </Button>
            </div>
          )}

          {step === "SIGNUP" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                completeSignup();
              }}
              className="space-y-5"
            >
              <Button
                onClick={() => {
                  setError("");
                  setStep("LOGIN");
                }}
                className="group flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-[#3586FF] hover:bg-blue-50 active:bg-blue-100 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-1"
              >
                <MdArrowBack className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" />
                <span className="font-medium text-[13px] md:text-[15px]">Back</span>
              </Button>

              {otpVerified && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 flex items-center gap-2">
                  <HiOutlineShieldCheck className="text-green-500 shrink-0" />
                  <span>
                    Your {method} <strong>{method === "phone" ? phone : email}</strong> has been verified via OTP.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 gap-2">
                <CustomInput
                  name="fullName"
                  label="Full Name"
                  labelCls="text-black label-text"
                  type="text"
                  placeholder="Enter Your FullName"
                  value={fullName}
                  onChange={(e) => {
                    setError("");
                    setFullName(e.target.value);
                  }}
                  required
                  className="text-label  text-[12px] placeholder:text-[14px]"
                />
                <CustomInput
                  name="password"
                  label="Password"
                  labelCls="text-black label-text"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setError("");
                    setPassword(e.target.value);
                  }}
                  placeholder="Min. 10 chars, 1 upper, 1 num, 1 special"
                  required
                />
                <CustomInput
                  name="email"
                  label="Email"
                  labelCls="text-black label-text"
                  type="text"
                  placeholder="Enter Email"
                  value={email}
                  disabled={otpVerified && method === "email"}
                  readOnly={otpVerified && method === "email"}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <CustomInput
                  name="phone"
                  label="Phone"
                  labelCls="text-black label-text"
                  required
                  type="number"
                  placeholder="Enter Phone Number"
                  value={phone}
                  disabled={otpVerified && method === "phone"}
                  readOnly={otpVerified && method === "phone"}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <p className="mb-2 label-text text-black">
                  Are you a Real Estate Agent?
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setIsAgent(true)}
                    className={`label-text py-[3px] px-4 md:px-6 max-w-[100px] rounded-md border-2 transition
                      ${isAgent === true
                        ? "bg-blue-50 border-[#3586FF]  text-[#3586FF]"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                  >
                    Yes
                  </Button>
                  <Button
                    onClick={() => setIsAgent(false)}
                    className={`py-[3px] label-text px-5 md:px-6 max-w-[100px] rounded-md border-2 transition
                      ${isAgent === false
                        ? "bg-blue-50 border-[#3586FF] text-[#3586FF]"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                  >
                    No
                  </Button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 label-text text-red-700">
                  {error}
                </div>
              )}

              {loading ? <InlineSpinner /> :
                <Button
                  type="submit"
                  className="w-full bg-[#3586FF] hover:bg-blue-700 text-white md:py-[6px] py-1 rounded-lg font-medium shadow-sm transition disabled:opacity-60"
                  disabled={loading}
                >

                  {loading ? "Creating…" : "Create Account"}
                </Button>
              }
            </form>
          )}

          {/* SUCCESS */}
          {step === "SUCCESS" && (
            <div className="py-10 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg
                  className="w-10 h-10 text-green-500"
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
              <h3 className="text-2xl uppercase font-bold text-gray-900 mb-1">
                Welcome to OneCasa!
              </h3>
              <p className="text-gray-600">
                Your account is ready. Redirecting…
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;
