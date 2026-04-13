import withGeneralLayout from '@/components/Layouts/GeneralLayout';
import ReferandEarnView from '@/components/HouznextRewards';
import React from 'react';
import SEO from '@/components/SEO';


const ReferandEarn = () => {
  return (
    <div>
      <SEO
        title="Houznext Rewards | Get Rewards for Referring Leads | Houznext"
        description="Refer a lead to Houznext and earn rewards! Simply refer a friend, let us contact them, and earn money when they buy a property. Start referring today and enjoy exclusive benefits!"
        keywords="Houznext Rewards,Real Estate Referral Program,Earn Money by Referring,Property Referral Rewards,Houznext Referral,Refer a Friend,Real Estate Leads,Commission for Property Referral"
/>
      <ReferandEarnView />
    </div>
  );
};

export default withGeneralLayout(ReferandEarn);
