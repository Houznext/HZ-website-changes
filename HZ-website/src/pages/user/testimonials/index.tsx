import withUserLayout from "@/components/Layouts/UserLayout";
import TestimonialsView from "@/components/TestimonialsView";
import React from "react";
import SEO from '@/components/SEO';


const Testimonials = () => {
  return (
    <div className="flex w-full min-h-full">
      <SEO
        title="Customer Testimonials | Houznext"
        description="Read authentic customer testimonials about Houznext's real estate services. See how our clients rate us and share their experiences."
        keywords="Customer Reviews, Houznext Testimonials, Real Estate Feedback, Homeowner Experiences, Client Stories, Property Reviews, Houznext Ratings"
/>
      <TestimonialsView />
    </div>
  );
};

export default withUserLayout(Testimonials);
