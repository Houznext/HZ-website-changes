import CustomBuilderUserProfileView from "@/components/CustomBuilder/CustomBuilderUserProfileView";
import withUserLayout from "@/components/Layouts/UserLayout";
import SEO from '@/components/SEO';

import { useRouter } from "next/router";

const CustomBuilderUserProfile = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <div className="w-full">
      <SEO
        title="Custom Builder Details | Houznext"
        description="Explore detailed information about custom builders, including property details, construction progress, and contact information."
        keywords="Custom Builder Details, Home Construction, Builder Profile, Houznext Construction, Property Development, Construction Progress"
/>

      <CustomBuilderUserProfileView />
    </div>
  );
};

export default withUserLayout(CustomBuilderUserProfile);
