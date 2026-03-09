import withUserLayout from "@/components/Layouts/UserLayout";
import EditComanyPropertyview from '@/components/CompanyPropertiesComp/EditComanyPropertyview'
import React from "react";

const EditCompanyProperty= () => {
  return (
    <div className="w-full">
     <EditComanyPropertyview />
    </div>
  );
};
export default withUserLayout(EditCompanyProperty);
