import React from "react";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import HomeDecorComponent from "@/components/Products/components/SubServices/HomeDecorComponent";
import SEO from '@/components/SEO';

const HomeDecor = () => {
  return (
    <>
      <SEO
        title="Home Decor Online India | Wall Art, Lighting & Interior Accessories | OneCasa"
        description="Shop beautiful home decor online at OneCasa. Wall art, lighting, rugs, cushions & accessories to style every room. Curated collections with delivery in Hyderabad, Bangalore, Mumbai & more."
        keywords="home decor online India, wall art Hyderabad, interior accessories, decorative lighting, cushion covers, rugs online, modern home decor, living room decor, bedroom decor ideas, OneCasa home decor, affordable home styling India"
        imageUrl="https://www.onecasa.in/images/logobb.png"
        breadcrumbs={[
          { name: "Home", item: "https://www.onecasa.in/" },
          { name: "Services", item: "https://www.onecasa.in/services/homedecor" },
          { name: "Home Decor", item: "https://www.onecasa.in/services/homedecor" },
        ]}
        faq={[
          { question: "What home decor items are available on OneCasa?", answer: "OneCasa offers wall art, decorative lighting, rugs, cushion covers, vases, mirrors, clocks, planters, and curated home styling accessories for every room." },
          { question: "Can I return home decor items?", answer: "Yes, OneCasa offers hassle-free returns within the specified return window. Check individual product pages for specific return policies." },
        ]}
      />
      <HomeDecorComponent />
    </>
  );
};

export default withGeneralLayout(HomeDecor);
