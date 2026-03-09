import React from "react";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import PlumbingComponent from "@/components/Products/components/SubServices/PlumbingComponent";
import SEO from '@/components/SEO';


const Plumbing = () => {
  return (
    <div>
      <SEO
        title="Expert Plumbing Services | Reliable Repairs & Installations | OneCasa"
        description="Get professional plumbing services for your home and business. From leak repairs to pipe installations, our expert plumbers ensure efficient and long-lasting solutions."
        keywords="Plumbing Services, Leak Repair, Pipe Installation, Home Plumbing, Commercial Plumbing, Emergency Plumber, Drain Cleaning, Plumbing Maintenance, Water Heater Repair"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />

      <PlumbingComponent />
    </div>
  );
};

export default withGeneralLayout(Plumbing);
