import SignUpComponent from "@/components/SignUpComponent";
import React from "react";
import SEO from '@/components/SEO';


function SignUp() {
  return (
    <div className="w-full min-h-screen">
      <SEO
        title="Sign Up | Join Houznext Today"
        description="Create your Houznext account today and explore exclusive property listings, real estate deals, and personalized recommendations. Sign up now to get started!"
        keywords="Sign Up, Houznext Registration, Create Account, Real Estate Signup, Property Listings, Join Houznext, Real Estate Platform, New User Registration"
        imageUrl="https://www.houznext.com/images/logobb.png"
      />

      <SignUpComponent />
    </div>
  );
}

export default SignUp;
