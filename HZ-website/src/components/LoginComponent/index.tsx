import React, { useState, useRef } from "react";
import CustomInput from "@/common/FormElements/CustomInput";
import Image from "next/image";
import { EmailIcon } from "../Products/icons";
import { useRouter } from "next/router";
import apiClient from "@/utils/apiClient";
import { useRegisterUpStore } from "@/store/loginstore";
import Loader from "../Loader";
import Button from "@/common/Button";
import toast from "react-hot-toast";
import ReactGA from "react-ga4";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Link from "next/link";

interface LoginFormValues {
  phone: string;
  email: string;
  callbackUrl?: string;
}

export default function LoginComponent() {
  const [loginFormValues, setLoginFormValues] = useState<LoginFormValues>({
    phone: "",
    email: "",
    callbackUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setRegisterState = useRegisterUpStore(
    (state) => state.setRegisterState
  );
  const router = useRouter();
  const { callbackurl } = router.query;
  const [isEmail, setIsEmail] = useState(false);

  const handleFormValues = (e: any, name: string) => {
    setLoginFormValues((prev) => ({ ...prev, [name]: e.target.value }));
    setError("");
  };

  const validateForm = (): boolean => {
    if (isEmail && !loginFormValues.email.trim()) {
      setError("Email is required");
      return false;
    } else if (!isEmail && !loginFormValues.phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    return true;
  };

  const trackUserLogin = (loginValues: LoginFormValues) => {
    if (typeof window !== "undefined") {
      (window as any).gtag("set", {
        user_id: loginValues.email || loginValues.phone, // Set user ID as email or phone
        email: loginValues.email,
      });
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");

      const payload = isEmail
        ? { email: loginFormValues.email }
        : { phone: loginFormValues.phone };

      const res = await apiClient.post(`${apiClient.URLS.otp}/send`, payload);

      if (res.status === 201) {
        const normalizedCallbackUrl = typeof callbackurl === "string" ? callbackurl : "/";
        setRegisterState({ ...loginFormValues, callbackUrl: normalizedCallbackUrl });
        trackUserLogin(loginFormValues);
        toast.success("OTP sent successfully!");
        router.push("/verify-otp");
      }
    } catch (error: any) {
      console.error("Error during OTP send:", error);

      if (error.response?.status === 400) {
        setError("Invalid phone number or email");
        toast.error("Invalid phone number or email");
      } else {
        setError("Something went wrong. Please try again.");
        toast.error("Something went wrong. Please try again.");
      }
      setLoading(false);
    }

    ReactGA.event({
      category: "User Interaction",
      action: "login form",
      label: "login button",
    });
  };

  const sliderRef = useRef<any>(null);

  const [currentSlide, setCurrentSlide] = useState(0);

  const sliderSettings = {
    dots: true,
    appendDots: (dots: any) => (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "30px",
          marginTop: "60px",
        }}
      >
        {dots}
      </div>
    ),
    beforeChange: (current: number, next: number) => {
      setCurrentSlide(next);
    },

    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 2000,
    slidesToShow: 1,
    slidesToScroll: 1,
    customPaging: (i: number) => (
      <div
        style={{
          width: "77px",
          height: "16px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: i === currentSlide ? "77px" : "16px",
            height: "16px",
            borderRadius: i === currentSlide ? "15px" : "50%",
            backgroundColor: i === currentSlide ? "#3586FF" : "#91B3E5",
            transition: "all 0.3s ease-in-out",
            margin: "45px 16 px ",
            display: "inline-block",
          }}
        />
      </div>
    ),

    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 425,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };
  const listItems = [
    {
      id: 1,
      image: "/images/background/loginimage1.png",
    },
    {
      id: 2,
      image: "/images/background/loginimage2.jpg",
    },
    {
      id: 3,
      image: "/images/background/loginimage3.jpg",
    },
  ];

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="w-full min-h-[inherit] flex md:flex-row flex-col gap-y-[40px] items-center border-yellow-300">
          <div className="  md:w-[47%] w-[100%] md:block hidden min-h-screen  bg-[#F1F6FD]">
            <div className="relative w-full  ">
              <Slider ref={sliderRef} {...sliderSettings}>
                {listItems.map((item, index) => (
                  <div className="flex flex-col items-center gap-y-[48px] pb-[34px]" key={index}>
                    <div
                      key={index}
                      className="relative md:w-[750px] min-[1440px] w-[950px]  md:h-[457px] h-[125px] "
                    >
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        className="rounded-br-[105px] object-cover"
                      />

                      <div className="absolute inset-0 flex  items-start mt-[20px] pl-[25px] z-10">
                        <div className="relative max-w-[243.45px] min-h-[80px] flex items-center gap-x-[9px] justify-center" onClick={() => router.push("/")}>
                          <div className="relative w-[80.15px] h-[80px]">
                            <Image
                              src="/images/logobb.png"
                              alt="logo"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div className="flex flex-col justify-center pt-[8px] items-center">
                            <div className=" flex gap-x-[2px]  mb-0">
                              <p className="font-bold text-[21.38px] leading-[30.47px] text-[#000000]">
                                ONE
                                <span className="text-[#3586FF]">CASA</span>
                              </p>
                            </div>
                            <div className="max-w-[148.28px] min-h-[13.08px]  mb-0">
                              <p className="font-bold text-[#000000] text-[8.97px] leading-[12.78px] tracking-[0.12em] ">
                                One Roof Every Solution
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className=" w-full text-center flex flex-col items-center mx-auto gap-y-[16px]">
                      <p className="max-w-[517px] min-h-[44px] text-[#3586FF] font-bold text-center md:text-[24px] text-[18px] md:leading-[44.17px] leading-[34.17px]">
                        Excellent Properties are on Sale Now
                      </p>
                      <p className="max-w-[662px] min-h-[46px] text-[#8C8989] font-medium text-center md:text-[14px] text-[12x] md:leading-[22.8px] leading-[18.52px]">
                        The perfect opportunity to own your dream property is
                        here! From elegant apartments and luxurious villas to
                        prime commercial spaces, our exclusive listings offer
                        something for everyone.{" "}
                      </p>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
          <div className="relative md:hidden block h-[100px] w-full">
            <Image
              src={"/images/background/loginimage1.png"}
              alt=""
              fill
              className="rounded-br-[105px] object-cover"
            />
          </div>

          <div className=" xl:p-10 md:w-[50%] md:my-auto w-full p-5">
            <div className="max-w-[490px] mx-auto">
              <h1 className="font-bold md:text-[32px] text-[24px] leading-[24px] mb-3">
                Login/Register
              </h1>
              <h2 className="leading-[22.8px] text-gray-400 text-[14px] font-regular mb-[22px]">
                Please enter your {isEmail ? "Email" : "Phone Number"}
              </h2>
              <form className="mb-10" onSubmit={handleSubmit}>
                <CustomInput
                  name={isEmail ? "email" : "phone"}
                  label={isEmail ? "Email" : "Phone Number"}
                  rootCls="mb-6"
                  labelCls="text-base font-medium md:text-[14px] text-[14px]"
                  type={isEmail ? "email" : "number"}
                  required
                  errorMsg={error}
                  placeholder={`Enter your ${isEmail ? "email" : "phone number"
                    }`}
                  className=" md:text-[14px] py-1 text-[12px] font-regular"
                  outerInptCls="border-[#A8A9B0] bg-white  shadow-custom focus-within:bg-white"
                  onChange={(e) =>
                    handleFormValues(e, isEmail ? "email" : "phone")
                  }
                />

                <Button
                  type="submit"
                  className="flex w-full font-medium md:py-2 py-2 md:text-[14px] text-[12px] rounded-[8px] bg-[#3586FF] items-center justify-center font-500  leading-[20.5px] text-[#FFFFFF]"
                >
                  Continue
                </Button>

                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="mx-4 text-gray-500 font-medium">or</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>


                <Button
                  className="flex w-full md:py-2 py-2 md:text-[14px] text-[12px] rounded-[8px] border-2 border-gray-300 items-center justify-center font-500  leading-[20.5px] text-gray-500"
                  onClick={() => setIsEmail(!isEmail)}
                >
                  <div className="flex flex-row justify-center items-center ">
                    <div>
                      <EmailIcon />
                    </div>
                    <p className="ml-2 font-medium text-[#3586FF]">
                      Continue with {isEmail ? "Phone" : "Email"}
                    </p>
                  </div>
                </Button>
              </form>

              <h2 className="text-sm text-center text-gray-400">
                By clicking you agree to{" "}
                <Link href="/terms" className="text-[#3586FF] font-medium">
                  Terms and Conditions
                </Link>
              </h2>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
