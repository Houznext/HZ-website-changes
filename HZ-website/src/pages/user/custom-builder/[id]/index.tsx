import React from "react";
import withUserLayout from "@/components/Layouts/UserLayout";
import CustomBuilderDetailsView from "@/components/CustomBuilder/CustomBuilderDetailsView";
import SEO from '@/components/SEO';
import { useRouter } from "next/router";

const CustomBuilderUserProfile = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <div className="flex w-full ">
      <SEO
        title="Custom Builder Details | OneCasa"
        description="Explore detailed information about custom builders, including property details, construction progress, and contact information."
        keywords="Custom Builder Details, Home Construction, Builder Profile, OneCasa Construction, Property Development, Construction Progress"
      />
      <CustomBuilderDetailsView />
    </div>
  );
};

export default withUserLayout(CustomBuilderUserProfile);