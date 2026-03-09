import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import ApplyCareerView from "@/components/Products/components/ApplyView";
import React from "react";
import SEO from '@/components/SEO';


const ApplyCareer = () => {
  return (
    <div>
      <SEO
        title="Apply Now | Start Your Career at OneCasa"
        description="Take the next step in your career with OneCasa. Apply now for exciting job opportunities in real estate, sales, and property management. Join our dynamic team today!"
        keywords="Apply for Real Estate Jobs,OneCasa Careers,Real Estate Job Openings,Property Management Jobs,Real Estate Sales Careers,Work at OneCasa"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />
      <ApplyCareerView />
    </div>
  );
};
export default withGeneralLayout(ApplyCareer);
