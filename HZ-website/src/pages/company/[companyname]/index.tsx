import React from "react";
import { useRouter } from "next/router";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import SEO from '@/components/SEO';

import CompanyProjectsView from "@/components/CompanyProjectsView";

const CompanyView = () => {
  const router = useRouter();
  const { companyname, id } = router.query;

  return (
    <div>
      <SEO
        title={`Explore Projects by ${companyname} | OneCasa`}
        description={`Discover premium residential and commercial projects by ${companyname}. Explore verified builder profiles and their top real estate developments.`}
        keywords="Builders, Projects, Real Estate, OneCasa, Company View, Developers"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />

      <CompanyProjectsView companyId={id as string} />
    </div>
  );
};

export default withGeneralLayout(CompanyView);
