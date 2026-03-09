import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Button from "@/common/Button";
import { useRouter } from "next/router";
import apiClient from "@/utils/apiClient";
import { useRegisterUpStore } from "@/store/loginstore";
import Loader from "../Loader";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

const VerifyOtpView = () => {
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const [error, setError] = useState("");
  const { email, phone, callbackUrl } = useRegisterUpStore();
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const { callbackurl } = router.query as { callbackurl?: string };
  const safeTarget =
    (typeof callbackurl === "string" && callbackurl.startsWith("/"))
      ? callbackurl
      : (callbackUrl || "/");


  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-submit when all 4 digits are entered
  useEffect(() => {
    if (otp.every(digit => digit !== "") && otp.length === 4) {
      handleAutoSubmit();
    }
  }, [otp]);

  const handleChange = (value: string, index: number) => {
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await apiClient.post(`${apiClient.URLS.otp}/resend`, {
        email: email,
      });

      if (res.ok) {
        toast.success("OTP resent successfully!");
        setTimeLeft(30);
        setCanResend(false);
      }
    } catch (error) {
      console.log("Error while resending OTP:", error);
    }
  };

  const handleAutoSubmit = async () => {
    const otpValue = otp.join("");
    const identifier = email || phone;
    const payload: { email?: string; phone?: string } = {};
    if (email) payload.email = email;
    if (phone) payload.phone = phone;
    setLoading(true);

    try {
      const userResponse = await apiClient.post(
        `${apiClient.URLS.otp}/check-user`,
        {
          ...payload,
        }
      );
      if (!userResponse.body?.status) {
        toast.success("Please create an account");
        router.push("/signup");
        return;
      }
    } catch (error) {
      console.log("error", error);
      toast.error("Error occurred during verification");
    }

    const result = await signIn("otp-login", {
      redirect: false,
      identifier,
      otp: otpValue,
    });

    if (result?.ok) {
      toast.success("Login successful!");
      safeTarget ? router.push(safeTarget) : router.push("/");
    } else {
      setError("Invalid OTP or something went wrong");
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await handleAutoSubmit();
  };

  const identifier = email || phone;

  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <Loader />
      ) : (
        <div className="w-full min-h-screen flex flex-col md:flex-row">
          <div className="relative md:w-[50%] flex justify-center">
            <div className="absolute inset-0">
              <div className="relative w-full md:h-full md:min-h-screen h-[90%]">
                <Image
                  src="/images/background/login.png"
                  fill
                  className="absolute opacity-[2.5] object-cover"
                  alt=""
                />
              </div>
            </div>
            <div className="flex flex-col justify-center items-center py-[80px]">
              <div className="relative w-full max-w-[330px] h-[100px] md:mb-[150px] mb-[90px] items-center gap-2 justify-center rounded-[10px] flex flex-row z-20 bg-gradient-to-b from-black/40 to-black/60">
                <div className="relative w-[82px] h-[82px]">
                  <Image
                    src="/images/logobb.png"
                    alt="logo"
                    className="absolute"
                    layout="fill"
                  />
                </div>
                <div className="flex flex-col relative">
                  <p className="font-bold text-[32px] text-[#3586FF]">
                    ONE
                    <span className="text-white">CASA</span>
                  </p>
                  <p className="text-[12px] mt-[-10px] text-center text-white">
                    One Roof Every Solution
                  </p>
                </div>
              </div>
              <p className="relative text-[32px] leading-[42px] text-center text-white font-bold">
                Excellent Property are Sales Now
              </p>
              <p className="hidden md:block">
                One Casa includes listings for various types of properties
                such as apartments, houses, villas, offices, and retail spaces.
              </p>
            </div>
          </div>

          <div className="md:w-1/2 flex items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 md:p-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                  Verify OTP
                </h1>
                <p className="text-gray-600 md:text-sm text-[12px]">
                  Enter the 4-digit OTP sent to{" "}
                  <span className="font-semibold">{identifier}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <div className="flex justify-between space-x-1 mb-4">
                    {otp.map((data, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el) as any}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={data}
                        className="w-12 h-12 md:text-xl text-[12px] text-center border border-gray-300 rounded-lg focus:border-[#3586FF] focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        onChange={(e) => handleChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                      />
                    ))}
                  </div>
                  {error && (
                    <p className="text-red-500 md:text-sm text-[12px] text-center mb-4">
                      {error}
                    </p>
                  )}
                  <div className="text-center">
                    {canResend ? (
                      <Button
                        onClick={handleResendOtp}
                        className="text-[#3586FF] hover:text-[#3586FF] font-medium md:text-sm text-[12px]"
                      >
                        Resend OTP
                      </Button>
                    ) : (
                      <p className="text-gray-600 md:text-sm text-[12px]">
                        Resend OTP in {timeLeft}s
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-2 bg-[#3586FF] hover:bg-[#3586FF]text-white font-medium rounded-lg transition-colors"
                  disabled={otp.some(digit => digit === "")}
                >
                  Verify OTP
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyOtpView;