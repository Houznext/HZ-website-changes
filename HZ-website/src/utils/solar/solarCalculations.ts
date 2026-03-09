export interface SolarQuote {
    solarType: 'residential' | 'commercial';
    category: string;
    monthlyBill: number;
    // System specifications
    recommendedSystemSize: number; // in kW
    annualGeneration: number; // in kWh
    spaceRequired: number; // in sq.ft

    // Cost breakdown
    systemCost: number;
    subsidy: number;
    effectiveCost: number;

    // Savings
    estimatedAnnualSavings: number;

    // EMI breakdown
    emiOptions: {
        tenure: number; // in months
        monthlyEmi: number;
    }[];
}

// Constants based on Indian solar market standards
const CONSTANTS = {
    // Average daily sunlight hours in India
    SUNLIGHT_HOURS: 5.5,

    // System efficiency (accounting for losses)
    SYSTEM_EFFICIENCY: 0.80,

    // Base Costs per kW installed
    COSTS: {
        residential: {
            rooftop: 70000,
            cc_camera: 85000,
            digital: 80000,
            apartment: 65000,
        },
        commercial: {
            industrial: 60000,
            parking: 72000,
            street_lights: 70000,
            warehouse: 58000,
            educational: 62000,
        }
    },

    // Average electricity rate in India (₹/unit)
    ELECTRICITY_RATE: 7,

    // Space required per kW
    SPACE_PER_KW: 100, // sq.ft

    // EMI interest rate (annual)
    EMI_INTEREST_RATE: 0.06, // 6% p.a.

    // Average monthly consumption per kW system
    MONTHLY_UNITS_PER_KW: 120, // A 1kW system generates ~120 units/month
};

/**
 * Calculate recommended system size based on monthly electricity bill
 */
function calculateSystemSize(monthlyBill: number, category: string): number {
    // CC Camera and Street Lights might have small fixed requirements if bill is low
    if (category === 'cc_camera' && monthlyBill < 500) return 0.5;
    if (category === 'street_lights' && monthlyBill < 500) return 1.0;

    // Estimate monthly consumption from bill
    const monthlyConsumption = monthlyBill / CONSTANTS.ELECTRICITY_RATE;

    // Calculate required kW to meet consumption
    // Adding 10% buffer for efficiency and future needs
    const requiredKw = (monthlyConsumption / CONSTANTS.MONTHLY_UNITS_PER_KW) * 1.1;

    // Round to nearest 0.5 kW for practical installation
    return Math.max(0.5, Math.round(requiredKw * 2) / 2);
}

/**
 * Calculate annual energy generation
 */
function calculateAnnualGeneration(systemSizeKw: number): number {
    // Annual generation = System size × Sunlight hours × 365 × Efficiency
    return Math.round(
        systemSizeKw *
        CONSTANTS.SUNLIGHT_HOURS *
        365 *
        CONSTANTS.SYSTEM_EFFICIENCY
    );
}

/**
 * Calculate PM Surya Ghar subsidy for residential installations
 */
function calculateSubsidy(systemSizeKw: number, category: string): number {
    // Subsidy primarily applies to Rooftop and Apartment systems
    if (category !== 'rooftop' && category !== 'apartment') {
        return 0;
    }

    if (systemSizeKw <= 2) {
        return 0;
    } else if (systemSizeKw <= 3) {
        return 78000; // Fixed subsidy for up to 3kW
    } else {
        // ₹78,000 for first 3kW, ₹19,500/kW for additional
        const additionalKw = Math.min(systemSizeKw - 3, 7); // Max 10kW total
        return 78000 + (additionalKw * 19500);
    }
}

/**
 * Calculate system cost
 */
function calculateSystemCost(
    systemSizeKw: number,
    solarType: 'residential' | 'commercial',
    category: string
): number {
    const typeCosts = solarType === 'residential' ? CONSTANTS.COSTS.residential : CONSTANTS.COSTS.commercial;
    const costPerKw = (typeCosts as any)[category] || (solarType === 'residential' ? 70000 : 60000);

    return Math.round(systemSizeKw * costPerKw);
}

/**
 * Calculate EMI for different tenures
 */
function calculateEMI(principal: number, tenureMonths: number): number {
    const monthlyRate = CONSTANTS.EMI_INTEREST_RATE / 12;

    if (monthlyRate === 0) {
        return principal / tenureMonths;
    }

    // EMI formula: P × r × (1 + r)^n / ((1 + r)^n - 1)
    const emi =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1);

    return Math.round(emi);
}

/**
 * Calculate estimated annual savings
 */
function calculateAnnualSavings(annualGeneration: number): number {
    return Math.round(annualGeneration * CONSTANTS.ELECTRICITY_RATE);
}

/**
 * Main function to generate solar quote
 */
export function generateSolarQuote(
    monthlyBill: number,
    solarType: 'residential' | 'commercial',
    category: string = 'rooftop'
): SolarQuote {
    // Calculate system size
    const systemSize = calculateSystemSize(monthlyBill, category);

    // Calculate annual generation
    const annualGeneration = calculateAnnualGeneration(systemSize);

    // Calculate costs
    const systemCost = calculateSystemCost(systemSize, solarType, category);
    const subsidy = solarType === 'residential' ? calculateSubsidy(systemSize, category) : 0;
    const effectiveCost = systemCost - subsidy;

    // Calculate savings
    const annualSavings = calculateAnnualSavings(annualGeneration);

    // Calculate space required
    const spaceRequired = Math.round(systemSize * CONSTANTS.SPACE_PER_KW);

    // Calculate EMI options (6, 12, 18, 24 months)
    const emiOptions = [6, 12, 18, 24].map(tenure => ({
        tenure,
        monthlyEmi: calculateEMI(effectiveCost, tenure),
    }));

    return {
        solarType,
        category,
        monthlyBill,
        recommendedSystemSize: systemSize,
        annualGeneration,
        spaceRequired,
        systemCost,
        subsidy,
        effectiveCost,
        estimatedAnnualSavings: annualSavings,
        emiOptions,
    };
}

/**
 * Format currency in Indian format
 */
export function formatIndianCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
}
