import withUserLayout from "@/components/Layouts/UserLayout";
import ReferralProgressView from "@/components/ReferralProgressView";
import React from "react";
import SEO from '@/components/SEO';


const referralprogress = () => {
  return (
    <div className="flex w-full min-h-full">
      <SEO
        title="Referral Progress | OneCasa"
        description="Track your referral progress with OneCasa. Monitor earnings, shared properties, and successful referrals effortlessly."
        keywords="Referral Program, Real Estate Referral, OneCasa Referral, Earn with Real Estate, Referral Earnings, Property Referrals, Real Estate Commission"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />
      <ReferralProgressView />
    </div>
  );
};

export default withUserLayout(referralprogress);
