import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import ApplyCareerView from "@/components/Products/components/ApplyView";
import React from "react";
import SEO from '@/components/SEO';


const ApplyCareer = () => {
  return (
    <div>
      <SEO
        title="Apply Now | Start Your Career at Houznext"
        description="Apply for exciting roles at Houznext — Hyderabad's home interiors and BuildLive team. Join our growing team."
      />
      <ApplyCareerView />
    </div>
  );
};
export default withGeneralLayout(ApplyCareer);
