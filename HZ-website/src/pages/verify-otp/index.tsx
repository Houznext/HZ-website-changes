import VerifyOtpView from "@/components/VerifyOtpView";
import React from "react";
import SEO from '@/components/SEO';


const VerifyOtp = () => {
  return (
    <div className="">
      <SEO
        title="Verify OTP | Secure One-Time Password Verification | OneCasa"
        description="Ensure secure and seamless access with OneCasa's OTP verification. Enter your one-time password to proceed with login, registration, or transactions."
        keywords="Verify OTP, OTP Verification, Secure Login, One-Time Password, OneCasa Security, Secure Access, Mobile Authentication, Email OTP, Login Verification"
        imageUrl='https://www.onecasa.in/images/logobb.png'
      />

      <VerifyOtpView />
    </div>
  );
};

export default VerifyOtp;
