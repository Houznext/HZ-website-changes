import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import PackagesComp from "@/components/LegalServicesComponent/PackagesComp";
import React from "react";
import SEO from '@/components/SEO';


const LegalPackages = () => {
  return (
    <div>
      <SEO
        title="Legal Service Packages | Affordable Property Legal Solutions | Houznext"
        description="Explore our comprehensive legal service packages for real estate transactions, property verification, dispute resolution, and documentation. Get expert legal assistance at Houznext."
        keywords="Legal Service Packages,Real Estate Legal SolutionsProperty Documentation Services,Affordable Legal Assistance,Property Dispute Resolution,Title Deed Verification,Real Estate Contracts,Houznext Legal Services"
/>
      <PackagesComp />
    </div>
  );
};
export default withGeneralLayout(LegalPackages);
