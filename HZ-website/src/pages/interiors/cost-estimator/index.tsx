import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import InteriorsCostEstimator from "@/components/Products/components/SubServices/InteriorsComponent/interiorsCalculator";
import SEO from '@/components/SEO';


const CostEstimator = () => {
    return (
        <div>
            <SEO
                title="Interiors Cost Estimator | Calculate Interior Design Costs for Your Home & Office"
                description="Estimate the cost of your interior design projects with our Interiors Cost Estimator. Get a detailed budget breakdown for home and office interiors."
                keywords="Interiors Cost Estimator, Interior Design Budget, Home Interior Cost, Office Interior Estimate, OneCasa Interiors, Interior Renovation Cost, Calculate Interior Costs"
                imageUrl="https://www.onecasa.in/images/logobb.png"
            />

            <InteriorsCostEstimator />
        </div>
    );
};

export default withGeneralLayout(CostEstimator);
