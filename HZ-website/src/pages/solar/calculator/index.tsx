import CalculationResultView from "@/components/SolarPage/CalculationResultView";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import React from "react";
import SEO from '@/components/SEO';


const CalculationResult = () => {
    return (
        <div>
            <SEO
                title="Solar Calculation Result | Optimize Your Solar Energy Savings"
                description="Check your solar power savings with our accurate solar calculation tool. Get insights on energy efficiency, cost savings, and installation recommendations."
                keywords="Solar Calculation, Solar Savings, Solar Power Estimate, Solar Panel Installation, Renewable Energy, Green Energy, Solar Cost Calculator"

                imageUrl="https://www.onecasa.in/images/logobb.png"
            />
            <CalculationResultView />
        </div>
    );
};

export default withGeneralLayout(CalculationResult);
