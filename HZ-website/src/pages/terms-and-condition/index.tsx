import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import TermsAndConditions from "@/components/TermsCondition";
import React from "react";
import SEO from '@/components/SEO';


const TermsCondition = () => {
  return (
    <div>
      <SEO
        title="Terms and Conditions | OneCasa"
        description="Read the Terms and Conditions of OneCasa. By accessing our website, you agree to comply with our terms, including usage policies, intellectual property rights, and more."
        keywords="Terms and Conditions, OneCasa Terms, Website Usage Policy, Real Estate Terms, Property Platform Rules, User Agreement, Legal Terms, Privacy and Policy"
      />

      <TermsAndConditions />
    </div>
  );
};

export default withGeneralLayout(TermsCondition);
