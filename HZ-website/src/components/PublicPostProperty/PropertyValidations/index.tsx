import {
  LookingType,
  PurposeType,
} from "@/components/Property/PropertyDetails/PropertyHelpers";
import {
  PlotAgriculturePosessionTypeEnum,
  propertyTypeEnum,
} from "../PropertyHelpers";
import toast from "react-hot-toast";

const propertyValidationRules: any = {
  residential: {
    "1BHK": {
      minPrice: 1000000, // 10 Lakhs
      minFloorArea: 400, // in sqft
      minBuiltUpArea: 300,
      minBathrooms: 1,
      minAdvance: 30000,
      minPricePerSqFt: 2500,
      minExpectedPrice: 1100000,
      minMonthlyRent: 8000,
      minSecurityDeposit: 2000,
      minMaintenanceCharge: 1000,
    },
    "2BHK": {
      minPrice: 1500000, // 15 Lakhs
      minFloorArea: 500,
      minBuiltUpArea: 400,
      minBathrooms: 2,
      minAdvance: 50000,
      minPricePerSqFt: 3000,
      minExpectedPrice: 1600000,
      minMonthlyRent: 12000,
      minSecurityDeposit: 3000,
      minMaintenanceCharge: 1500,
    },
    "3BHK": {
      minPrice: 2500000, // 25 Lakhs
      minFloorArea: 800,
      minBuiltUpArea: 700,
      minBathrooms: 3,
      minAdvance: 75000,
      minPricePerSqFt: 3200,
      minExpectedPrice: 2700000,
      minMonthlyRent: 18000,
      minSecurityDeposit: 54000,
      minMaintenanceCharge: 2000,
    },
    "4BHK": {
      minPrice: 4000000, // 40 Lakhs
      minFloorArea: 1200,
      minBuiltUpArea: 1000,
      minBathrooms: 4,
      minAdvance: 100000,
      minPricePerSqFt: 3500,
      minExpectedPrice: 4200000,
      minMonthlyRent: 25000,
      minSecurityDeposit: 75000,
      minMaintenanceCharge: 2500,
    },
    "5BHK": {
      minPrice: 6000000, // 60 Lakhs
      minFloorArea: 1600,
      minBuiltUpArea: 1400,
      minBathrooms: 5,
      minAdvance: 150000,
      minPricePerSqFt: 3800,
      minExpectedPrice: 6500000,
      minMonthlyRent: 32000,
      minSecurityDeposit: 96000,
      minMaintenanceCharge: 3000,
    },
  },
  commercial: {
    Office: {
      minPrice: 0,
      minFloorArea: 50,
      minBuiltUpArea: 50,
      minBathrooms: 0,
      minAdvance: 0,
      minPricePerSqFt: 100,
      minExpectedPrice: 100000,
      minMonthlyRent: 1000,
      minSecurityDeposit: 1000,
      minMaintenanceCharge: 0,
    },
    Plot: {
      minPrice: 0,
      minFloorArea: 50,
      minBuiltUpArea: 0,
      minBathrooms: 0,
      minAdvance: 0,
      minPricePerSqFt: 50,
      minExpectedPrice: 50000,
      minMonthlyRent: 500,
      minSecurityDeposit: 500,
      minMaintenanceCharge: 0,
    },
    "Retail Shop": {
      minPrice: 0,
      minFloorArea: 50,
      minBuiltUpArea: 50,
      minBathrooms: 0,
      minAdvance: 0,
      minPricePerSqFt: 100,
      minExpectedPrice: 100000,
      minMonthlyRent: 1000,
      minSecurityDeposit: 1000,
      minMaintenanceCharge: 0,
    },
    Showroom: {
      minPrice: 0,
      minFloorArea: 100,
      minBuiltUpArea: 100,
      minBathrooms: 0,
      minAdvance: 0,
      minPricePerSqFt: 100,
      minExpectedPrice: 100000,
      minMonthlyRent: 1000,
      minSecurityDeposit: 1000,
      minMaintenanceCharge: 0,
    },
  },
};

export const propertyValidations = (
  propertyDetails: any,
  basicDetails: any,
  locationDetails: any,
  property: any
) => {
  let errors: Record<string, string> = {};

  // **Basic Validations**
  if (!propertyDetails.propertyType) {
    errors.propertyType = "Property type is required.";
  }

  if (!locationDetails?.city) {
    errors.city = "City is a required field.";
  }
  const name = propertyDetails.propertyName?.trim();

  if (!name) {
    errors.propertyName = "Property name is required.";
  } else if (/^\d+$/.test(name)) {
    errors.propertyName =
      "Property name should include letters, not just numbers.";
  } else if (/^[0-9]/.test(name)) {
    errors.propertyName = "Property name should not start with a number.";
  } else if (/[^a-zA-Z0-9\s-]/.test(name)) {
    errors.propertyName =
      "Property name should not contain special characters.";
  }

  

  // **Plot & Agricultural Land Validations**
  if (
    propertyDetails.propertyType === propertyTypeEnum.Plot ||
    propertyDetails.propertyType === propertyTypeEnum.AgriculturalLand
  ) {
    const plotAttributes = propertyDetails?.plotAttributes || {};

    if (!plotAttributes.plotArea?.size || plotAttributes.plotArea?.size <= 0) {
      errors.plotArea = "Plot area must be greater than 0.";
    }

    if (!plotAttributes.length?.size || plotAttributes.length.size <= 0) {
      errors.length = "Length must be greater than 0.";
    }

    if (!plotAttributes.width?.size || plotAttributes.width?.size <= 0) {
      errors.width = "Width must be greater than 0.";
    }

    if (
      !plotAttributes.widthFacingRoad?.size ||
      plotAttributes.widthFacingRoad?.size <= 0
    ) {
      errors.widthFacingRoad = "Width facing road must be greater than 0.";
    }

    if (!plotAttributes.facing) {
      errors.facing = "Facing direction is required.";
    }

    if (!plotAttributes.possessionStatus) {
      errors.possessionStatus = "Possession status is required.";
    }

    if (
      plotAttributes.possessionStatus ===
      PlotAgriculturePosessionTypeEnum.InFuture &&
      !plotAttributes.possessionDate
    ) {
      errors.possessionDate = "Possession date is required.";
    }

    if (!plotAttributes.transactionType) {
      errors.transactionType = "Transaction type is required.";
    }

    if (
      plotAttributes.noOfFloorsAllowed !== null &&
      plotAttributes.noOfFloorsAllowed < 0
    ) {
      errors.noOfFloorsAllowed = "Number of floors allowed cannot be negative.";
    }

    return errors; // **Early return for plot properties**
  }

  // **Residential Property Validations**
  if (basicDetails?.purpose === PurposeType.Residential && basicDetails?.lookingType !== LookingType.FlatShare) {
    const residentialAttributes = propertyDetails?.residentialAttributes || {};
    console.log("residential attributes", residentialAttributes);

    if (!residentialAttributes?.bhk) {
      errors.bhk = "BHK selection is required.";
    }

    if (!residentialAttributes?.facing) {
      errors.facing = "Facing direction is required.";
    }
    if (!residentialAttributes?.floorArea) {
      errors.floorArea = "Floor area is required.";
    }

    // Get validation rules for the selected BHK type
    const validationRules =
      propertyValidationRules.residential[residentialAttributes.bhk] || {};

    // Pricing validations for Rent
    const pricingDetails = propertyDetails?.pricingDetails || {};
    if (basicDetails?.lookingType === LookingType.Rent) {
      if (
        validationRules.minMonthlyRent != null &&
        (pricingDetails?.monthlyRent ?? 0) <= validationRules.minMonthlyRent
      ) {
        errors.monthlyRent = `Monthly rent must be greater than ${validationRules.minMonthlyRent}.`;
      }

      

      if (
        validationRules.minMaintenanceCharge != null &&
        (pricingDetails?.maintenanceCharges ?? 0) <
          validationRules.minMaintenanceCharge
      ) {
        errors.maintenanceCharges = `Maintenance charges must be at least ₹${validationRules.minMaintenanceCharge}.`;
      }
    }

    // Pricing Validations for Sell
    if (basicDetails?.lookingType === LookingType.Sell) {
      if (
        validationRules.minPricePerSqFt != null &&
        (!pricingDetails?.pricePerSqft ||
          pricingDetails.pricePerSqft <= validationRules.minPricePerSqFt)
      ) {
        errors.pricePerSqft = `Price per Sq. Ft. must be greater than ${validationRules.minPricePerSqFt}.`;
        toast.error(errors.pricePerSqft);
      }

      if (
        validationRules.minExpectedPrice != null &&
        (!pricingDetails?.expectedPrice ||
          pricingDetails.expectedPrice <= validationRules.minExpectedPrice)
      ) {
        errors.expectedPrice = `Expected price must be greater than ${validationRules.minExpectedPrice}.`;
      }
    }

    if (property?.propertyDetails?.constructionStatus?.possessionYears < 1) {
      errors.possessionYears = "Possession years must be selected";
    }

    if (
      (property?.propertyDetails?.constructionStatus?.ageOfProperty ?? 0) > 30
    ) {
      errors.ageOfProperty = "Age of property must be less than 30 years";
    }

    const floorArea = residentialAttributes?.floorArea;
    const buildupArea = residentialAttributes?.buildupArea;

    const validUnits = [
      "sq.ft",
      "sq.yard",
      "sq.meter",
      "acre",
      "cent",
      "marla",
    ];

    // Floor Area Validation
    if (
      !floorArea?.size ||
      floorArea.size === null ||
      floorArea.size === undefined ||
      floorArea.size === ""
    ) {
      errors.floorArea = "Floor area is required.";
    } else if (floorArea.size < validationRules.minFloorArea) {
      errors.floorArea = `Minimum floor area for ${residentialAttributes.bhk} is ${validationRules.minFloorArea} sqft.`;
    } else if (!floorArea.unit || !validUnits.includes(floorArea.unit)) {
      errors.floorArea = "Please select a valid unit for Floor Area.";
    }

    // Built-up Area Validation
    if (
      !buildupArea?.size ||
      buildupArea.size === null ||
      buildupArea.size === undefined ||
      buildupArea.size === ""
    ) {
      errors.buildupArea = "Built-up area is required.";
    } else if (buildupArea.size < validationRules.minBuiltUpArea) {
      errors.buildupArea = `Minimum built-up area for ${residentialAttributes.bhk} is ${validationRules.minBuiltUpArea} sqft.`;
    } else if (!buildupArea.unit || !validUnits.includes(buildupArea.unit)) {
      errors.buildupArea = "Please select a valid unit for Built-up Area.";
    }

    if (
      residentialAttributes.bathrooms === null ||
      residentialAttributes.bathrooms === undefined ||
      residentialAttributes.bathrooms === ""
    ) {
      errors.bathrooms = "Number of bathrooms is required.";
    } else if (residentialAttributes.bathrooms < 1) {
      errors.bathrooms = "At least one bathroom is required.";
    }

    if (
      residentialAttributes.totalFloors === null ||
      residentialAttributes.totalFloors === undefined ||
      residentialAttributes.totalFloors === ""
    ) {
      errors.totalFloors = "Total floors is required.";
    } else if (residentialAttributes.totalFloors < 1) {
      errors.totalFloors = "Total floors must be at least 1.";
    }

    const needsCurrentFloor =
      propertyDetails.propertyType === propertyTypeEnum.Apartment ||
      propertyDetails.propertyType === propertyTypeEnum.IndependentFloor;

    if (needsCurrentFloor) {
      if (
        residentialAttributes.currentFloor === null ||
        residentialAttributes.currentFloor === undefined ||
        residentialAttributes.currentFloor === ""
      ) {
        errors.currentFloor = "Current floor is required.";
      } else if (
        residentialAttributes.currentFloor > residentialAttributes.totalFloors!
      ) {
        errors.currentFloor =
          "Current floor cannot be greater than total floors.";
      }
    }
  }
  if (
    basicDetails?.purpose === PurposeType.Residential &&
    basicDetails?.lookingType === LookingType.FlatShare
  ) {
    const flatshare = propertyDetails.flatshareAttributes || {};
    const pricingDetails = propertyDetails.pricingDetails || {};
    const validUnits = [
      "sq.ft",
      "sq.yard",
      "sq.meter",
      "acre",
      "cent",
      "marla",
    ];

    if (!flatshare.bhk) {
      errors.bhk = "BHK is required.";
    }

    if (!flatshare.facing) {
      errors.facing = "Facing direction is required.";
    }

    if (
      !flatshare.floorArea?.size ||
      flatshare.floorArea.size < 100
    ) {
      errors.floorArea = "Floor area must be at least 100 sqft.";
    } else if (
      !flatshare.floorArea.unit ||
      !validUnits.includes(flatshare.floorArea.unit)
    ) {
      errors.floorArea = "Please select a valid unit for floor area.";
    }

    if (
      flatshare.bathroom === null ||
      flatshare.bathroom === undefined ||
      flatshare.bathroom < 1
    ) {
      errors.bathroom = "At least one bathroom is required.";
    }

    if (
      flatshare.totalFloors === null ||
      flatshare.totalFloors < 1
    ) {
      errors.totalFloors = "Total floors must be at least 1.";
    }

    if (
      flatshare.currentFloor === null ||
      flatshare.currentFloor > flatshare.totalFloors
    ) {
      errors.currentFloor = "Current floor must not exceed total floors.";
    }

    if (!pricingDetails.monthlyRent || pricingDetails.monthlyRent < 3000) {
      errors.monthlyRent = "Monthly rent must be at least ₹3000.";
    }

    

    return errors;
  }


  // **Commercial Property Validations**
  if (basicDetails?.purpose === PurposeType.Commercial) {
    const commercialAttributes = propertyDetails?.commercialAttributes || {};
    const pricingDetails = propertyDetails?.pricingDetails || {};

    const validationRules =
      propertyValidationRules.commercial[propertyDetails?.propertyType] || {};

    if (!commercialAttributes.ownership) {
      errors.ownership = "Ownership type is required.";
    }

    const builtUpSize = commercialAttributes.builtUpArea?.size ?? commercialAttributes.builtUpArea;
    if (builtUpSize != null && builtUpSize > 0 && builtUpSize < (validationRules.minBuiltUpArea || 0)) {
      errors.builtUpArea = `Minimum built-up area is ${validationRules.minBuiltUpArea} sqft.`;
    }

    if (basicDetails?.lookingType === LookingType.Sell) {
      if (pricingDetails.expectedPrice != null && pricingDetails.expectedPrice > 0 && pricingDetails.expectedPrice < (validationRules.minExpectedPrice || 0)) {
        errors.expectedPrice = `Minimum expected price is ₹${validationRules.minExpectedPrice}.`;
      }
    }

    if (basicDetails?.lookingType === LookingType.Rent) {
      if (pricingDetails.monthlyRent != null && pricingDetails.monthlyRent > 0 && pricingDetails.monthlyRent < (validationRules.minMonthlyRent || 0)) {
        errors.monthlyRent = `Minimum monthly rent is ₹${validationRules.minMonthlyRent}.`;
      }
    }
  }

  // **Pricing Validations**
  const pricingDetails = propertyDetails?.pricingDetails || {};

  // **Negotiable Price Validation**
  if (
    pricingDetails.isNegotiable &&
    pricingDetails.minPriceOffer !== null &&
    pricingDetails.maxPriceOffer !== null
  ) {
    if (pricingDetails.minPriceOffer > pricingDetails.maxPriceOffer) {
      errors.minPriceOffer =
        "Min price offer cannot be greater than max price offer.";
    }
  }

  // **Construction Status Validations**
  const constructionStatus = propertyDetails?.constructionStatus || {};

  if (
    constructionStatus.status &&
    constructionStatus.ageOfProperty !== null &&
    constructionStatus.ageOfProperty < 0
  ) {
    errors.ageOfProperty = "Age of property cannot be negative.";
  }

  // **Furnishing Validations**
  if (basicDetails?.purpose === PurposeType.Residential) {
    const furnishing = propertyDetails?.furnishing || {};

    if (
      furnishing.furnishedType === null ||
      furnishing.furnishedType === undefined ||
      furnishing.furnishedType === ""
    ) {
      errors.furnishedType = "Furnished type is required.";
    }
  }

  return errors;
};
