
import PackageLayout from '@/components/Layouts/PackageLayout';
import PackageCard from '@/components/PremiumPackages/PackageCard';
import SEO from '@/components/SEO';
import React from 'react'

const Packages = () => {
  return (
    <div className="">
      <SEO
        title="Privacy Policy | Your Data Protection & Security | Houznext"
        description="Read our Privacy Policy to understand how Houznext collects, uses, and protects your personal information. We prioritize your data security and transparency in real estate transactions."
        keywords="Privacy Policy,Data Protection,User Privacy,Information Security,Personal Data Collection,Cookies Policy,User Rights,Houznext Privacy,Real estate privacy"
/>
      <PackageCard />
    </div>
  );
};
export default PackageLayout(Packages);