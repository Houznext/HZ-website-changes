
import PackageLayout from '@/components/Layouts/PackageLayout';
import PackageCard from '@/components/PremiumPackages/PackageCard';
import SEO from '@/components/SEO';
import React from 'react'

const Packages = () => {
  return (
    <div className="">
      <SEO
        title="Privacy Policy | Your Data Protection & Security | OneCasa"
        description="Read our Privacy Policy to understand how OneCasa collects, uses, and protects your personal information. We prioritize your data security and transparency in real estate transactions."
        keywords="Privacy Policy,Data Protection,User Privacy,Information Security,Personal Data Collection,Cookies Policy,User Rights,OneCasa Privacy,Real estate privacy"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />
      <PackageCard />
    </div>
  );
};
export default PackageLayout(Packages);