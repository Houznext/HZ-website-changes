import VerifyOtpView from "@/components/VerifyOtpView";
import React from "react";
import SEO from '@/components/SEO';


const VerifyOtp = () => {
  return (
    <div className="">
      <SEO
        title="Verify OTP | Secure One-Time Password Verification | Houznext"
        description="Ensure secure and seamless access with Houznext's OTP verification. Enter your one-time password to proceed with login, registration, or transactions."
        keywords="Verify OTP, OTP Verification, Secure Login, One-Time Password, Houznext Security, Secure Access, Mobile Authentication, Email OTP, Login Verification"
/>

      <VerifyOtpView />
    </div>
  );
};

export default VerifyOtp;
