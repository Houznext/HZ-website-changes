import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import CivilEngineeringComponent from "@/components/Products/components/SubServices/CivilEngineeringComponent";
import React from "react";
import SEO from '@/components/SEO';


const CivilEngineering = () => {
  return (
    <div>
      <SEO
        title="Comprehensive Civil Engineering Services | Residential & Commercial Construction Experts | Houznext"
        description="Houznext provides top-tier civil engineering solutions, including structural design, site planning, and high-quality construction for residential and commercial projects."
        keywords="Civil Engineering Services, Structural Engineering, Residential Construction, Commercial Building, Infrastructure Development, Houznext Civil Engineering, Site Planning, Construction Management"
/>
      <CivilEngineeringComponent />
    </div>
  );
};

export default withGeneralLayout(CivilEngineering);
