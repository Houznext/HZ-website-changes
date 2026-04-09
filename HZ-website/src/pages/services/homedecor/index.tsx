import React from "react";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import HomeDecorComponent from "@/components/Products/components/SubServices/HomeDecorComponent";
import SEO from '@/components/SEO';

const HomeDecor = () => {
  return (
    <>
      <SEO
        title="Home Decor Online India | Wall Art, Lighting & Interior Accessories | Houznext"
        description="Shop beautiful home decor online at Houznext. Wall art, lighting, rugs, cushions & accessories to style every room. Curated collections with delivery in Hyderabad, Bangalore, Mumbai & more."
        keywords="home decor online India, wall art Hyderabad, interior accessories, decorative lighting, cushion covers, rugs online, modern home decor, living room decor, bedroom decor ideas, Houznext home decor, affordable home styling India"
breadcrumbs={[
          { name: "Home", item: "https://houznext.com/" },
          { name: "Services", item: "https://houznext.com/services/homedecor" },
          { name: "Home Decor", item: "https://houznext.com/services/homedecor" },
        ]}
        faq={[
          { question: "What home decor items are available on Houznext?", answer: "Houznext offers wall art, decorative lighting, rugs, cushion covers, vases, mirrors, clocks, planters, and curated home styling accessories for every room." },
          { question: "Can I return home decor items?", answer: "Yes, Houznext offers hassle-free returns within the specified return window. Check individual product pages for specific return policies." },
        ]}
      />
      <HomeDecorComponent />
    </>
  );
};

export default withGeneralLayout(HomeDecor);
