export const getLabelForPath = (path: string) => {
  switch (path) {
    case "":
      return "Home";
    case "services":
      return "Services";
    case "custom-builder":
      return "Custom builder";
    case "construction-for-business":
      return "Construction for business";
    case "residential-construction":
      return "Residential construction";
    default:
      return "";
  }
};

export const parseQueryParam = (param?: string | string[]): string[] => {
  if (!param || param.length === 0) return [];
  return Array.isArray(param) ? param.join(",").split(",") : param.split(",");
};

export const capitalizeFirstLetter = (word: string) => {
  return word.charAt(0).toUpperCase() + word.slice(1);
};

export const removeAllSpaces = (input?: string | string[]) => {
  if (Array.isArray(input)) {
    return input.map((str) => str.replace(/\s+/g, ""));
  }
  return input?.replace(/\s+/g, "");
};

export const formatCost = (amount: any) => {
  if (!amount) {
    return "N/A";
  }
  if (amount >= 10000000) {
    return (amount / 10000000).toFixed(2).replace(/\.00$/, "") + " Cr";
  } else if (amount >= 100000) {
    return (amount / 100000).toFixed(2).replace(/\.00$/, "") + " L";
  } else if (amount >= 1000) {
    return (amount / 1000).toFixed(2).replace(/\.00$/, "") + " K";
  } else {
    return amount.toLocaleString("en-IN");
  }
};

export const formatBHKTypes = (bhkTypes: any) => {
  if (!bhkTypes || bhkTypes.length === 0) {
    return "";
  }

  const bhkNumbers: any = [];
  let rkExists = false;

  bhkTypes.forEach((bhk: any) => {
    if (bhk && bhk.includes("BHK")) {
      bhkNumbers.push(bhk.replace("BHK", ""));
    } else if (bhk && bhk.includes("RK")) {
      rkExists = true;
    }
  });

  const bhkString = bhkNumbers.length > 0 ? bhkNumbers.join(", ") + " BHK" : "";
  const rkString = rkExists ? (bhkString ? ", 1 RK" : "1 RK") : "";

  return bhkString + rkString;
};

export function generateSlug(label: string): string {
  return label
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}
