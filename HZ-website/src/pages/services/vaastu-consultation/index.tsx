import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import VaastuComponent from "@/components/Products/components/SubServices/VaastuComponent";
import React from "react";
import SEO from '@/components/SEO';


const VaastuConsultation = () => {
  return (
    <div>
      <SEO
        title="Vaastu Consultation for Homes & Businesses | Expert Vaastu Guidance | OneCasa"
        description="Enhance harmony and prosperity with expert Vaastu consultation. Get personalized Vaastu guidance for homes, offices, and commercial spaces to attract positive energy and success."
        keywords="Vaastu Consultation, Vaastu Shastra, Home Vaastu, Office Vaastu, Commercial Vaastu, Vaastu Expert, Vaastu Tips, Vaastu for Prosperity, Energy Balance, OneCasa Vaastu"
      />

      <VaastuComponent />
    </div>
  );
};

export default withGeneralLayout(VaastuConsultation);
