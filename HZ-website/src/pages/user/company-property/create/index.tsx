import withUserLayout from "@/components/Layouts/UserLayout";
import CreateCompanyView from "@/components/CompanyPropertiesComp/create-companyView";
import React from "react";

const CreateCompanyProperty = () => {
  return (
    <div className="w-full">
       <CreateCompanyView />
    </div>
  );
};
export default withUserLayout(CreateCompanyProperty);
