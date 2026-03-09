import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import RecentPropertiesView from "@/components/RecentPropertiesView";
import ReferandEarnView from "@/components/ReferAndEarn";
import React from "react";
import SEO from '@/components/SEO';


const RecentProperties = () => {
  return (
    <div>
      <SEO
        title="Recently Viewed Properties | Explore Your Favorites | OneCasa"
        description="Revisit your recently viewed properties on OneCasa. Explore detailed information, pricing, and locations for homes, apartments, commercial spaces, and plots you’ve browsed."
        keywords="Recent Properties,Recently Viewed Listings,Saved Properties,OneCasa Favorites,Property Search History,Real Estate Listings,Home for Sale,Rent a Home,Commercial Property"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />
      <RecentPropertiesView />
    </div>
  );
};

export default withGeneralLayout(RecentProperties);
