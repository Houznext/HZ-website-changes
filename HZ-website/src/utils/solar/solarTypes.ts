export interface SolarData {
  kilowatt: number;
  projectCost: number;
  consumerShare: number;
  rooftopArea: {
    squareFeet: number;
    squareMeters: number;
  };
  electricityGeneration: {
    daily: number;
    yearly: number;
  };
  financialSavings: {
    daily: number;
  };
  subsidy: {
    amount: number;
  };
}
