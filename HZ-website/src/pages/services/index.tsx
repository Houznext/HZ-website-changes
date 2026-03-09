import withGeneralLayout from '@/components/Layouts/GeneralLayout'
import React from 'react'
import SEO from '@/components/SEO'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

function Services() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/services/custom-builder');
  }, []);

  return (
    <div>
      <SEO
        title="Home Services in India | Interiors, Solar, Painting, Plumbing, Furniture & More | OneCasa"
        description="OneCasa offers comprehensive home services — interior design, solar installation, painting, plumbing, furniture, electronics, legal services, construction and more across Hyderabad, Bangalore, Mumbai, Chennai & Pune."
        keywords="home services India, interior design Hyderabad, solar installation, painting services, plumbing, furniture online, home renovation, OneCasa services, construction services India"
        breadcrumbs={[
          { name: "Home", item: "https://www.onecasa.in/" },
          { name: "Services", item: "https://www.onecasa.in/services" },
        ]}
      />
    </div>
  )
}

export default withGeneralLayout(Services)
