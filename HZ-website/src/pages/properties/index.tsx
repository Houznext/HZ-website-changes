import React from "react";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import PropertiesHome from "@/components/PropertyComp/Properties";
import SEO from "@/components/SEO";

const Properties = () => {
  return (
    <div>
      <SEO
        title="Buy, Rent, or Invest in Residential & Commercial Properties | OneCasa"
        description="Discover verified property listings on OneCasa – India's trusted real estate platform. Buy, rent, or invest in flats, villas, plots, and commercial spaces across Hyderabad, Bangalore, Mumbai, Pune, Chennai, and more."
        keywords="OneCasa Real Estate, Properties for Sale, Properties for Rent, Buy a Home, Rental Properties, Real Estate Listings India, Investment Properties, Luxury Homes, Commercial Spaces, Residential Properties, Office Spaces, Verified Listings, Plots for Sale, Apartments for Rent"
        breadcrumbs={[
          { name: "Home", item: "https://www.onecasa.in" },
          { name: "Properties", item: "https://www.onecasa.in/properties" },
          {
            name: "Buy, Rent, or Invest in Residential & Commercial Properties",
            item: "https://www.onecasa.in/properties/buy/Hyderabad?purpose=Residential&page=1"
          }
        ]}
        faq={[
          {
            question: "How can I buy a property in Hyderabad through OneCasa?",
            answer: "You can browse verified listings on OneCasa, connect directly with sellers or agents, and schedule visits. Our team also helps with legal verification and documentation support."
          },
          {
            question: "Does OneCasa provide rental property options?",
            answer: "Yes, OneCasa offers verified rental listings for apartments, villas, and commercial spaces across major Indian cities like Hyderabad, Bangalore, and Mumbai."
          },
          {
            question: "Are properties on OneCasa verified?",
            answer: "Yes, all listings are verified for ownership, location, and pricing to ensure buyers and tenants can make safe and informed decisions."
          },
          {
            question: "Can I list my property on OneCasa?",
            answer: "Absolutely! Property owners can list their residential or commercial properties on our platform. Contact our team for assistance with creating an optimal listing."
          }
        ]}
        service={{
          name: "Property Listings and Real Estate Services",
          description: "Comprehensive property search, listing, and transaction services for buyers, sellers, and renters across major Indian cities",
          areaServed: ["Hyderabad", "Mumbai", "Bangalore", "Pune", "Chennai", "Delhi NCR"],
          providerType: "RealEstateAgent"
        }}
        siteLinksSearchBox={true}
      />

      <PropertiesHome />
    </div>
  );
};

export default withGeneralLayout(Properties);
