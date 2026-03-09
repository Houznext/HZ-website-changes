import { IOnePlaceInHouseServicesprops } from "@/components/Homepage/OnePlaceInHouseServices";
import { ISpecialOffersprops } from "@/components/Homepage/SpecialOffers";

export const newProjects = [
  {
    imageUrl: "/images/newlylaunched/apartment2.png",
    name: "Godrej Madison Avenue",
    location: "Kokapet, Hyderabad",
    cost: "₹2.78 Cr onwards*",
    type: "Apartment",
    rooms: "3, 4 BHK",
    cta: { label: "View Details", href: "" },
  },
  {
    imageUrl: "/images/newlylaunched/apartments3.png",
    name: "The Cascades (Neopolis)",
    location: "Neopolis, Kokapet, Hyderabad",
    cost: "₹3.50 Cr approx*",
    type: "Apartment",
    rooms: "3 BHK",
    cta: { label: "View Details", href: "" },
  },
  {
    imageUrl: "/images/newlylaunched/apartment5.png",
    name: "URBANYARDS SHANGRILA",
    location: "Tukkuguda, Hyderabad",
    cost: "₹88 L - ₹1.06 Cr+*",
    type: "Apartment",
    rooms: "2, 3 BHK",
    cta: { label: "View Details", href: "" },
  },
  {
    imageUrl: "/images/newlylaunched/apartment6.png",
    name: "Risinia The Edge",
    location: "Pragathi Nagar, Hyderabad",
    cost: "₹78.72 L - ₹1.18 Cr*",
    type: "Apartment",
    rooms: "2, 3 BHK",
    cta: { label: "View Details", href: "" },
  },
  {
    imageUrl: "/images/newlylaunched/apartments3.png",
    name: "Goldenkey Meraki",
    location: "Miyapur, Hyderabad",
    cost: "₹72 L - ₹1.05 Cr*",
    type: "Apartment",
    rooms: "2, 3 BHK",
    cta: { label: "View Details", href: "" },
  },
];
export const PopularLocalty = [
    {
        localty: "Gachibowli",
        location: "Financial District",
        range: "50L - 2.5Cr*",
        sqft: "1200 - 3000 SQ.FT",
    },
    {
        localty: "Banjara Hills",
        location: "Central Hyderabad",
        range: "1Cr - 5Cr*",
        sqft: "1500 - 4000 SQ.FT",
    },
    {
        localty: "Jubilee Hills",
        location: "Central Hyderabad",
        range: "2Cr - 7Cr*",
        sqft: "1800 - 5000 SQ.FT",
    },
    {
        localty: "Hitech City",
        location: "Madhapur",
        range: "80L - 3Cr*",
        sqft: "1000 - 3500 SQ.FT",
    },
    {
        localty: "Kondapur",
        location: "Northwest Hyderabad",
        range: "60L - 2Cr*",
        sqft: "1100 - 3200 SQ.FT",
    },
    {
        localty: "Miyapur",
        location: "Northwest Hyderabad",
        range: "40L - 1.5Cr*",
        sqft: "900 - 2800 SQ.FT",
    },
    {
        localty: "Manikonda",
        location: "Southwest Hyderabad",
        range: "50L - 2Cr*",
        sqft: "1200 - 3400 SQ.FT",
    },
    {
        localty: "Kukatpally",
        location: "Northwest Hyderabad",
        range: "50L - 2Cr*",
        sqft: "1100 - 3300 SQ.FT",
    },
];

export const OnePlaceInHouseServicesData: IOnePlaceInHouseServicesprops = {
    heading: "Everything You Need at One Place In-House Services",
    subheading: "Services We Offer",
    listItems: [
        // ===== Phase 1 (LIVE) =====
        { id: 2, image: "/home/oneplaceinhouseservices/constructionforbusiness.png", title: "Construction", href: "services/custom-builder", status: "live", phase: 1 },
        { id: 3, image: "/home/oneplaceinhouseservices/interiors.png", title: "Interiors", href: "/interiors", status: "live", phase: 1 },
        { id: 8, image: "/home/oneplaceinhouseservices/civil.png", title: "Civil Engineering Structural Design", href: "/services/civilEngineering", status: "live", phase: 1 },
        { id: 9, image: "/home/oneplaceinhouseservices/solar.png", title: "Solar", href: "/solar", status: "live", phase: 1 },
        { id: 6, image: "/home/oneplaceinhouseservices/painting.png", title: "Painting", href: "/painting", status: "live", phase: 1 },
        { id: 4, image: "/home/oneplaceinhouseservices/furniture.png", title: "Furniture", href: "/services/furnitures", status: "live", phase: 1 },


        // ===== Phase 2/3 (COMING SOON) =====
        { id: 5, image: "/home/oneplaceinhouseservices/plumber.png", title: "Plumbing", href: "/services/plumbing", status: "coming", phase: 2 },
        { id: 7, image: "/home/oneplaceinhouseservices/vaastuconsultation.png", title: "Vastu Consultation", href: "/services/vaastu-consultation", status: "coming", phase: 2 },
        { id: 10, image: "/home/oneplaceinhouseservices/earthmovers.png", title: "Earth Movers", href: "/services/earthmovers", status: "coming", phase: 2 },
        { id: 11, image: "/home/oneplaceinhouseservices/homeloan.png", title: "Home Loan", href: "/services/loans", status: "coming", phase: 2 },
        { id: 12, image: "/home/oneplaceinhouseservices/legal.png", title: "Legal services", href: "/legalservices", status: "coming", phase: 2 },
        { id: 13, image: "/home/oneplaceinhouseservices/homedecor.png", title: "Home Decor", href: "/services/homedecor", status: "coming", phase: 2 },
        { id: 14, image: "/home/oneplaceinhouseservices/electronics.png", title: "Electronics", href: "/services/electronics", status: "coming", phase: 3 },
        { id: 15, image: "/home/oneplaceinhouseservices/packersandmovers.png", title: "Packers And Movers", href: "/services/packersandmovers", status: "coming", phase: 3 },
    ],
};

export const SpecialOffersData: ISpecialOffersprops = {
    heading: "Special Offers are Available",
    listItems: [
        {
            id: 1,
            image: "/home/specialoffers/moderninterior.png",
            title: "Modern interior with Yellow Chair",
        },
        {
            id: 2,
            image: "/home/specialoffers/roundspace.png",
            title: "Round Space Four Seater Dinning",
        },
        {
            id: 3,
            image: "/home/specialoffers/modularkitchen.png",
            title: "Modular Kitchen Design",
        },
        {
            id: 4,
            image: "/home/specialoffers/moderninterior.png",
            title: "Modern interior with Yellow Chair",
        },
        {
            id: 5,
            image: "/home/specialoffers/roundspace.png",
            title: "Round Space Four Seater Dinning",
        },
        {
            id: 6,
            image: "/home/specialoffers/modularkitchen.png",
            title: "Modular Kitchen Design",
        },
    ],
};

export const cityOptions = [
    {
        label: "Hyderabad",
        value: "hyderabad",
    },
    {
        label: "Bengaluru",
        value: "bengaluru",
    },
    {
        label: "Mumbai",
        value: "mumbai",
    },
    {
        label: "Pune",
        value: "pune",
    },
];
export enum Category {
    NewArrivals = 'New Arrivals',
    Sofas = 'Sofas',
    LivingRoom = 'Living room',
    DiningTables = 'Dining Tables',
    Beds = 'Beds',
    StudyAndOffice = 'Study & Office',
    Storage = 'Storage',
    CustomFurniture = 'Custom Furniture',
    Tables = 'Tables',
    Chairs = 'Chairs',
    TVUnits = 'TV Units',
    Wardrobes = 'Wardrobes',
}

export enum SofaSubCategory {
    Recliner = 'Recliner',
    Sectional = 'Sectional',
    LShaped = 'L-Shaped',
    SofaBed = 'Sofa Bed',
}

export enum BedSubCategory {
    Platform = 'Platform',
    Storage = 'Storage',
    Bunk = 'Bunk',
    Hydraulic = 'Hydraulic',
}

export enum ChairSubCategory {
    Office = 'Office Chair',
    Dining = 'Dining Chair',
    Lounge = 'Lounge Chair',
    Accent = 'Accent Chair',
}

export enum TableSubCategory {
    Coffee = 'Coffee Table',
    Side = 'Side Table',
    Center = 'Center Table',
    Console = 'Console Table',
}

export enum WardrobeSubCategory {
    TwoDoor = '2 Door',
    ThreeDoor = '3 Door',
    Sliding = 'Sliding',
}

export enum StudyRoomSubCategory {
    StudyTable = 'Study Table',
    StudySet = 'Study Set',
}

export enum DiningTableSubCategory {
    FourSeater = '4 Seater',
    SixSeater = '6 Seater',
    EightSeater = '8 Seater',
}

export type AnySubCategory =
    | SofaSubCategory
    | BedSubCategory
    | ChairSubCategory
    | TableSubCategory
    | WardrobeSubCategory
    | StudyRoomSubCategory
    | DiningTableSubCategory;
