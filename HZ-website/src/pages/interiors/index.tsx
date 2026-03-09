import React from "react";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import InteriorsComponent from "@/components/Products/components/SubServices/InteriorsComponent";
import SEO from "@/components/SEO";

import { GetServerSideProps } from "next";
import apiClient from "@/utils/apiClient";

function Interiors({ blogs, interiorsStrapiData }: any) {
  return (
    <div>
      <SEO
        title="Interior Design Services | Modern & Luxury Interiors for Homes & Offices | OneCasa"
        description="Transform your space with OneCasa's expert interior design services. Explore modern, luxury, and customized interiors for homes and offices across India. Get end-to-end solutions from design to execution."
        keywords="Interior Design, Home Interiors, Luxury Interiors, Modern Interior Design, Customized Interiors, Office Interiors, Interior Decoration, Home Renovation, Space Planning, Turnkey Interiors"
        breadcrumbs={[
          { name: "Home", item: "https://www.onecasa.in" },
          { name: "Interior Design Services", item: "https://www.onecasa.in/interiors" },
        ]}
        faq={[
          {
            question: "What types of interior design services does OneCasa offer?",
            answer: "We provide complete interior solutions including residential interiors, office spaces, luxury homes, modular kitchens, wardrobes, and custom furniture designs with end-to-end execution."
          },
          {
            question: "Do you offer interior services across India?",
            answer: "Yes, we serve clients in major cities including Hyderabad, Bangalore, Mumbai, Pune, Chennai, and Delhi NCR with our expert design team and execution partners."
          },
          {
            question: "What is the process for starting an interior design project?",
            answer: "Our process includes consultation, space planning, 3D design visualization, material selection, project execution, and final handover with quality assurance at every step."
          },
          {
            question: "Can I see examples of your previous interior projects?",
            answer: "Absolutely! We have an extensive portfolio of completed projects across different styles and budgets. Contact us to schedule a viewing of our work."
          }
        ]}
        service={{
          name: "Interior Design and Decoration Services",
          description: "Comprehensive interior design solutions for homes and offices including space planning, custom furniture, and turnkey execution",
          areaServed: ["Hyderabad", "Mumbai", "Bangalore", "Pune", "Chennai", "Delhi NCR"],
          providerType: "LocalBusiness"
        }}
        siteLinksSearchBox={true}
      />

      <InteriorsComponent
        blogs={blogs}
        interiorsStrapiData={interiorsStrapiData}
      />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const blogsRes = await apiClient.get(apiClient.URLS.blogs, {
      blogType: "Interiors",
    });
    const blogs = blogsRes.body?.blogs || [];

    const urls = {
      heroCardPrices: `${apiClient.URLS.strapiInteriors}hero-card-prices?populate=*`,
    };

    const fetchStrapiSection = async (url: string) => {
      const res = await fetch(url);
      return res.json();
    };

    const [heroCardPrices] = await Promise.all([
      fetchStrapiSection(urls.heroCardPrices),
    ]);

    const interiorsStrapiData = {
      heroCardPrices,
    };

    return {
      props: {
        blogs,
        interiorsStrapiData,
      },
    };
  } catch (e) {
    console.error("SSR fetch failed", e);
    return {
      props: {
        blogs: [],
        interiorsStrapiData: {
          heroCardPrices: null,
        },
      },
    };
  }
};

export default withGeneralLayout(Interiors);
