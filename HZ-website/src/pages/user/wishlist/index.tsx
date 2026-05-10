import withUserLayout from "@/components/Layouts/UserLayout";
import WishListComponent from "@/components/wishlist/WishListComponent";
import React from "react";
import SEO from '@/components/SEO';


const Wishlist = () => {
  return (
    <div className="w-full">
      <SEO
        title="Wishlist | Houznext"
        description="Save your favorite items with Houznext's wishlist. Easily track and revisit saved picks anytime."
        keywords="Wishlist, Saved items, Favorites, Houznext Wishlist, Home shopping, Saved picks"
/>

      <WishListComponent />
    </div>
  );
};
export default withUserLayout(Wishlist);
