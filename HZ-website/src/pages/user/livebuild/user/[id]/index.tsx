import CustomBuilderUserProfileView from "@/components/LivebuildComponent/CustomBuilderUserProfileView";
import withUserLayout from "@/components/Layouts/UserLayout";
import SEO from '@/components/SEO';

import { useRouter } from "next/router";

const CustomBuilderUserProfile = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <div className="w-full">
      <SEO
        title="LiveBuild Details | Houznext"
        description="Explore detailed information about your LiveBuild project, including property details, construction progress, and contact information."
        keywords="LiveBuild, Home Construction, Builder Profile, Houznext Construction, Property Development, Construction Progress"
/>

      <CustomBuilderUserProfileView />
    </div>
  );
};

export default withUserLayout(CustomBuilderUserProfile);
