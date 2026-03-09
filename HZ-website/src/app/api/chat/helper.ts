/** Base URL from env: uses NEXTAUTH_URL (same as app URL in prod). */
export function getBaseUrl(fallback?: string): string {
  if (typeof process !== "undefined" && process.env?.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  }
  return fallback ?? "https://www.onecasa.in";
}

export interface PropertySearchParams {
  lookingType?: "buy" | "rent" | "plot" | "flatshare";
  city?: string;
  locality?: string;
  propertyType?: string;
  bhkType?: string;
  purpose?: string;
  page?: number;
}

const PROPERTY_TYPE_MAP: Record<string, string> = {
  flat: "Apartment",
  apartment: "Apartment",
  villa: "Villa",
  house: "Independent House",
  "independent house": "Independent House",
  plot: "Plot",
  floor: "Independent Floor",
  "independent floor": "Independent Floor",
};

/**
 * Build property listing URL: /properties/[category]/[city]?propertyType=...&bhkType=...&purpose=...&page=1
 * baseUrl: optional origin (e.g. from request) for server; client can omit to use current origin.
 */
export const buildPropertyLink = (
  params: PropertySearchParams,
  baseUrl?: string
): string => {
  const category = params.lookingType || "buy";
  const cityPath = (params.city || "Hyderabad").trim();
  const city = cityPath.charAt(0).toUpperCase() + cityPath.slice(1).toLowerCase();

  const search = new URLSearchParams();
  if (params.propertyType) search.set("propertyType", params.propertyType);
  if (params.bhkType) search.set("bhkType", params.bhkType.replace(/\s+/g, " ").trim());
  if (params.purpose) search.set("purpose", params.purpose);
  if (params.locality) search.set("locality", params.locality);
  search.set("page", String(params.page ?? 1));

  const query = search.toString();
  const base =
    baseUrl ??
    (typeof window !== "undefined" ? window.location.origin : "https://www.onecasa.in");
  return `${base}/properties/${category}/${city}${query ? `?${query}` : ""}`;
};

/** Normalize BHK from user text e.g. "2bhk", "3 bhk" -> "2 BHK" */
export const normalizeBhk = (text: string): string | undefined => {
  const m = text.toLowerCase().match(/(\d)\s*bhk/);
  if (!m) return undefined;
  return `${m[1]} BHK`;
};

const KNOWN_LOCALITIES: Record<string, string[]> = {
  hyderabad: ["madhapur", "gachibowli", "hitech city", "jubilee hills", "banjara hills", "financial district", "kondapur", "kukatpally", "secunderabad", "manikonda", "miyapur"],
  bangalore: ["whitefield", "electronic city", "indiranagar", "koramangala", "mg road", "marathahalli", "hsr layout", "bellandur"],
  mumbai: ["bandra", "andheri", "powai", "thane", "south mumbai"],
  delhi: ["south delhi", "dwarka", "saket", "gurgaon", "noida"],
};

/** Extract property search intent from user message; returns params for buildPropertyLink. */
export function parsePropertySearchIntent(message: string): PropertySearchParams | null {
  const lower = message.toLowerCase().trim();

  const cities = [
    "hyderabad", "bangalore", "mumbai", "delhi", "chennai", "pune", "kolkata",
    "gurgaon", "noida", "faridabad", "ghaziabad", "greater noida",
  ];
  let city: string | undefined;
  let locality: string | undefined;
  for (const c of cities) {
    const idx = lower.indexOf(c);
    if (idx === -1) continue;
    if (idx > 0 && /[\w]/.test(lower[idx - 1])) continue;
    city = c.charAt(0).toUpperCase() + c.slice(1);
    const beforeCity = lower.slice(0, idx).trim().split(/\s+/);
    const lastWord = beforeCity[beforeCity.length - 1];
    const localityList = KNOWN_LOCALITIES[c];
    if (lastWord && lastWord.length > 2 && localityList?.some((loc) => loc.includes(lastWord) || lastWord.includes(loc))) {
      locality = lastWord.charAt(0).toUpperCase() + lastWord.slice(1);
    } else if (lastWord && lastWord.length > 2 && !["in", "at", "for", "a", "the", "flat", "house", "villa", "property", "properties"].includes(lastWord)) {
      locality = lastWord.charAt(0).toUpperCase() + lastWord.slice(1);
    }
    break;
  }

  const buyRent = lower.includes("rent") || lower.includes("on rent")
    ? "rent"
    : lower.includes("buy") || lower.includes("purchase") || lower.includes("sale") || lower.includes("sell")
      ? "buy"
      : "buy";

  const bhk = normalizeBhk(message) || normalizeBhk(lower);

  let propertyType: string | undefined;
  for (const [key, value] of Object.entries(PROPERTY_TYPE_MAP)) {
    if (lower.includes(key)) {
      propertyType = value;
      break;
    }
  }

  const purpose = "Residential";

  if (!city && !bhk) return null;
  return {
    lookingType: buyRent,
    city: city || "Hyderabad",
    locality,
    propertyType,
    bhkType: bhk,
    purpose,
    page: 1,
  };
}

// --- Furniture & Electronics (dynamic routes: /services/[categorys]/[category-shop]?category=...) ---

const FURNITURE_CATEGORY_MAP: Record<string, string> = {
  sofa: "Sofas",
  sofas: "Sofas",
  "living room": "Living Room",
  living: "Living Room",
  dining: "Dining Tables",
  bed: "Beds",
  beds: "Beds",
  "study & office": "Study & Office",
  office: "Study & Office",
  storage: "Storage",
  "custom furniture": "Custom Furniture",
  table: "Tables",
  tables: "Tables",
  chair: "Chairs",
  chairs: "Chairs",
  "tv unit": "TV Units",
  wardrobe: "Wardrobes",
  "new arrival": "new arrivals",
};

/** Maps user intent to backend electronics category enum values only. */
const ELECTRONICS_CATEGORY_MAP: Record<string, string> = {
  "kitchen appliance": "Kitchen Appliances",
  lighting: "Lighting & Power Solutions",
  cable: "Smart Home & Automation",
  charger: "Smart Home & Automation",
  entertainment: "Entertainment",
  "mobile accessory": "Smart Home & Automation",
  "tablet accessory": "Smart Home & Automation",
  fan: "Climate Control",
  "water heater": "Climate Control",
  "switch gear": "Lighting & Power Solutions",
  relay: "Lighting & Power Solutions",
  "air cooler": "Climate Control",
  meter: "Lighting & Power Solutions",
  "smart home": "Smart Home & Automation",
  automation: "Smart Home & Automation",
  cleaning: "Cleaning & Laundry",
  laundry: "Cleaning & Laundry",
  "new arrival": "",
};

/** Build furniture shop URL: /services/furnitures/furnitures-shop?category=... */
export function buildFurnitureLink(baseUrl: string, category?: string): string {
  const base = baseUrl.replace(/\/$/, "");
  const slug = category
    ? encodeURIComponent(category.trim())
    : "";
  return slug ? `${base}/services/furnitures/furnitures-shop?category=${slug}` : `${base}/services/furnitures`;
}

/** Build electronics shop URL: /services/electronics/electronics-shop?category=... */
export function buildElectronicsLink(baseUrl: string, category?: string): string {
  const base = baseUrl.replace(/\/$/, "");
  const slug = category
    ? encodeURIComponent(category.trim())
    : "";
  return slug ? `${base}/services/electronics/electronics-shop?category=${slug}` : `${base}/services/electronics`;
}

export function parseFurnitureIntent(message: string): { category?: string } | null {
  const lower = message.toLowerCase().trim();
  if (!/\b(furniture|sofa|chair|table|bed|furnish|couch|wardrobe|dining|living room|office|storage)\b/.test(lower))
    return null;
  for (const [key, value] of Object.entries(FURNITURE_CATEGORY_MAP)) {
    if (lower.includes(key)) return { category: value };
  }
  return { category: undefined };
}

export function parseElectronicsIntent(message: string): { category?: string } | null {
  const lower = message.toLowerCase().trim();
  if (!/\b(electronics|appliance|lighting|cable|charger|fan|heater|cooler|meter|relay|switch|entertainment|mobile|tablet)\b/.test(lower))
    return null;
  for (const [key, value] of Object.entries(ELECTRONICS_CATEGORY_MAP)) {
    if (lower.includes(key)) return { category: value };
  }
  return { category: undefined };
}
