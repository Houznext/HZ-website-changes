import React from "react";
import LoansComponent from "@/components/Products/components/SubServices/LoansComponent";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import SEO from '@/components/SEO';


const Loans = () => {
  return (
    <div>
      <SEO
        title="Home Loans | Affordable Housing & Property Loans | OneCasa"
        description="Get the best home loan deals with low-interest rates and easy EMI options. OneCasa helps you finance your dream home with hassle-free loan approvals."
        keywords="Home Loans, Housing Loans, Property Loans, Mortgage Loans, Low-Interest Home Loans, EMI Home Loans, OneCasa Loans, Real Estate Financing, Home Loan Approval"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />
      <LoansComponent />
    </div>
  );
};

export default withGeneralLayout(Loans);
