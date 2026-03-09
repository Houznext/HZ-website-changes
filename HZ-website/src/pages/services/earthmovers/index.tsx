import EarthMovesComponent from "@/components/EarthMovesComponent";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";

import React from "react";
import SEO from '@/components/SEO';


const EarthMovers = () => {
  return (
    <div>
      <SEO
        title="Heavy-Duty Earthmovers & Excavation Services | Land Clearing & Site Preparation | OneCasa"
        description="OneCasa provides high-performance earthmoving services, including excavation, land grading, site preparation, and demolition for construction projects."
        keywords="Earthmovers, Excavation Services, Land Clearing, Site Preparation, Heavy Equipment Rental, Bulldozers, Backhoe Loaders, Construction Machinery, Earthmoving Contractors"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />

      <EarthMovesComponent />
    </div>
  );
};

export default withGeneralLayout(EarthMovers);
