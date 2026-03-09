import withUserLayout from "@/components/Layouts/UserLayout";
import { CompanyPropertyView } from "@/components/CompanyPropertiesComp/CompanyProperty";
import React from "react";

const ComProperty = () => {
  return (
    <div className="w-full">
      <CompanyPropertyView />
    </div>
  );
};
export default withUserLayout(ComProperty);
