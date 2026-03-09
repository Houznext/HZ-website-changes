import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import PackersAndMoversView from "@/components/PackersAndMoversView";
import SEO from '@/components/SEO';


import React from "react";

const PackersAndMovers = () => {
  return (
    <div>
      <SEO
        title="Reliable Packers and Movers | Safe & Hassle-Free Relocation Services | OneCasa"
        description="Move with ease using our expert packers and movers. Get safe, efficient, and affordable relocation services for homes and businesses. Book now for a stress-free moving experience!"
        keywords="Packers and Movers, Home Relocation, Office Shifting, Moving Services, Safe Packing, Reliable Movers, Moving Company, Local Packers, Interstate Moving, OneCasa Relocation"
      />

      <PackersAndMoversView />
    </div>
  );
};

export default withGeneralLayout(PackersAndMovers);
