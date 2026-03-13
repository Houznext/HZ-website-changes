import withUserLayout from "@/components/Layouts/UserLayout";
import ReferralProgressView from "@/components/ReferralProgressView";
import React from "react";
import SEO from '@/components/SEO';


const referralprogress = () => {
  return (
    <div className="flex w-full min-h-full">
      <SEO
        title="Referral Progress | Houznext"
        description="Track your referral progress with Houznext. Monitor earnings, shared properties, and successful referrals effortlessly."
        keywords="Referral Program, Real Estate Referral, Houznext Referral, Earn with Real Estate, Referral Earnings, Property Referrals, Real Estate Commission"
        imageUrl="https://www.houznext.com/images/logobb.png"
      />
      <ReferralProgressView />
    </div>
  );
};

export default withUserLayout(referralprogress);
