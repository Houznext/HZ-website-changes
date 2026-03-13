import withUserLayout from "@/components/Layouts/UserLayout";
import OrdersView from "@/components/Orders";
import React from "react";
import SEO from '@/components/SEO';


const Orders = () => {
  return (
    <div className="w-full">
      <SEO
        title="My Orders | Houznext"
        description="Track your orders with Houznext. View all your past and current orders, including pending, completed, and canceled purchases."
        keywords="My Orders, Houznext Orders, Track Orders, Online Purchases, Pending Orders, Completed Orders, Canceled Orders, Order History"
        imageUrl="https://www.houznext.com/images/logobb.png"
      />

      <OrdersView />
    </div>
  );
};

export default withUserLayout(Orders);
