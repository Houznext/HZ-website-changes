import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import BuildHome from "@/components/Products/components/BuildHome";
import SEO from '@/components/SEO';


const CustomBuilder = () => {
    return (
        <div>
            <SEO
                title="Home Construction Services | Custom Home Building | OneCasa"
                description="Build your dream home with OneCasa's end-to-end construction services. From architectural design to turnkey construction, we deliver quality homes across India with transparent pricing and timely completion."
                keywords="home construction, custom home building, construction company, residential construction, architectural design, turnkey construction, house construction services, construction management, building contractors"
                breadcrumbs={[
                    { name: "Home", item: "https://www.onecasa.in" },
                    { name: "Construction Services", item: "https://www.onecasa.in/custom-builder" },
                ]}
                faq={[
                    {
                        question: "What types of construction projects does OneCasa handle?",
                        answer: "We specialize in residential construction including individual homes, apartments, villas, and also undertake commercial projects with end-to-end services from design to execution."
                    },
                    {
                        question: "Do you provide custom home design services?",
                        answer: "Yes, our team of architects and designers creates personalized home designs tailored to your requirements, lifestyle, and budget."
                    },
                    {
                        question: "What is the typical timeline for a construction project?",
                        answer: "Construction timelines vary based on project size and complexity, but we ensure timely completion with proper project management. A standard individual home typically takes 8-12 months."
                    },
                    {
                        question: "Do you offer construction quality guarantees?",
                        answer: "Yes, we provide comprehensive quality assurance and warranties on our construction work, using premium materials and following industry best practices."
                    }
                ]}
                service={{
                    name: "Home Construction and Building Services",
                    description: "End-to-end residential and commercial construction services including architectural design, project management, and turnkey solutions",
                    areaServed: ["Hyderabad", "Mumbai", "Bangalore", "Pune", "Chennai", "Delhi NCR"],
                    providerType: "HomeAndConstructionBusiness"
                }}
            />
            <BuildHome />
        </div>
    );
};
export default withGeneralLayout(CustomBuilder);
