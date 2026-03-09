import React, { useState } from "react";
import CustomInput from "@/common/FormElements/CustomInput";
import { Button } from "@mui/material";
import Image from "next/image";
import Loader from "../Loader";
import apiClient from "@/utils/apiClient";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useRegisterUpStore } from "@/store/loginstore";

export default function SignUpComponent() {
  const [signUpDetails, setSignUpDetails] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    agent: null,
  });

  const [error, setError] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || "/admin/dashboard";


  const storeEmail = useRegisterUpStore((state) => state.email);
  const storePhone = useRegisterUpStore((state) => state.phone);

  const validateForm = () => {
    const errors = {
      fullName: "",
      phone: "",
      email: "",
      password: "",
    };
    let isValid = true;

    if (!signUpDetails.fullName.trim()) {
      errors.fullName = "Full Name is required";
      isValid = false;
    }
    if (!signUpDetails.email.trim() && !storeEmail) {
      errors.email = "Email is required";
      isValid = false;
    }

    if (!signUpDetails.phone.trim() && !storePhone) {
      errors.phone = "Phone Number is required";
      isValid = false;
    }

    if (!signUpDetails.password.trim()) {
      errors.password = "Password is required";
      isValid = false;
    }

    setError(errors);
    return isValid;
  };

  const handleFormValues = (e: any, name: string) => {
    setSignUpDetails((prev) => ({
      ...prev,
      [name]: e.target.value,
    }));
    setError((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleAgentSelection = (isAgent: boolean) => {
    setSignUpDetails((prev: any) => ({ ...prev, agent: isAgent }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const payload = {
        email: storeEmail || signUpDetails.email,
        phone: storePhone || signUpDetails.phone,
        fullName: signUpDetails.fullName,
        password: signUpDetails.password,
        agent: signUpDetails.agent,
      };

      const res = await apiClient.post(apiClient.URLS.user, payload);

      if (res?.status === 201) {
        const loginResult = await signIn("credentials", {
          redirect: false,
          identifier: payload.email || payload.phone,
          password: signUpDetails.password,
        });

        if (loginResult?.ok) {
          toast.success("Registration successful!");
          router.push(redirect);

        } else {
          toast.error("Login failed. Try again!");
        }
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.status === 409) {
        const message = error.body?.message || "Already registered!";
        toast.error(message);
        setError((prev) => ({ ...prev, email: message, phone: message }));
      } else {
        toast.error("Something went wrong. Try again!");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <div className="w-full min-h-[inherit] h-full flex md:flex-row flex-col">
          <div className="relative md:w-[45%] min-h-full  flex justify-center">
            <div className="absolute inset-0">
              <div className="relative w-full h-full">
                <Image
                  src="/images/background/login.png"
                  fill
                  className="absolute opacity-[2.5]"
                  objectFit="cover"
                  alt="Background"
                />
              </div>
            </div>
            <div className="flex flex-col justify-center items-center py-[80px]">
              <div className="relative w-full max-w-[330px] h-[100px] mb-[150px] items-center gap-2 justify-center rounded-[10px] flex flex-row z-20 bg-gradient-to-b from-black/40 to-black/60">
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
                    ONE<span className="text-white">CASA</span>
                  </p>
                  <p className="text-[12px] mt-[-10px] text-center text-white">
                    One Roof Every Solution
                  </p>
                </div>
              </div>
              <p className="relative text-[32px] leading-[42px] text-center text-white font-bold">
                Excellent Property Sales Now
              </p>
              <p className="text-white text-center">
                One Casa includes listings for various types of properties
                such as apartments, houses, villas, offices, and retail spaces.
              </p>
            </div>
          </div>

          <div className="relative md:w-[55%] flex flex-col items-center justify-center bg-white p-10">
            <div className="max-w-[350px] w-full">
              <h1 className="text-2xl font-bold mb-4">Create Account</h1>
              <h2 className="text-[14px] text-gray-500 mb-6">
                Please enter your details to create an account.
              </h2>

              <CustomInput
                name="fullName"
                label="Full Name"
                value={signUpDetails.fullName}
                onChange={(e) => handleFormValues(e, "fullName")}
                errorMsg={error.fullName}
                placeholder="Enter your Full Name"
                required
                className="text-[14px] px-2 "
                labelCls="font-medium md:text-[16px] text-[14px]"
                rootCls="mb-6"
                type={"text"} />

              <CustomInput
                name="email"
                label="Email Id"
                value={storeEmail || signUpDetails.email}
                disabled={!!storeEmail}
                onChange={(e) => handleFormValues(e, "email")}
                errorMsg={error.email}
                placeholder="Enter your Email"
                required
                type="text"
                className="text-[14px] px-2 md:py-[6px] py-1"
                labelCls="font-medium md:text-[16px] text-[14px]"
                rootCls="mb-6"
              />

              <CustomInput
                name="phone"
                label="Phone Number"
                value={storePhone || signUpDetails.phone}
                disabled={!!storePhone}
                onChange={(e) => handleFormValues(e, "phone")}
                errorMsg={error.phone}
                placeholder="Enter your Phone Number"
                required
                className="text-[14px] px-2 md:py-[6px] py-1"
                labelCls="font-medium md:text-[16px] text-[14px]"
                rootCls="mb-6"
                type={"number"}
              />

              <CustomInput
                name="password"
                label="Password"
                value={signUpDetails.password}
                onChange={(e) => handleFormValues(e, "password")}
                errorMsg={error.password}
                placeholder="Enter your Password"
                type="password"
                required
                className="text-[14px] px-2 md:py-[6px] py-1"
                labelCls="font-medium md:text-[16px] text-[14px]"
                rootCls="mb-6"
              />


              <div className="mb-6">
                <p className="text-[14px] mb-2 font-medium">Are you a Real Estate Agent?</p>
                <div className="flex gap-4">
                  <Button
                    className={`w-[75px] h-[40px] rounded-md border-2 border-black font-medium ${signUpDetails.agent === true
                      ? "bg-[#3586FF] !text-white"
                      : "bg-gray-200 text-black "
                      }`}
                    onClick={() => handleAgentSelection(true)}
                  >
                    Yes
                  </Button>
                  <Button
                    className={`w-[75px] h-[40px] rounded-md border-2 border-black font-medium ${signUpDetails.agent === false
                      ? "bg-[#3586FF] !text-white"
                      : "bg-gray-200 text-black border-2 border-black"
                      }`}
                    onClick={() => handleAgentSelection(false)}
                  >
                    No
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-[6px] btn-text rounded-md bg-[#3586FF] text-white font-medium"
                onClick={handleSignup}
              >
                Create Account
              </Button>
              <div className="mt-4 font-medium">
                <p>
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-[#3586FF] font-medium"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
