import withUserLayout from "@/components/Layouts/UserLayout";
import WishListComponent from "@/components/wishlist/WishListComponent";
import React from "react";
import SEO from '@/components/SEO';


const Wishlist = () => {
  return (
    <div className="w-full">
      <SEO
        title="Wishlist | Houznext"
        description="Save your favorite properties with Houznext's Wishlist. Easily track, manage, and revisit your saved real estate listings anytime."
        keywords="Wishlist, Saved Properties, Favorite Listings, Houznext Wishlist, Real Estate Favorites, Property Tracking, Home Listings"
/>

      <WishListComponent />
    </div>
  );
};
export default withUserLayout(Wishlist);
