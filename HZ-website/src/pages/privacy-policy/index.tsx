import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import PrivacyComp from "@/components/PrivacyComp";
import React from "react";
import SEO from '@/components/SEO';


const PrivacyPolicy = () => {
  return (
    <div className="">
      <SEO
        title="Privacy Policy | Your Data Protection & Security | OneCasa"
        description="Read our Privacy Policy to understand how OneCasa collects, uses, and protects your personal information. We prioritize your data security and transparency in real estate transactions."
        keywords="Privacy Policy,Data Protection,User Privacy,Information Security,Personal Data Collection,Cookies Policy,User Rights,OneCasa Privacy,Real estate privacy"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />
      <PrivacyComp />
    </div>
  );
};
export default withGeneralLayout(PrivacyPolicy);
