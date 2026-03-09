import React from "react";
import LegalServicesHeroSection, {
  ILegalServicesHerosectionProps,
} from "./LegalServicesHeroSection";
import WhyChooseDreamcasa, {
  IWhyChooseDreamcasaprops,
} from "./WhyChooseDreamcasa";
import HowItWorks, { IHowitWorksprops } from "./HowItWorks";
import WorkWithExpertLawyers, {
  IWorkWithExpertLawyersprops,
} from "./WorkWithExpertLawyers";
import TestimonialsSection, {
  ITestimonialsSectionProps,
} from "../Products/components/SubServices/Components/TestimonialsSection";
import ConsultLegalExpert, {
  IConsultExpertWhyProps,
} from "./ConsultLegalExpert";
import GoogleAdSense from "@/components/GoogleAdSense";
import HomeLoanFaqs, {
  IHomeLoanFaqsprops,
} from "../Products/components/SubServices/LoansComponent/HomeLoanFaqs";

export default function LegalServicesComponent() {
  const LegalServicesHeroSectionData: ILegalServicesHerosectionProps = {
    heading: "Complete Legal Solutions for Real Estate",
    bgimageurl:
      "/images/legalservices/herosection/legalservicesherosection.png",
    customericon: "/images/legalservices/herosection/Customers.png",
    ratingicon: "/images/legalservices/herosection/Rating.png",
    listItems: [
      {
        id: 1,
        title: "Expert Legal Professionals",
        iconurl: "/images/legalservices/herosection/Vector1.png",
        description: "Verified lawyers with 10+ years experience",
      },
      {
        id: 2,
        title: "End-to-End Documentation Support",
        iconurl: "/images/legalservices/herosection/vector2.png",
        description: "From verification to registration assistance",
      },
      {
        id: 3,
        title: "Transparent & Affordable Pricing",
        iconurl: "/images/legalservices/herosection/vector3.png",
        description: "No hidden charges, pay only for what you need",
      },
    ],
    cardItems: {
      packages: [
        {
          title: "Property Title Verification",
          features: [
            "Complete title search (30 years)",
            "Encumbrance certificate check",
            "Legal opinion report",
            "Owner verification",
          ],
          price: "₹4,999",
          originalPrice: "₹7,999",
          buttonText: "Book Now",
        },
        {
          title: "Sale Deed Package",
          features: [
            "Sale deed drafting & review",
            "Stamp duty calculation",
            "Registration assistance",
            "Document filing support",
          ],
          price: "₹8,999",
          originalPrice: "₹12,999",
          buttonText: "Book Now",
        },
        {
          title: "Complete Buyer Assistance",
          features: [
            "Title verification",
            "Agreement drafting",
            "Registration support",
            "Possession handover",
          ],
          price: "₹14,999",
          originalPrice: "₹19,999",
          buttonText: "Book Now",
        },
        {
          title: "Property Registration Package",
          features: [
            "Document preparation",
            "Sub-registrar coordination",
            "Biometric assistance",
            "Registered deed collection",
          ],
          price: "₹6,999",
          originalPrice: "₹9,999",
          buttonText: "Book Now",
        },
        {
          title: "Khata Transfer Service",
          features: [
            "BBMP/Municipal application",
            "Document submission",
            "Follow-up with authorities",
            "New khata collection",
          ],
          price: "₹7,999",
          originalPrice: "₹11,999",
          buttonText: "Book Now",
        },
        {
          title: "Property Tax Services",
          features: [
            "Tax assessment",
            "Online payment assistance",
            "Receipt collection",
            "Arrears settlement support",
          ],
          price: "₹2,999",
          originalPrice: "₹4,999",
          buttonText: "Book Now",
        },
        {
          title: "Mutation & Name Transfer",
          features: [
            "Revenue records update",
            "Name change in records",
            "RTC/Pahani update",
            "Certified copy collection",
          ],
          price: "₹5,999",
          originalPrice: "₹8,999",
          buttonText: "Book Now",
        },
        {
          title: "Complete Seller Package",
          features: [
            "Property valuation certificate",
            "NOC arrangements",
            "Sale deed coordination",
            "TDS compliance support",
          ],
          price: "₹12,999",
          originalPrice: "₹16,999",
          buttonText: "Book Now",
        },
      ],
      services: [
        {
          title: "Legal Notice Drafting",
          features: [
            "Professional notice drafting",
            "Lawyer consultation",
            "Dispatch & proof of service",
            "Follow-up support",
          ],
          price: "₹3,499",
          originalPrice: "₹5,999",
          buttonText: "Book Now",
        },
        {
          title: "Agreement Drafting",
          features: [
            "Sale/Rent agreement",
            "Legal vetting",
            "Notarization support",
            "2 revisions included",
          ],
          price: "₹2,999",
          originalPrice: "₹4,999",
          buttonText: "Book Now",
        },
        {
          title: "Power of Attorney",
          features: [
            "POA drafting",
            "Notarization",
            "Registration assistance",
            "Legal consultation",
          ],
          price: "₹4,999",
          originalPrice: "₹7,499",
          buttonText: "Book Now",
        },
        {
          title: "RERA Complaint Filing",
          features: [
            "Case analysis",
            "Complaint drafting",
            "Filing assistance",
            "Initial hearing support",
          ],
          price: "₹9,999",
          originalPrice: "₹14,999",
          buttonText: "Book Now",
        },
        {
          title: "Will Drafting",
          features: [
            "Legal will preparation",
            "Asset documentation",
            "Witness arrangement",
            "Notarization",
          ],
          price: "₹5,999",
          originalPrice: "₹8,999",
          buttonText: "Book Now",
        },
        {
          title: "Property Dispute Consultation",
          features: [
            "60-min lawyer consultation",
            "Case strategy discussion",
            "Document review",
            "Next steps guidance",
          ],
          price: "₹1,999",
          originalPrice: "₹3,499",
          buttonText: "Book Now",
        },
        {
          title: "BESCOM/Utility Transfer",
          features: [
            "Electricity connection transfer",
            "Application assistance",
            "Document submission",
            "New connection support",
          ],
          price: "₹2,499",
          originalPrice: "₹3,999",
          buttonText: "Book Now",
        },
        {
          title: "Society NOC Services",
          features: [
            "Society NOC application",
            "Document coordination",
            "Follow-up with society",
            "NOC collection",
          ],
          price: "₹3,999",
          originalPrice: "₹5,999",
          buttonText: "Book Now",
        },
      ],
    },
  };

  const WhyChooseDreamcasData: IWhyChooseDreamcasaprops = {
    heading: "Why Choose Dreamcasa Legal Services?",
    listItems: [
      {
        id: 1,
        title: "Verified Legal Professionals",
        image:
          "/images/legalservices/whychoosedreamcasa/propertydocumentation.png",
        cardwidth: "max-w-[249px]",
      },
      {
        id: 2,
        title: "24x7 Support & Guidance",
        image: "/images/legalservices/whychoosedreamcasa/professionals.png",
        cardwidth: "max-w-[389px]",
      },
      {
        id: 3,
        title: "Real-time Case Updates",
        image: "/images/legalservices/whychoosedreamcasa/realtime.png",
        cardwidth: "max-w-[264px]",
      },
    ],
  };

  const ConsultLegalExpertData: IConsultExpertWhyProps = {
    heading: "Why Consult Our Legal Experts?",
    image: "/images/legalservices/consultexpertwhy/consultexpertwhyimage.png",
    subheading:
      "Property transactions involve complex legalities. Our expert lawyers ensure your investment is protected with thorough due diligence and proper documentation at every step.",
    listItems: [
      {
        id: 1,
        title: "Complete Legal Due Diligence",
        description:
          "Comprehensive property verification covering title, ownership, encumbrances, and legal compliance to protect your investment.",
        image: "/images/legalservices/consultexpertwhy/endtoend.png",
      },
      {
        id: 2,
        title: "Fast Turnaround Time",
        description:
          "Get your legal work done efficiently with our streamlined processes, saving you valuable time without compromising quality.",
        image: "/images/legalservices/consultexpertwhy/quickassessment.png",
      },
      {
        id: 3,
        title: "Expert Legal Guidance",
        description:
          "Personalized advice from experienced property lawyers who understand local regulations and can navigate complex situations.",
        image: "/images/legalservices/consultexpertwhy/appropriateadvice.png",
      },
      {
        id: 4,
        title: "Transparent Pricing Model",
        description:
          "Clear upfront pricing with no hidden costs. Pay only for the services you need with complete billing transparency.",
        image: "/images/legalservices/consultexpertwhy/nohiddenchages.png",
      },
    ],
  };

  const HowitWorksData: IHowitWorksprops = {
    heading: "How It Works",
    icon: "/images/legalservices/howitworks/arrowicon.png",
    listItems: [
      {
        id: 1,
        iconurl: "/images/legalservices/howitworks/fillyourdetails.png",
        title: "Select Your Service",
        description:
          "Choose from our range of legal packages or individual services based on your requirement.",
      },
      {
        id: 2,
        iconurl: "/images/legalservices/howitworks/contactwithlawyer.png",
        title: "Connect with Expert Lawyer",
        description:
          "We assign a verified lawyer from our network who specializes in property matters.",
      },
      {
        id: 3,
        iconurl: "/images/legalservices/howitworks/discusswithlegalmatter.png",
        title: "Complete Documentation",
        description:
          "Our lawyer handles all paperwork, verification, and coordination with authorities end-to-end.",
      },
    ],
  };

  const LegalServiceFaqsData: IHomeLoanFaqsprops = {
    heading: "Frequently Asked Questions",
    Faqs: [
      {
        id: 1,
        question: "What documents do I need for property title verification?",
        answer:
          "For title verification, you need the sale deed, previous ownership documents (30 years chain), encumbrance certificate, property tax receipts, approved building plan, and occupancy certificate (if applicable). Our team will guide you on any additional documents specific to your property.",
      },
      {
        id: 2,
        question: "How long does the property verification process take?",
        answer:
          "Complete property verification typically takes 7-15 working days, depending on document availability and complexity. This includes title search, EC verification, and legal opinion preparation. We provide regular updates throughout the process.",
      },
      {
        id: 3,
        question: "What is included in the Complete Buyer Assistance Package?",
        answer:
          "This package covers title verification, sale agreement drafting and review, registration assistance, stamp duty calculation, coordination with sub-registrar office, and post-registration support including possession documentation.",
      },
      {
        id: 4,
        question:
          "Do you help with property registration at the sub-registrar office?",
        answer:
          "Yes, our lawyers provide complete registration support including document preparation, scheduling registration appointment, accompanying you to sub-registrar office, biometric coordination, and collecting registered documents.",
      },
      {
        id: 5,
        question: "What are the charges for khata transfer in Bangalore?",
        answer:
          "Our khata transfer service is priced at ₹7,999 (discounted from ₹11,999). This includes application preparation, document submission to BBMP, regular follow-ups, and new khata collection. Government fees are additional and paid directly to authorities.",
      },
      {
        id: 6,
        question: "Can you help resolve property disputes?",
        answer:
          "Yes, we offer property dispute consultation starting at ₹1,999 for a 60-minute session. Our lawyers can assess your case, review documents, suggest legal strategy, and represent you if needed. We handle boundary disputes, title disputes, and tenant issues.",
      },
      {
        id: 7,
        question: "Is stamp duty included in your service charges?",
        answer:
          "No, our service charges cover only legal services and professional fees. Stamp duty, registration fees, and government charges are additional and must be paid directly to the government. We help calculate and guide you through the payment process.",
      },
      {
        id: 8,
        question: "How do I track the progress of my legal work?",
        answer:
          "We provide real-time updates via phone, email, and WhatsApp. You'll have a dedicated lawyer assigned to your case who you can contact directly. We also send milestone updates and notify you of any document requirements or actions needed.",
      },
    ],
  };

  const testimonialsData: ITestimonialsSectionProps = {
    words: [
      {
        name: "Rajesh Kumar",
        desc: "Dreamcasa's legal team handled my property verification smoothly. The lawyer was very knowledgeable and explained everything clearly. Worth every rupee!",
        rating: 5,
      },
      {
        name: "Priya Sharma",
        desc: "Got my sale deed registered hassle-free. The team coordinated everything with the sub-registrar office. Highly professional service!",
        rating: 5,
      },
      {
        name: "Amit Patel",
        desc: "Their khata transfer service saved me multiple trips to BBMP. The lawyer handled all follow-ups. Great value for money.",
        rating: 4,
      },
      {
        name: "Sneha Reddy",
        desc: "Had a property dispute consultation. The lawyer gave practical advice and clear next steps. Very satisfied with the service.",
        rating: 5,
      },
    ],
  };

  const WorkWithExpertLawyersData: IWorkWithExpertLawyersprops = {
    heading: "Our Panel of Expert Lawyers",
    listItems: [
      {
        id: 1,
        image: "/images/legalservices/workwithexpertlawyers/image1.png",
        name: "Adv. Nisha Malhotra",
        Experience: "18 years Experience",
        Education: "LLB (Hons.), LLM - Property Law",
        cases: "500+",
      },
      {
        id: 2,
        image: "/images/legalservices/workwithexpertlawyers/image2.png",
        name: "Adv. Swetha Iyer",
        Experience: "12 years Experience",
        Education: "LLB, Diploma - Real Estate Law",
        cases: "350+",
      },
      {
        id: 3,
        image: "/images/legalservices/workwithexpertlawyers/image3.png",
        name: "Adv. Arjun Desai",
        Experience: "15 years Experience",
        Education: "LLB (Hons.), Specialization - RERA",
        cases: "450+",
      },
      {
        id: 4,
        image: "/images/legalservices/workwithexpertlawyers/image4.png",
        name: "Adv. Leena Krishna",
        Experience: "14 years Experience",
        Education: "LLB, LLM - Civil Litigation",
        cases: "400+",
      },
      {
        id: 5,
        image: "/images/legalservices/workwithexpertlawyers/image1.png",
        name: "Adv. Vikram Singh",
        Experience: "20 years Experience",
        Education: "LLB (Hons.), Senior Advocate",
        cases: "600+",
      },
      {
        id: 6,
        image: "/images/legalservices/workwithexpertlawyers/image2.png",
        name: "Adv. Kavita Menon",
        Experience: "11 years Experience",
        Education: "LLB, Specialization - Contracts",
        cases: "300+",
      },
      {
        id: 7,
        image: "/images/legalservices/workwithexpertlawyers/image3.png",
        name: "Adv. Rohit Verma",
        Experience: "16 years Experience",
        Education: "LLB (Hons.), LLM - Property Rights",
        cases: "480+",
      },
      {
        id: 8,
        image: "/images/legalservices/workwithexpertlawyers/image4.png",
        name: "Adv. Meera Joshi",
        Experience: "13 years Experience",
        Education: "LLB, Diploma - Documentation",
        cases: "380+",
      },
    ],
  };

  return (
    <div>
      <div className="mb-[85px] md:mb-[64px]">
        <LegalServicesHeroSection {...LegalServicesHeroSectionData} />
      </div>
      <div className="mb-[45px] md:mb-[64px] md:mt-[0px] mt-[600px]">
        <WhyChooseDreamcasa {...WhyChooseDreamcasData} />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <ConsultLegalExpert {...ConsultLegalExpertData} />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <HowItWorks {...HowitWorksData} />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <WorkWithExpertLawyers {...WorkWithExpertLawyersData} />
      </div>
      <div className="md:px-8 px-3 mb-[45px] max-w-[98%] mx-auto md:mb-[64px] flex flex-col items-center gap-4">
        <GoogleAdSense />
      </div>
      <div className="mb-[35px] md:mb-[64px]">
        <TestimonialsSection {...testimonialsData} />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <HomeLoanFaqs {...LegalServiceFaqsData} />
      </div>
    </div>
  );
}