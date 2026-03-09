import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import React from "react";
import ProductItemDetails from "@/components/Products/components/SubServices/FurnitureComponent/furnitureItems/ItemDetailsSection";
import { useRouter } from "next/router";

const Detailspage = () => {
  const router = useRouter();
  return (
    <div>
      <ProductItemDetails />
    </div>
  );
};

export default withGeneralLayout(Detailspage);
