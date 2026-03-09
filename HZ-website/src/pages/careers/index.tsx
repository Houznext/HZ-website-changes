import CareerView from "@/components/CareerView";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import SEO from '@/components/SEO';

import React from "react";


const Careers = () => {
  return (
    <div>
      <SEO
        title="Join Our Team | Exciting Career Opportunities at OneCasa"
        description="Discover rewarding career opportunities at OneCasa. Join our team of real estate professionals and build a successful future with us. Explore current job openings today!"
        keywords="Careers in Real Estate,Real Estate Jobs,Property Management Careers,Real Estate Career Opportunities,OneCasa Hiring,Join Our Team"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />
      <CareerView />
    </div>
  );
};

export default withGeneralLayout(Careers);
