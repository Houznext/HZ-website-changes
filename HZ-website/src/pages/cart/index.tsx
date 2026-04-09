import { CheckoutFlow } from "@/components/CheckoutFlow";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import React from "react";
import SEO from '@/components/SEO';


const Cart = () => {
  return (
    <div>
      <SEO
        title="Your Shopping Cart | Houznext"
        description="Review your selected products and proceed to checkout. Complete your purchase with Houznext and bring your dream home to life!"
        keywords="Shopping Cart,Houznext Cart,Home Decor Checkout,Furniture Purchase,Buy Home Essentials,Interior Design Products,Electronics Shopping,Home Appliances,Smart Home Devices,Gadgets & Accessories"
/>
      <CheckoutFlow />
    </div>
  );
};

export default withGeneralLayout(Cart);
