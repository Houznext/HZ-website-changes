import ProfileView from "@/components/ProfileView";
import withUserLayout from "@/components/Layouts/UserLayout";
import React from "react";
import SEO from '@/components/SEO';


function UserProfile() {
  return (
    <div className="w-full">
      <SEO
        title="User Profile | OneCasa"
        description="Manage your OneCasa profile, update personal details, track property interests, and view saved listings with ease."
        keywords="User Profile, OneCasa Account, Real Estate Dashboard, Saved Properties, Profile Management, OneCasa Listings, Property Interests"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />

      <ProfileView />
    </div>
  );
}

export default withUserLayout(UserProfile);
