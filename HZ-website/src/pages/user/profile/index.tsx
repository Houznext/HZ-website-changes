import ProfileView from "@/components/ProfileView";
import withUserLayout from "@/components/Layouts/UserLayout";
import React from "react";
import SEO from '@/components/SEO';


function UserProfile() {
  return (
    <div className="w-full">
      <SEO
        title="User Profile | Houznext"
        description="Manage your Houznext profile, update personal details, track property interests, and view saved listings with ease."
        keywords="User Profile, Houznext Account, Real Estate Dashboard, Saved Properties, Profile Management, Houznext Listings, Property Interests"
/>

      <ProfileView />
    </div>
  );
}

export default withUserLayout(UserProfile);
