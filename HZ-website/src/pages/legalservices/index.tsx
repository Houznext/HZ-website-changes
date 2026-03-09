
import React from 'react'
import LegalServicesComponent from '@/components/LegalServicesComponent'
import withGeneralLayout from '@/components/Layouts/GeneralLayout'
import SEO from '@/components/SEO';


const LegalServices = () => {
    return (
        <div>
            <SEO
                title="Legal Services | Expert Real Estate Legal Assistance | OneCasa"
                description="Get professional legal assistance for real estate transactions, property disputes, and documentation. OneCasa provides expert legal services to ensure a smooth and secure property experience."
                keywords="Real Estate Legal Services,Property Law Assistance,Legal Consultation for Real Estate,Property Dispute Resolution,Real Estate Documentation,Title Deed Verification,OneCasa Legal Services"
                imageUrl="https://www.onecasa.in/images/logobb.png"
            />
            <LegalServicesComponent />
        </div>
    )
}

export default withGeneralLayout(LegalServices)