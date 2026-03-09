import React, { useEffect, useState } from "react";
import PropertiesListComponent from "@/components/PropertiesListComponent";
import SEO from '@/components/SEO';
import { useRouter } from "next/router";
import PropertiesLayoutWrapper from "@/components/Layouts/PropertiesLayout/PropertiesLayoutWrapper";

const CITY_DATA: { [key: string]: { name: string; state: string; popularAreas: string[] } } = {
  hyderabad: {
    name: "Hyderabad",
    state: "Telangana",
    popularAreas: ["Gachibowli", "Hitech City", "Jubilee Hills", "Banjara Hills", "Financial District"]
  },
  bangalore: {
    name: "Bangalore",
    state: "Karnataka",
    popularAreas: ["Whitefield", "Electronic City", "Indiranagar", "Koramangala", "MG Road"]
  },
  mumbai: {
    name: "Mumbai",
    state: "Maharashtra",
    popularAreas: ["South Mumbai", "Bandra", "Andheri", "Powai", "Thane"]
  },
  delhi: {
    name: "Delhi",
    state: "Delhi",
    popularAreas: ["South Delhi", "Gurgaon", "Noida", "Dwarka", "Saket"]
  },
  chennai: {
    name: "Chennai",
    state: "Tamil Nadu",
    popularAreas: ["Anna Nagar", "Adyar", "OMR", "T Nagar", "Velachery"]
  },
  pune: {
    name: "Pune",
    state: "Maharashtra",
    popularAreas: ["Hinjewadi", "Kalyani Nagar", "Viman Nagar", "Koregaon Park", "Baner"]
  }
};

const CATEGORY_MAP: { [key: string]: string } = {
  apartment: "Apartments",
  villa: "Villas",
  plot: "Plots",
  commercial: "Commercial Spaces",
  office: "Office Spaces",
  land: "Lands",
  house: "Houses",
  studio: "Studio Apartments"
};

const PropertyList = () => {
  const router = useRouter();
  const { category, city, purpose, lookingType, page } = router.query;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      setIsReady(true);
    }
  }, [router.isReady]);

  const getDynamicSEOContent = () => {
    if (!isReady) {
      return {
        title: "Property Listings | OneCasa",
        description: "Find your ideal property on OneCasa",
        keywords: "property, real estate, OneCasa",
        breadcrumbs: [
          { name: "Home", item: "https://www.onecasa.in/" },
          { name: "Properties", item: "https://www.onecasa.in/properties" },
        ],
        displayCity: "",
        displayCategory: "",
        transactionType: "buy"
      };
    }

    const propertyCategory = typeof category === 'string' ? category : 'property';
    const cityName = typeof city === 'string' ? city : 'Hyderabad';
    const transactionType = typeof lookingType === 'string' ? lookingType : 'buy';
    const propertyPurpose = typeof purpose === 'string' ? purpose : 'Residential';
    const pageNumber = typeof page === 'string' ? parseInt(page) : 1;

    const displayCategory = CATEGORY_MAP[propertyCategory] || propertyCategory;
    const displayCity = CITY_DATA[cityName]?.name || cityName;
    const displayState = CITY_DATA[cityName]?.state || '';

    let title = `${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} ${displayCategory} in ${displayCity} | ${propertyPurpose} Properties | OneCasa`;

    if (pageNumber > 1) {
      title = `${title} - Page ${pageNumber}`;
    }

    let description = `Find ${transactionType} ${displayCategory.toLowerCase()} in ${displayCity}, ${displayState}. Browse ${propertyPurpose.toLowerCase()} properties with prices, photos, amenities, and location details.`;

    if (CITY_DATA[cityName]?.popularAreas) {
      description += ` Popular areas: ${CITY_DATA[cityName].popularAreas.slice(0, 3).join(', ')}.`;
    }

    const keywords = [
      `${transactionType} ${displayCategory.toLowerCase()} ${displayCity}`,
      `${propertyPurpose} properties ${displayCity}`,
      `real estate ${displayCity}`,
      `${displayCategory} for ${transactionType} ${displayCity}`,
      `${displayCity} property listings`,
      `OneCasa ${displayCity}`
    ].join(', ');

    const breadcrumbs = [
      { name: "Home", item: "https://www.onecasa.in/" },
      { name: "Properties", item: "https://www.onecasa.in/properties" },
      { name: `${displayCity} Properties`, item: `https://www.onecasa.in/properties/${displayCity.toLowerCase()}` },
      { name: `${transactionType} ${displayCategory}`, item: `https://www.onecasa.in/properties/${propertyCategory}/${cityName}` },
    ];

    if (pageNumber > 1) {
      breadcrumbs.push({ name: `Page ${pageNumber}`, item: router.asPath });
    }

    return { title, description, keywords, breadcrumbs, displayCity, displayCategory, transactionType };
  };

  const seoContent = getDynamicSEOContent();

  return (
    <div className="max-w-[1440px] mx-auto relative py-2 shadow-custom">
      <SEO
        title={seoContent.title}
        description={seoContent.description}
        keywords={seoContent.keywords}
        breadcrumbs={seoContent.breadcrumbs}
        faq={isReady ? [
          {
            question: `Why invest in ${seoContent.displayCity} real estate?`,
            answer: `${seoContent.displayCity} offers excellent ROI potential with growing infrastructure, employment opportunities, and quality lifestyle amenities making it a prime real estate investment destination.`
          },
          {
            question: `What are the popular areas for ${seoContent.displayCategory.toLowerCase()} in ${seoContent.displayCity}?`,
            answer: city && CITY_DATA[city as string]?.popularAreas
              ? `Popular areas include: ${CITY_DATA[city as string].popularAreas.slice(0, 5).join(', ')}. Each area offers unique advantages depending on your budget and requirements.`
              : `${seoContent.displayCity} has multiple developed areas with good connectivity and amenities.`
          }
        ] : []}
        service={isReady ? {
          name: `${seoContent.displayCity} Property ${seoContent.transactionType === 'rent' ? 'Rental' : 'Sales'} Services`,
          description: `Find and ${seoContent.transactionType} ${seoContent.displayCategory.toLowerCase()} in ${seoContent.displayCity} with verified listings, transparent pricing, and expert guidance`,
          areaServed: [seoContent.displayCity, city ? CITY_DATA[city as string]?.state || '' : ''],
          providerType: "RealEstateAgent"
        } : undefined}
        siteLinksSearchBox={true}
      />

      <PropertiesListComponent />
    </div>
  );
};

PropertyList.getLayout = (page: React.ReactNode) => (
  <PropertiesLayoutWrapper>{page}</PropertiesLayoutWrapper>
);

export default PropertyList;