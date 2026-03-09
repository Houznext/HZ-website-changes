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
        title="Custom Builder Details | OneCasa"
        description="Explore detailed information about custom builders, including property details, construction progress, and contact information."
        keywords="Custom Builder Details, Home Construction, Builder Profile, OneCasa Construction, Property Development, Construction Progress"
        imageUrl="https://www.onecasa.in/images/onecasa-logo.png"
      />

      <CustomBuilderUserProfileView />
    </div>
  );
};

export default withUserLayout(CustomBuilderUserProfile);
