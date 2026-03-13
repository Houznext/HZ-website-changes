import React from "react";
import LoansHeroSection, { ILoansHeroSectionprops } from "./LoansHeroSection";
import HowitWorks, { IHowitWorksprops } from "./HowitWorks";
import HomeLoanBanking, { IHomeLoanBankingprops } from "./HomeLoanBanking";
import HomeLoanCalculation from "./HomeLoanCalculation";
import HomeLoanFaqs, { IHomeLoanFaqsprops } from "./HomeLoanFaqs";
import GoogleAdSense from "@/components/GoogleAdSense";

export default function LoansComponent() {
  const LoansHeroSectionData: ILoansHeroSectionprops = {
    heading: "Houznext",
    subheading: "Apply Home Loan at Houznext",
    bgimageurl: "/images/custombuilder/subservices/Loans/Loansherosection.png",
    listItems: [
      {
        id: 1,
        loanicon: "/images/custombuilder/subservices/Loans/loanicon1.png",
        loanicontext: "Loan Offers from 15+ Banks",
      },
      {
        id: 2,
        loanicon: "/images/custombuilder/subservices/Loans/loanicon2.png",
        loanicontext: "Highest Loan Value & Lowest ROI",
      },
      {
        id: 3,
        loanicon: "/images/custombuilder/subservices/Loans/loanicon3.png",

        loanicontext: "Quickest Sanction across all Banks",
      },
    ],

    iconurl: "/images/custombuilder/subservices/Loans/loanrupeeicon.png",
  };
  const HowitWorksData: IHowitWorksprops = {
    heading: "How it Works",
    icon: "/images/custombuilder/subservices/Loans/howitworks/arrowicon.png",
    listItems: [
      {
        id: 1,
        iconurl:
          "/images/custombuilder/subservices/Loans/howitworks/filldetails.png",
        title: "Fill Details",
        description:
          "Provide your contact details and Check Loan Amount Eligibility.",
      },
      {
        id: 2,
        iconurl:
          "/images/custombuilder/subservices/Loans/howitworks/funding.png",
        title: " Funding",
        description:
          "Property’s value as home loan from the Bank of your choice.",
      },
      {
        id: 3,
        iconurl:
          "/images/custombuilder/subservices/Loans/howitworks/Nocharges.png",
        title: "No Charges",
        description: "Get Home Loan Services from without paying any fees.",
      },
    ],
  };
  const HomeLoanBankingData: IHomeLoanBankingprops = {
    heading: "Home Loan Banking Partners",
    listItems: [
      {
        id: 1,
        image:
          "/images/custombuilder/subservices/Loans/homeloanbanking/indianbank.png",
        title: "Indian Bank",
        description: "Max Tenure: 23 years",
        interest: "Interest rate: 86%",
      },
      {
        id: 2,
        image:
          "/images/custombuilder/subservices/Loans/homeloanbanking/sbi.png",
        title: "SBI Home loan",
        description: "Max Tenure: 18 years",
        interest: "Interest rate: 44%",
      },
      {
        id: 3,
        image:
          "/images/custombuilder/subservices/Loans/homeloanbanking/hdfc.png",
        title: "HDFC Bank",
        description: "Max Tenure: 28 years",
        interest: "Interest rate: 58%",
      },
      {
        id: 4,
        image:
          "/images/custombuilder/subservices/Loans/homeloanbanking/icici.png",
        title: "ICICI Bank",
        description: "Max Tenure: 31 years",
        interest: "Interest rate: 39%",
      },
      {
        id: 4,
        image:
          "/images/custombuilder/subservices/Loans/homeloanbanking/canada.png",
        title: "Canada Bank",
        description: "Max Tenure: 21 years",
        interest: "Interest rate: 89%",
      },
      {
        id: 6,
        image:
          "/images/custombuilder/subservices/Loans/homeloanbanking/axis.png",
        title: "Axis Bank",
        description: "Max Tenure: 23 years",
        interest: "Interest rate: 86%",
      },
      {
        id: 7,
        image:
          "/images/custombuilder/subservices/Loans/homeloanbanking/karurvysa.png",
        title: "Karur Vysya Bank ",
        description: "Max Tenure: 32 years",
        interest: "Interest rate: 90%",
      },
      {
        id: 8,
        image:
          "/images/custombuilder/subservices/Loans/homeloanbanking/Lic.png",
        title: "LIC Bank",
        description: "Max Tenure: 31 years",
        interest: "Interest rate: 39%",
      },
    ],
  };
  const HomeloanFaqsdata: IHomeLoanFaqsprops = {
    heading: "Home Loan FAQs",

    Faqs: [
      {
        id: 1,
        question: "What are the key features and benefits of home loans?",
        answer:
          "Home loans offer affordable interest rates, flexible repayment tenures, and high loan amounts based on income and property value. They provide tax benefits under Sections 80C and 24(b) and improve credit scores with timely EMI payments. Borrowers can also avail top-up loans, prepayment options, and balance transfers for better flexibility. ",
      },
      {
        id: 2,
        question: "What are the different types of home loans available?",
        answer:
          "The main types of home loans include home purchase loans for buying a property, home construction loans for building on owned land, and home renovation or improvement loans for repairs. Other options include home loan balance transfer to switch lenders, top-up loans for extra funds, and bridge loans to finance new property purchases before selling existing ones.",
      },
      {
        id: 3,
        question: "What are the different types of home loan fees and charges?",
        answer:
          "Home loan fees include processing fees (0.5%-1% of the loan amount), legal and technical charges for property verification, and prepayment or foreclosure charges (often waived for floating-rate loans). Other charges may include late payment penalties, administrative fees, and loan insurance premiums if opted.",
      },
      {
        id: 4,
        question:
          "What are the factors you should know before applying for a home loan?",
        answer:
          "Before applying for a home loan, consider the interest rate type (fixed or floating), loan tenure that affects EMI affordability, and processing fees or hidden charges. Evaluate your credit score, eligibility criteria, and tax benefits under Sections 80C and 24(b). Also, compare lenders for better balance transfer options and prepayment flexibility.",
      },
      {
        id: 5,
        question: "How does Credit score impact your interest rate?",
        answer:
          "A higher credit score (750 or above) indicates good financial discipline, leading to lower interest rates and better loan terms. Conversely, a lower credit score increases the perceived risk for lenders, resulting in higher interest rates or potential loan rejection. Maintaining a good score helps secure affordable EMIs and favorable repayment options.",
      },
    ],
  };
  return (
    <>
      <div>
        <div className="mb-[45px] md:mb-[64px]">
          <LoansHeroSection {...LoansHeroSectionData} />
        </div>
        <div className="mb-[45px] md:mb-[64px] md:mt-[0px] mt-[110%]">
          <HowitWorks {...HowitWorksData} />
        </div>
        <div className="mb-[45px] md:mb-[64px]">
          <HomeLoanBanking {...HomeLoanBankingData} />
        </div>
        <div className="md:px-8 px-3 mb-[45px] max-w-[98%] mx-auto md:mb-[64px] flex flex-col items-center gap-4">

          <GoogleAdSense />
        </div>

        <div className="mb-[45px] md:mb-[64px]">
          <HomeLoanCalculation />
        </div>
        <div className="mb-[45px] md:mb-[64px]">
          <HomeLoanFaqs {...HomeloanFaqsdata} />
        </div>
      </div>
    </>
  );
}
