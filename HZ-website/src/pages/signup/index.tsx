import SignUpComponent from "@/components/SignUpComponent";
import React from "react";
import SEO from '@/components/SEO';


function SignUp() {
  return (
    <div className="w-full min-h-screen">
      <SEO
        title="Sign Up | Join OneCasa Today"
        description="Create your OneCasa account today and explore exclusive property listings, real estate deals, and personalized recommendations. Sign up now to get started!"
        keywords="Sign Up, OneCasa Registration, Create Account, Real Estate Signup, Property Listings, Join OneCasa, Real Estate Platform, New User Registration"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />

      <SignUpComponent />
    </div>
  );
}

export default SignUp;
