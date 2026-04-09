import LoginLayout from '@/components/Layouts/LoginLayout'
import PostPropertyView from '@/components/PostPropertyView'
import React from 'react'
import SEO from '@/components/SEO';


const PostProperty = () => {
  return (
    <div>
      <SEO
        title="Post Your Property | List Your Real Estate with Houznext"
        description="Easily list your property for sale or rent on Houznext. Reach potential buyers and tenants with our seamless property posting platform."
        keywords="Post Property,List Property for Sale,Rent Out Property,Sell Real Estate Online,Houznext Property Listing,Real Estate Advertising,Home Selling Platform"
      />
      < PostPropertyView />
    </div>
  )
}

export default LoginLayout(PostProperty)
