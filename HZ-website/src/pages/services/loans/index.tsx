import React from "react";
import LoansComponent from "@/components/Products/components/SubServices/LoansComponent";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import SEO from '@/components/SEO';


const Loans = () => {
  return (
    <div>
      <SEO
        title="Home Loans | Affordable Housing & Property Loans | Houznext"
        description="Get the best home loan deals with low-interest rates and easy EMI options. Houznext helps you finance your dream home with hassle-free loan approvals."
        keywords="Home Loans, Housing Loans, Property Loans, Mortgage Loans, Low-Interest Home Loans, EMI Home Loans, Houznext Loans, Real Estate Financing, Home Loan Approval"
/>
      <LoansComponent />
    </div>
  );
};

export default withGeneralLayout(Loans);
