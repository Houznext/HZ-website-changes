import { CheckoutFlow } from "@/components/CheckoutFlow";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import React from "react";
import SEO from '@/components/SEO';


const Cart = () => {
  return (
    <div>
      <SEO
        title="Your Shopping Cart | OneCasa"
        description="Review your selected products and proceed to checkout. Complete your purchase with OneCasa and bring your dream home to life!"
        keywords="Shopping Cart,OneCasa Cart,Home Decor Checkout,Furniture Purchase,Buy Home Essentials,Interior Design Products,Electronics Shopping,Home Appliances,Smart Home Devices,Gadgets & Accessories"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />
      <CheckoutFlow />
    </div>
  );
};

export default withGeneralLayout(Cart);
