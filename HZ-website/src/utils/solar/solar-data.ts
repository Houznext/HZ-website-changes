import { SolarData } from "@/components/SolarPage/CalculationResultView";

interface ROIDetails {
  paybackPeriod: number;
  annualROI: number;
}

const solarData: SolarData[] = [
  {
    kilowatt: 1,
    consumerShare: 57720,
    projectCost: 83000,
    rooftopArea: {
      squareFeet: 130,
      squareMeters: 13,
    },
    electricityGeneration: {
      daily: 4.32,
      yearly: 1576,
    },
    financialSavings: {
      daily: 12.96,
    },
    subsidy: {
      amount: 30000,
    },
  },
  {
    kilowatt: 2,
    consumerShare: 88720,
    projectCost: 144000,
    rooftopArea: {
      squareFeet: 200,
      squareMeters: 19,
    },
    electricityGeneration: {
      daily: 8.64,
      yearly: 3153,
    },
    financialSavings: {
      daily: 25.92,
    },
    subsidy: {
      amount: 60000,
    },
  },
  {
    kilowatt: 3,
    consumerShare: 133120,
    projectCost: 206400,
    rooftopArea: {
      squareFeet: 300,
      squareMeters: 28,
    },
    electricityGeneration: {
      daily: 12.96,
      yearly: 4730,
    },
    financialSavings: {
      daily: 38.88,
    },
    subsidy: {
      amount: 78000,
    },
  },
  {
    kilowatt: 4,
    consumerShare: 186320,
    projectCost: 259600,
    rooftopArea: {
      squareFeet: 400,
      squareMeters: 38,
    },
    electricityGeneration: {
      daily: 17.28,
      yearly: 6307,
    },
    financialSavings: {
      daily: 51.84,
    },
    subsidy: {
      amount: 78000,
    },
  },
  {
    kilowatt: 5,
    consumerShare: 251220,
    projectCost: 324500,
    rooftopArea: {
      squareFeet: 550,
      squareMeters: 52,
    },
    electricityGeneration: {
      daily: 21.6,
      yearly: 7884,
    },
    financialSavings: {
      daily: 64.8,
    },
    subsidy: {
      amount: 78000,
    },
  },
  {
    kilowatt: 6,
    consumerShare: 316120,
    projectCost: 389400,
    rooftopArea: {
      squareFeet: 650,
      squareMeters: 61,
    },
    electricityGeneration: {
      daily: 25.92,
      yearly: 9460,
    },
    financialSavings: {
      daily: 77.76,
    },
    subsidy: {
      amount: 78000,
    },
  },
  {
    kilowatt: 7,
    consumerShare: 381020,
    projectCost: 454300,
    rooftopArea: {
      squareFeet: 750,
      squareMeters: 70,
    },
    electricityGeneration: {
      daily: 30.24,
      yearly: 11037,
    },
    financialSavings: {
      daily: 90.72,
    },
    subsidy: {
      amount: 78000,
    },
  },
  {
    kilowatt: 8,
    consumerShare: 445920,
    projectCost: 519200,
    rooftopArea: {
      squareFeet: 800,
      squareMeters: 75,
    },
    electricityGeneration: {
      daily: 34.56,
      yearly: 12614,
    },
    financialSavings: {
      daily: 103.68,
    },
    subsidy: {
      amount: 78000,
    },
  },
  {
    kilowatt: 9,
    consumerShare: 510820,
    projectCost: 584100,
    rooftopArea: {
      squareFeet: 900,
      squareMeters: 84,
    },
    electricityGeneration: {
      daily: 38.88,
      yearly: 14191,
    },
    financialSavings: {
      daily: 116.64,
    },
    subsidy: {
      amount: 78000,
    },
  },
  {
    kilowatt: 10,
    consumerShare: 575720,
    projectCost: 649000,
    rooftopArea: {
      squareFeet: 1000,
      squareMeters: 93,
    },
    electricityGeneration: {
      daily: 43.2,
      yearly: 15768,
    },
    financialSavings: {
      daily: 129.6,
    },
    subsidy: {
      amount: 78000,
    },
  },
];

export const getKW = (monthlyBill: number) => {
  let kw = 0;

  if (monthlyBill < 0) return;

  if (monthlyBill < 1000) kw = 1;
  else if (monthlyBill >= 1000 && monthlyBill < 2000) kw = 2;
  else if (monthlyBill >= 2000 && monthlyBill < 3000) kw = 3;
  else if (monthlyBill >= 3000 && monthlyBill < 4000) kw = 4;
  else if (monthlyBill >= 4000 && monthlyBill < 5000) kw = 5;
  else if (monthlyBill >= 5000 && monthlyBill < 6000) kw = 6;
  else if (monthlyBill >= 6000 && monthlyBill < 7000) kw = 7;
  else if (monthlyBill >= 7000 && monthlyBill < 8000) kw = 8;
  else if (monthlyBill >= 8000 && monthlyBill < 9000) kw = 9;
  else if (monthlyBill >= 9000 && monthlyBill <= 10000) kw = 10;

  return kw;
};

export const getKWData = (kw: number) => {
  return solarData.find((item) => item.kilowatt === kw);
};

export const calculateROI = (kw: number): ROIDetails | undefined => {
  const kwData = getKWData(kw as number);
  if (!kwData) return undefined;

  // Annual savings (in currency) = daily savings * 365
  const annualSavings = kwData.financialSavings.daily * 365;

  // We assume the "consumerShare" is the investment cost
  const investmentCost = kwData.consumerShare;

  // Payback period (years) = investment cost / annual savings
  const paybackPeriod = investmentCost / annualSavings;

  // Annual ROI (%) = (annualSavings / investmentCost) * 100
  const annualROI = parseFloat(
    ((annualSavings / investmentCost) * 100).toFixed(2)
  );

  return {
    paybackPeriod,
    annualROI,
  };
};
export enum ServiceCategory {
  RealEstate = "RealEstate",
  Interiors = "Interiors",
  CustomBuilder = "CustomBuilder",
  Solar = "Solar",
  PackersAndMovers = "PackersAndMovers",
  Painting = "Painting",
  Plumber = "Plumber",
  EarthMovers = "EarthMovers",
  HomeDecor = "HomeDecor",
  Furniture = "Furniture",
  CivilEngineeringDesign = "CivilEngineeringDesign",
  VaastuConsultation = "VaastuConsultation",
}

export const serviceOptions = [
  { id: 1, service: ServiceCategory.CustomBuilder },
  { id: 2, service: ServiceCategory.RealEstate },
  { id: 3, service: ServiceCategory.Interiors, disabled: true },
  { id: 4, service: ServiceCategory.Furniture },
  { id: 5, service: ServiceCategory.Plumber },
  { id: 6, service: ServiceCategory.Painting },
  { id: 7, service: ServiceCategory.VaastuConsultation },
  { id: 8, service: ServiceCategory.CivilEngineeringDesign },
  { id: 9, service: ServiceCategory.Solar },
];

export const cities = [
  { id: 1, city: "Mumbai" },
  { id: 2, city: "Delhi" },
  { id: 3, city: "Bangalore" },
  { id: 4, city: "Hyderabad" },
  { id: 5, city: "Ahmedabad" },
  { id: 6, city: "Chennai" },
  { id: 7, city: "Kolkata" },
  { id: 8, city: "Surat" },
  { id: 9, city: "Pune" },
  { id: 10, city: "Jaipur" },
  { id: 11, city: "Lucknow" },
  { id: 12, city: "Kanpur" },
  { id: 13, city: "Nagpur" },
  { id: 14, city: "Indore" },
  { id: 15, city: "Thane" },
  { id: 16, city: "Bhopal" },
  { id: 17, city: "Visakhapatnam" },
  { id: 18, city: "Pimpri-Chinchwad" },
  { id: 19, city: "Patna" },
  { id: 20, city: "Vadodara" },
];

export const states = [
  { id: 1, state: "Andhra Pradesh" },
  { id: 2, state: "Arunachal Pradesh" },
  { id: 3, state: "Assam" },
  { id: 4, state: "Bihar" },
  { id: 5, state: "Chhattisgarh" },
  { id: 6, state: "Goa" },
  { id: 7, state: "Gujarat" },
  { id: 8, state: "Haryana" },
  { id: 9, state: "Himachal Pradesh" },
  { id: 10, state: "Jharkhand" },
  { id: 11, state: "Karnataka" },
  { id: 12, state: "Kerala" },
  { id: 13, state: "Madhya Pradesh" },
  { id: 14, state: "Maharashtra" },
  { id: 15, state: "Manipur" },
  { id: 16, state: "Meghalaya" },
  { id: 17, state: "Mizoram" },
  { id: 18, state: "Nagaland" },
  { id: 19, state: "Odisha" },
  { id: 20, state: "Punjab" },
  { id: 21, state: "Rajasthan" },
  { id: 22, state: "Sikkim" },
  { id: 23, state: "Tamil Nadu" },
  { id: 24, state: "Telangana" },
  { id: 25, state: "Tripura" },
  { id: 26, state: "Uttar Pradesh" },
  { id: 27, state: "Uttarakhand" },
  { id: 28, state: "West Bengal" },
];

export const categories = [
  { id: 1, category: "Commercial" },
  { id: 2, category: "Residential" },
  { id: 3, category: "Industrial" },
  { id: 4, category: "Agriculture" },
];
