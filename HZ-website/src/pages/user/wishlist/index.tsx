import withUserLayout from "@/components/Layouts/UserLayout";
import WishListComponent from "@/components/wishlist/WishListComponent";
import React from "react";
import SEO from '@/components/SEO';


const Wishlist = () => {
  return (
    <div className="w-full">
      <SEO
        title="Wishlist | OneCasa"
        description="Save your favorite properties with OneCasa's Wishlist. Easily track, manage, and revisit your saved real estate listings anytime."
        keywords="Wishlist, Saved Properties, Favorite Listings, OneCasa Wishlist, Real Estate Favorites, Property Tracking, Home Listings"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />

      <WishListComponent />
    </div>
  );
};
export default withUserLayout(Wishlist);
