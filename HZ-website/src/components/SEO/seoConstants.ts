// seoConstants.ts

// Base constants
export const BASE_DEPLOYMENT_URL = "https://www.houznext.com";
export const PROJECT_NAME = "Houznext Real Estate";
export const PRIMARY_IMAGE_URL = `${BASE_DEPLOYMENT_URL}/images/logobb.png`;
export const PRIMARY_PHONE = "+918897574909";

// Corporate contact information (shared across all pages)
export const CORPORATE_CONTACTS = [
  {
    telephone: PRIMARY_PHONE,
    contactType: "customer service" as const,
    areaServed: "IN",
    availableLanguage: ["en", "hi"],
  },
  {
    telephone: PRIMARY_PHONE,
    contactType: "sales" as const,
    areaServed: "IN",
    availableLanguage: ["en", "hi"],
  },
  {
    telephone: PRIMARY_PHONE,
    contactType: "technical support" as const,
    areaServed: "IN",
    availableLanguage: ["en", "hi"],
  },
];

// Social profiles (shared across all pages)
export const SOCIAL_PROFILES = [
  "https://www.facebook.com/houznext",
  "https://twitter.com/houznext",
  "https://www.instagram.com/houznext/",
  "https://www.linkedin.com/company/houznext/",
];

export const DEFAULT_ADDRESS = {
  streetAddress: "New Green City, Madhapur, Hyderabad",
  addressLocality: "Hyderabad",
  addressRegion: "Telangana",
  postalCode: "500030",
  addressCountry: "IN",
};

// Default opening hours
export const DEFAULT_OPENING_HOURS = "Mo-Su 09:00-18:00";

// ---------------------------------------------------------------------------
// Mega keyword index — structured by service vertical.
// Google ignores <meta keywords> but Bing/Yandex still index them, and they
// double as a living audit of every search phrase Houznext should rank for.
// ---------------------------------------------------------------------------

const _BRAND = [
  "Houznext", "houznext", "Houz next", "houznext.com", "www.houznext.com",
  "Houznext India", "Houznext real estate", "Houznext interiors",
  "Houznext solar", "Houznext construction", "Houznext furniture",
  "one stop home solution India", "all in one home services India",
  "Houznext app", "Houznext reviews", "Houznext contact",
];

const _REAL_ESTATE = [
  // Actions × property types
  "buy property India", "sell property India", "rent property India",
  "buy flat", "buy apartment", "buy villa", "buy plot", "buy land",
  "buy independent house", "buy duplex house", "buy penthouse",
  "buy farmhouse", "buy row house", "buy studio apartment",
  "rent apartment", "rent flat", "rent house", "rent villa",
  "rent office space", "rent shop", "rent warehouse",
  "lease commercial property", "rent co-working space",
  // Sharing / PG
  "flatshare India", "PG accommodation", "shared apartment",
  "paying guest near me", "coliving spaces India",
  "boys PG", "girls PG", "co-living for students",
  // Property categories
  "residential property", "commercial property",
  "affordable housing India", "luxury apartments India",
  "premium villas India", "budget flats India",
  "gated community villas", "gated community apartments",
  "township projects India", "integrated township",
  // Transaction types
  "new launch projects", "pre launch projects",
  "resale property", "resale flats", "resale apartments",
  "under construction flats", "ready to move flats",
  "RERA approved projects", "RERA registered property",
  "builder floor", "society flats",
  // Plot / land
  "residential plot", "commercial plot", "agricultural land",
  "HMDA approved plots", "DTCP approved plots",
  "NA plots", "farmland for sale",
  "plot for sale near me", "land for sale India",
  // Investment
  "real estate investment India", "property investment",
  "best property to invest", "rental yield India",
  "NRI property investment", "NRI buy property India",
  "capital appreciation real estate",
  // Pricing & comparison
  "property rates India", "flat price per sqft",
  "house price India", "property valuation",
  "cheapest flats India", "affordable apartments",
  "property price comparison", "EMI calculator property",
  // General
  "property listings India", "real estate platform India",
  "property dealer", "real estate agent near me",
  "property consultant India", "real estate broker",
  "property for sale", "property for rent", "house for sale India",
  "best real estate website India", "online property search",
  "property search India", "property portal India",
  "real estate marketplace India",
];

const _INTERIORS = [
  // General
  "interior design India", "home interiors", "house interior design",
  "best interior designer India", "interior design company India",
  "interior designer near me", "affordable interior design",
  "luxury interior design", "budget interior design",
  "interior design cost", "interior design quotation",
  "interior design packages", "interior design estimate",
  // BHK packages
  "1BHK interior package", "2BHK interior package", "3BHK interior package",
  "4BHK interior package", "1BHK interior design cost",
  "2BHK interior design cost", "3BHK interior design cost",
  "full home interiors", "complete home interior",
  "end to end interior design", "turnkey interior solutions",
  // Room-wise
  "modular kitchen design", "modular kitchen price",
  "L shaped kitchen design", "U shaped kitchen design",
  "parallel kitchen design", "kitchen cabinet design",
  "wardrobe design", "sliding wardrobe", "walk in closet design",
  "living room interior", "living room design ideas",
  "bedroom interior design", "master bedroom design",
  "kids room interior", "children bedroom design",
  "bathroom interior design", "bathroom renovation",
  "study room interior", "home office design",
  "pooja room design", "mandir design for home",
  "balcony interior design", "balcony garden ideas",
  "dining room interior", "dining area design",
  "guest room interior",
  // Elements
  "false ceiling design", "POP ceiling design",
  "gypsum ceiling design", "wooden ceiling design",
  "TV unit design", "TV wall panel design",
  "shoe rack design", "crockery unit design",
  "dressing table design", "vanity mirror design",
  "partition design", "foyer design",
  "wall paneling", "wall texture design",
  "accent wall ideas", "wallpaper for home",
  // Styles
  "modern interior design", "contemporary interior",
  "minimalist interior", "Scandinavian interior",
  "industrial interior design", "bohemian interior",
  "traditional Indian interior", "classic interior design",
  "luxury interior", "smart home interior",
  // Materials
  "laminate finish interior", "acrylic finish kitchen",
  "PVC finish wardrobe", "veneer finish furniture",
  "lacquer finish", "membrane finish",
  // Renovation
  "home renovation", "flat renovation", "apartment renovation",
  "kitchen renovation", "bathroom renovation cost",
  "old house renovation", "home makeover India",
];

const _CONSTRUCTION = [
  "custom home construction India", "house construction India",
  "villa construction", "duplex house construction",
  "independent house construction", "bungalow construction",
  "farmhouse construction", "row house construction",
  "multi storey building construction",
  "commercial building construction",
  // Cost & planning
  "house construction cost", "construction cost per sqft",
  "house construction cost calculator",
  "construction cost estimate India",
  "house plan India", "floor plan design",
  "architectural design services",
  "structural design services",
  "house elevation design", "front elevation design",
  "3D house design", "2D floor plan",
  // Builder
  "custom builder", "house builder India",
  "residential construction company",
  "construction company India",
  "building contractor near me",
  "civil contractor India",
  "best construction company India",
  "trusted builder India",
  // Process
  "build your dream home", "home construction tracker",
  "construction project management",
  "construction progress tracking",
  "construction timeline tracker",
  "turnkey construction",
  "design and build services",
  // Materials
  "construction materials India",
  "TMT steel bars", "UltraTech cement",
  "AAC blocks", "red bricks construction",
  "RCC construction", "steel frame construction",
  // Approvals
  "building plan approval",
  "GHMC building permission",
  "HMDA layout approval",
  "DTCP approval",
  "building permission process India",
  "occupancy certificate", "completion certificate",
];

const _SOLAR = [
  // Installation
  "solar panel installation India", "solar panel installation near me",
  "rooftop solar installation", "solar panel for home",
  "solar panel for office", "commercial solar installation",
  "industrial solar installation",
  "residential solar panel", "solar EPC company India",
  // Products
  "monocrystalline solar panel", "polycrystalline solar panel",
  "bifacial solar panel", "solar inverter",
  "solar battery storage", "lithium solar battery",
  "on grid solar system", "off grid solar system",
  "hybrid solar system", "solar water heater",
  "solar street light", "solar garden light",
  // Cost & savings
  "solar panel cost India", "solar panel price per watt",
  "solar installation cost", "solar ROI calculator",
  "solar calculator", "solar panel EMI",
  "save electricity bill solar", "reduce electricity bill",
  "solar savings calculator",
  "solar panel payback period",
  // Government
  "solar subsidy India", "PM Surya Ghar scheme",
  "solar subsidy 2024 2025", "MNRE solar subsidy",
  "state solar subsidy", "net metering India",
  "solar net metering process",
  // Capacity
  "1kW solar system price", "2kW solar system",
  "3kW solar system", "5kW solar system",
  "10kW solar system", "solar system for 1BHK",
  "solar system for 2BHK", "solar system for 3BHK",
  // General
  "solar energy solutions", "solar power system",
  "green energy India", "renewable energy India",
  "clean energy solutions", "solar maintenance",
  "solar panel cleaning", "solar AMC",
  "best solar company India",
];

const _FURNITURE_DECOR = [
  // Furniture types
  "buy furniture online India", "furniture store online",
  "affordable furniture India", "premium furniture India",
  "custom furniture India", "designer furniture",
  // Living room
  "sofa set online", "L shaped sofa", "recliner sofa",
  "sectional sofa", "fabric sofa", "leather sofa",
  "center table", "coffee table", "side table",
  "TV unit", "entertainment unit", "bookshelf",
  "shoe rack", "wall shelf",
  // Bedroom
  "bed online", "king size bed", "queen size bed",
  "single bed", "double bed", "storage bed",
  "hydraulic bed", "bunk bed", "mattress online",
  "bedside table", "chest of drawers",
  // Dining
  "dining table", "dining table set", "4 seater dining table",
  "6 seater dining table", "8 seater dining table",
  "marble dining table", "wooden dining table",
  "dining chairs", "bar stool", "bar counter",
  // Storage
  "wardrobe online", "almirah", "cupboard",
  "kitchen cabinet", "storage unit",
  "filing cabinet", "modular storage",
  // Office
  "office furniture", "office desk", "office chair",
  "ergonomic chair", "computer table",
  "conference table", "reception desk",
  // Home decor
  "home decor India", "home decor online",
  "wall art", "wall clock", "mirror decor",
  "photo frames", "artificial plants",
  "candle holders", "vases online",
  "cushion covers", "curtains online",
  "rugs and carpets", "door mat",
  "showpieces", "figurines",
  "table lamp", "floor lamp", "pendant light",
  "chandelier", "fairy lights",
  "home fragrance", "diffuser", "scented candles",
  // Materials
  "solid wood furniture", "sheesham wood furniture",
  "teak wood furniture", "engineered wood furniture",
  "metal furniture", "wrought iron furniture",
  "rattan furniture", "bamboo furniture",
  // Style
  "modern furniture India", "contemporary furniture",
  "vintage furniture", "industrial style furniture",
  "Scandinavian furniture", "boho decor",
  "traditional Indian furniture",
];

const _ELECTRONICS = [
  "home electronics India", "electronics store online",
  "home appliances online", "kitchen appliances India",
  "smart home devices", "smart home automation",
  "smart lights", "smart plugs", "smart lock",
  "smart thermostat", "smart speaker",
  "home security camera", "video doorbell",
  "robot vacuum cleaner",
  "air purifier India", "water purifier online",
  "washing machine online", "refrigerator online",
  "microwave oven", "air conditioner online",
  "LED TV online", "smart TV India",
  "soundbar", "home theatre system",
  "ceiling fan", "exhaust fan",
  "geyser online", "water heater",
  "iron", "mixer grinder", "induction cooktop",
  "chimney online", "kitchen chimney",
  "dishwasher India", "OTG oven",
  "best electronics deals India",
  "electronics offers online",
];

const _PAINTING = [
  "house painting services", "house painting cost",
  "wall painting services", "wall painting cost calculator",
  "interior painting", "exterior painting",
  "texture painting", "stencil painting",
  "waterproof painting", "anti fungal painting",
  "paint cost estimator", "painting rate per sqft",
  "Asian Paints", "Berger Paints", "Nerolac Paints",
  "house painter near me", "professional painters India",
  "ceiling painting", "wood polish",
  "PU polish", "melamine polish",
  "epoxy flooring", "wall putty",
  "primer coat", "paint colour ideas",
  "room colour combination", "living room paint ideas",
  "bedroom colour ideas", "exterior colour combination",
];

const _LEGAL = [
  "property legal services", "property lawyer India",
  "property legal verification", "title verification",
  "title search report", "encumbrance certificate",
  "property registration", "property registration process",
  "property registration charges", "stamp duty India",
  "sale deed drafting", "sale agreement",
  "property mutation", "khata transfer",
  "RERA complaint", "RERA lawyer",
  "property dispute resolution", "property litigation",
  "land title clearance", "due diligence property",
  "property documentation", "legal opinion property",
  "power of attorney property", "gift deed",
  "will registration", "succession certificate",
  "property tax India", "capital gains tax property",
  "NRI property legal help",
];

const _HOME_LOANS = [
  "home loan India", "home loan EMI calculator",
  "home loan interest rate", "cheapest home loan",
  "home loan eligibility", "home loan pre approval",
  "home loan balance transfer", "home loan top up",
  "SBI home loan", "HDFC home loan", "ICICI home loan",
  "LIC home loan", "Bank of Baroda home loan",
  "home loan for self employed",
  "home loan for NRI",
  "plot loan India", "construction loan",
  "home improvement loan",
  "home loan subsidy", "PMAY subsidy",
  "Pradhan Mantri Awas Yojana",
  "first time home buyer India",
];

const _PLUMBING = [
  "plumbing services India", "plumber near me",
  "plumbing repair", "plumbing installation",
  "bathroom plumbing", "kitchen plumbing",
  "pipe fitting", "water tank installation",
  "water leakage repair", "drainage cleaning",
  "toilet installation", "geyser installation",
  "water purifier installation",
  "plumbing contractor India",
  "24 hour plumber", "emergency plumbing",
  "plumbing cost India",
];

const _VASTU_MISC = [
  "Vaastu consultation", "Vaastu for home",
  "Vaastu tips for house", "Vaastu Shastra consultant",
  "Vaastu for flat", "Vaastu for plot",
  "Vaastu for office", "Vaastu for kitchen",
  "Vaastu for bedroom", "Vaastu for pooja room",
  "Feng Shui India", "home Vaastu correction",
  "packers and movers India", "packers and movers near me",
  "relocation services India",
  "home shifting services",
  "home cleaning services", "deep cleaning home",
  "pest control services", "termite treatment",
  "home sanitization", "AC service and repair",
  "appliance repair near me",
  "carpenter near me", "carpentry services",
  "electrician near me", "electrical repair",
  "home improvement services",
];

// ---------------------------------------------------------------------------
// Cities — major metros, tier-2, and key localities
// ---------------------------------------------------------------------------
const _CITIES = [
  "Hyderabad", "Bangalore", "Mumbai", "Pune", "Chennai",
  "Delhi NCR", "Noida", "Gurgaon", "Ghaziabad", "Faridabad",
  "Kolkata", "Ahmedabad", "Jaipur", "Lucknow",
  "Kochi", "Chandigarh", "Indore", "Bhopal",
  "Coimbatore", "Vizag", "Mysore", "Nagpur",
  "Thiruvananthapuram", "Surat", "Vadodara",
  "Mangalore", "Nashik", "Aurangabad",
];

// Key Hyderabad localities (HQ city — hyper-local SEO)
const _HYD_LOCALITIES = [
  "Gachibowli", "Madhapur", "Kondapur", "Kukatpally",
  "Banjara Hills", "Jubilee Hills", "Manikonda",
  "Narsingi", "Kokapet", "Financial District",
  "Miyapur", "Bachupally", "Nizampet", "Kompally",
  "Shamshabad", "Attapur", "Tolichowki",
  "Begumpet", "Secunderabad", "ECIL",
  "Uppal", "LB Nagar", "Dilsukhnagar",
  "Sainikpuri", "AS Rao Nagar", "Habsiguda",
  "Nacharam", "Tarnaka", "Ameerpet",
  "Beeramguda", "Patancheru", "Tellapur",
  "Adibatla", "Ghatkesar", "Medchal",
];

// City × high-intent service combinations
const _CITY_KEYWORDS = _CITIES.flatMap((city) => [
  `buy property in ${city}`,
  `rent flat in ${city}`,
  `buy apartment in ${city}`,
  `buy villa in ${city}`,
  `buy plot in ${city}`,
  `PG in ${city}`,
  `flatshare in ${city}`,
  `property for sale in ${city}`,
  `interior designer in ${city}`,
  `home interiors in ${city}`,
  `modular kitchen ${city}`,
  `house construction in ${city}`,
  `construction company ${city}`,
  `solar installation ${city}`,
  `solar panel ${city}`,
  `house painting ${city}`,
  `plumber in ${city}`,
  `buy furniture in ${city}`,
  `home decor ${city}`,
  `property lawyer ${city}`,
  `home loan ${city}`,
  `real estate agent ${city}`,
  `best interior designer ${city}`,
  `affordable flats in ${city}`,
  `luxury apartments in ${city}`,
  `new projects in ${city}`,
]);

// Hyderabad locality-level keywords (most valuable for HQ city)
const _HYD_LOCAL_KEYWORDS = _HYD_LOCALITIES.flatMap((loc) => [
  `flats in ${loc}`,
  `apartments in ${loc}`,
  `buy flat in ${loc}`,
  `rent flat in ${loc}`,
  `plots in ${loc}`,
  `villas in ${loc}`,
  `property in ${loc}`,
  `interior designer ${loc}`,
]);

// "Near me" / intent-based keywords
const _INTENT_KEYWORDS = [
  "property near me", "flats near me", "apartments near me",
  "plots near me", "villas near me", "PG near me",
  "interior designer near me", "construction company near me",
  "solar installation near me", "painter near me",
  "plumber near me", "electrician near me",
  "carpenter near me", "home services near me",
  "furniture store near me",
  "best property website", "top real estate site India",
  "best interior design company India",
  "top construction company India",
  "best solar company India",
  "cheapest home interior India",
  "affordable home construction India",
  "low cost house construction India",
  "how to buy property in India",
  "how to sell property in India",
  "property buying guide India",
  "first time home buyer tips",
  "home interior ideas", "home design ideas",
  "small house design ideas", "modern house design India",
  "latest kitchen design", "trending interior design",
  "home tour India", "before after home renovation",
  "property reviews India", "builder reviews India",
  "compare property prices India",
];

export const DEFAULT_KEYWORDS = [
  ..._BRAND,
  ..._REAL_ESTATE,
  ..._INTERIORS,
  ..._CONSTRUCTION,
  ..._SOLAR,
  ..._FURNITURE_DECOR,
  ..._ELECTRONICS,
  ..._PAINTING,
  ..._LEGAL,
  ..._HOME_LOANS,
  ..._PLUMBING,
  ..._VASTU_MISC,
  ..._INTENT_KEYWORDS,
  ..._CITY_KEYWORDS,
  ..._HYD_LOCAL_KEYWORDS,
].join(", ");
