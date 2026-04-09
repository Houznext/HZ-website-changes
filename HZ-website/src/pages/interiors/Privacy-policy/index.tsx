import withGeneralLayout from "@/components/Layouts/GeneralLayout";

import InteriorsPrivacyPolicy from "@/components/Products/components/SubServices/InteriorsComponent/InteriorsPrivacyComp";
import React from "react";
import SEO from '@/components/SEO';


const interiorsPrivacyPolicy = () => {
  return (
    <div className="">
      <SEO
        title="Privacy Policy | Your Data Protection & Security | Houznext"
        description="Read our Privacy Policy to understand how Houznext collects, uses, and protects your personal information. We prioritize your data security and transparency in real estate transactions."
        keywords="Privacy Policy,Data Protection,User Privacy,Information Security,Personal Data Collection,Cookies Policy,User Rights,Houznext Privacy,Real estate privacy"
      />
      <InteriorsPrivacyPolicy />
    </div>
  );
};
export default withGeneralLayout(interiorsPrivacyPolicy);
