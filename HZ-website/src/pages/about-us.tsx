import React from "react";
import Aboutus from "../components/aboutus";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import SEO from "@/components/SEO";

const About = () => {
  return (
    <div>
      <SEO
        title="About OneCasa – India's One-Stop Platform for Real Estate, Interiors & More"
        description="OneCasa is India's all-in-one platform for real estate, interiors, construction, furniture, legal services, and home improvement. Learn how we help you buy, build, and style your dream home across cities like Hyderabad, Mumbai, Bangalore, Pune, Chennai, and more."
        keywords="About OneCasa, OneCasa story, real estate company India, interior design firm, construction company India, buy property India, home building, DreamCasa to OneCasa, Hyderabad real estate, Mumbai real estate, Bangalore interiors, Pune property services"
        breadcrumbs={[
          { name: "Home", item: "https://www.onecasa.in" },
          { name: "About Us", item: "https://www.onecasa.in/about-us" },
        ]}
        faq={[
          {
            question: "What makes OneCasa different from other real estate platforms?",
            answer: "OneCasa offers end-to-end solutions covering property search, interior design, construction, legal services, and furniture - all under one platform with transparent pricing and expert guidance."
          },
          {
            question: "Which cities does OneCasa serve?",
            answer: "We serve clients across major Indian cities including Hyderabad, Mumbai, Bangalore, Pune, Chennai, and Delhi NCR with plans to expand to more locations."
          },
          {
            question: "How did OneCasa start?",
            answer: "OneCasa was founded with the vision to simplify the home-building process by integrating all services from property search to interior design under one trusted platform."
          }
        ]}
        article={{
          headline: "About OneCasa - India's Comprehensive Real Estate Solution",
          datePublished: "2023-01-15",
          author: { name: "OneCasa Team" }
        }}
      />
      <Aboutus />
    </div>
  );
};

export default withGeneralLayout(About);
