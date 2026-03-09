import ForgotPasswordView from "@/components/ForgotPasswordView";
import React from "react";
import SEO from '@/components/SEO';


const ForgotPassword = () => {
  return (
    <div>
      <SEO
        title="Reset Your Password | OneCasa Account Recovery"
        description="Review your selected products and proceed to checkout. Complete your purchase with OneCasa and bring your dream home to life!Forgot your password? No worries! Enter your details to reset your OneCasa account password securely and regain access to your account."
        keywords="Forgot Password,Reset Password,OneCasa Account Recovery,Login Assistance,Recover Account,Password Reset Link,Secure Login"
      />
      <ForgotPasswordView />
    </div>
  );
};

export default ForgotPassword;
