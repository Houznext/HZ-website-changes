import { Apartment, Store, MapOutlined, Business, LocalLaundryService, Weekend, Microwave, Water, GasMeter, Tv, KingBed, Countertops, NaturePeopleOutlined, House, CameraAlt, FitnessCenter, Yard, Pool, LocalBar,ElectricalServices, SoupKitchen ,ChildCare, MeetingRoom, LocalParking,} from '@mui/icons-material';
import {
    Security,
    BatteryChargingFull,
    Chair,
   
    AcUnit,
    Router,
    Wifi,
    LocalFireDepartment,
    FireExtinguisher,
    SmokeFree,
    SecurityOutlined,
    WaterDrop,
    CheckCircleOutline,
    Restaurant,
    Dining,
    AssignmentInd,
    Kitchen,
    AssignmentTurnedIn,
    LocalPolice,Power,
} from '@mui/icons-material';
import { Fan,
  PanelsTopLeft,} from "lucide-react"
import WbShadeOutlinedIcon from '@mui/icons-material/WbShadeOutlined';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import HolidayVillageOutlinedIcon from '@mui/icons-material/HolidayVillageOutlined';

export interface FurnishingItem {
    name: string;
    icon: JSX.Element;
}

export enum OwnerType {
    owner = "Owner",
    agent = "Agent",
    builder = "Builder"
}

export type CommercialRentPropertyType =
    | "Office"
    | "Plot"
    | "Retail Shop"
    | "Show Room";

export enum propertyTypeEnum {
    Apartment = "Apartment",
    IndependentFloor = "Independent Floor",
    IndependentHouse = "Independent House",
    Villa = "Villa",
    Plot = "Plot",
    AgriculturalLand = "Agricultural Land"
}


export type FacingType =
    | "North"
    | "South"
    | "East"
    | "West"
    | "NorthEast"
    | "NorthWest"
    | "SouthEast"
    | "SouthWest";

export const facingTypes: FacingType[] = [
    "North",
    "South",
    "East",
    "West",
    "NorthEast",
    "SouthEast",
    "SouthWest",
    "NorthWest",
];

export type LocationHubType =
    | "IT Park"
    | "Business Park"
    | "Others";

export type PropertyConditionType =
    | "Ready to use"
    | "Bare shell";

export type PosessionType =
    | "Ready To Move"
    | "Under Construction"
    | "New Launch";

export enum PlotAgriculturePosessionTypeEnum {
    Immediate = "Immediate",
    InFuture = "Future"
}

export type PlotAgriculturePosessionType =
    | PlotAgriculturePosessionTypeEnum.Immediate
    | PlotAgriculturePosessionTypeEnum.InFuture

export enum TransactionTypeEnum {
    Resale = "Resale",
    NewBooking = "New Booking"
}

export type TransactionType =
    | TransactionTypeEnum.Resale
    | TransactionTypeEnum.NewBooking

export type AgeOfPropertyOptions = "0-1 years" | "1-5 years" | "5-10 years" | "10+ years";

export type OwnerCommercialType =
    | "Freehold"
    | "Leasehold"
    | "JointTenancy"
    | "Cooperative society"
    | "Partnership"



export const CommercialRentPropertyOptions = [
    { name: "Office", icon: <Business /> },
    { name: "Plot", icon: <MapOutlined /> },
    { name: "Retail Shop", icon: <Store /> },
    { name: "Show Room", icon: <Apartment /> }
] as { name: CommercialRentPropertyType; icon: JSX.Element }[];


export const rentPropertyType: { name: string; icon: JSX.Element }[] = [
    { name: propertyTypeEnum.Apartment, icon: <Apartment /> },
    { name: propertyTypeEnum.IndependentFloor, icon: <WbShadeOutlinedIcon /> },
    { name: propertyTypeEnum.IndependentHouse, icon: <MapsHomeWorkIcon /> },
    { name: propertyTypeEnum.Villa, icon: <HolidayVillageOutlinedIcon /> }
];

export const sellPropertyType = [
    { name: propertyTypeEnum.Apartment, icon: <Apartment /> },
    { name: propertyTypeEnum.IndependentFloor, icon: <WbShadeOutlinedIcon /> },
    { name: propertyTypeEnum.IndependentHouse, icon: <MapsHomeWorkIcon /> },
    { name: propertyTypeEnum.Villa, icon: <HolidayVillageOutlinedIcon /> },
    { name: propertyTypeEnum.Plot, icon: <MapOutlined /> },
    { name: propertyTypeEnum.AgriculturalLand, icon: <NaturePeopleOutlined /> }
];

export const furnitureTypes = [
    { name: "Fully Furnished", icon: <KingBed /> },
    { name: "Semi Furnished", icon: <Chair /> },
    { name: "Unfurnished", icon: <Weekend /> }
];

export const enum ConstructionStatusEnum {
    UnderConstruction = "Under Construction",
    ReadyToMove = "Ready to Move",
    NewLaunched = "Newly Launched"
}

export const ConstructionStatusOptions: ConstructionStatusEnum[] = [
    ConstructionStatusEnum.UnderConstruction,
    ConstructionStatusEnum.ReadyToMove,
    ConstructionStatusEnum.NewLaunched
];

export const PlotAgriculturePossessionStatus: PlotAgriculturePosessionType[] = [
    PlotAgriculturePosessionTypeEnum.Immediate, PlotAgriculturePosessionTypeEnum.InFuture
]

export const transactionTypes: TransactionType[] = [TransactionTypeEnum.NewBooking, TransactionTypeEnum.Resale];

export const flatFurnishings: FurnishingItem[] = [
    { name: 'Dining Table', icon: <Dining /> },
    { name: 'Washing Machine', icon: <LocalLaundryService /> },
    { name: 'Sofa', icon: <Weekend /> },
    { name: 'Microwave', icon: <Microwave /> },
    { name: 'Stove', icon: <Kitchen /> },
    { name: 'Fridge', icon: <Kitchen /> },
    { name: 'Water Purifier', icon: <Water /> },
    { name: 'Gas Pipeline', icon: <GasMeter /> },
    { name: 'AC', icon: <AcUnit /> },
    { name: 'TV', icon: <Tv /> },
    { name: 'Cupboard', icon: <KingBed /> },
    { name: 'Geyser', icon: <Countertops /> },

    // NEW ADDITIONS
    { name: 'Bed', icon: <KingBed /> },
    { name: 'Mattress', icon: <Weekend /> },
    { name: 'Curtains', icon: <PanelsTopLeft /> },
    { name: 'Chairs', icon: <Chair /> },
    { name: 'Ceiling Fan', icon: <Fan /> },
    { name: 'Inverter/UPS', icon: <ElectricalServices /> },
    { name: 'Kitchen Chimney', icon: <SoupKitchen /> },
];


export const societyAmenities: FurnishingItem[] = [
    { name: 'Lift', icon: <House /> },
    { name: 'CCTV', icon: <CameraAlt /> },
    { name: 'Gym', icon: <FitnessCenter /> },
    { name: 'Garden', icon: <Yard /> },
    { name: 'Swimming Pool', icon: <Pool /> },
    { name: 'Intercom', icon: <House /> },
    { name: 'Club House', icon: <LocalBar /> },

    // NEW ADDITIONS
    { name: 'Power Backup', icon: <Power /> },
    { name: 'Children Play Area', icon: <ChildCare /> },
    { name: 'Community Hall', icon: <MeetingRoom /> },
    { name: 'Security', icon: <Security /> },
    { name: 'Parking', icon: <LocalParking /> },
    { name: 'Rainwater Harvesting', icon: <WaterDrop /> },
    { name: 'Fire Safety', icon: <LocalFireDepartment /> },
];

export const negotiable: string[] = ["Yes", "No"];

// export const possessionStatus: PosessionType[] = ["Immediate", "In Future", "New Launch"];

export const posessionOptions = [
    { id: 1, year: 'Within 3 Months' },
    { id: 2, year: 'Within 6 Months' },
    { id: 3, year: 'By 2025' },
    { id: 4, year: 'By 2026' },
    { id: 5, year: 'By 2027' },
    { id: 6, year: 'By 2028' }
]



export const AgeOfProperty: AgeOfPropertyOptions[] = [
    "0-1 years",
    "1-5 years",
    "5-10 years",
    "10+ years",
];

export const enum BHK {
    RK = "1RK",
    BHK = "1BHK",
    BHK2 = "2BHK",
    BHK3 = "3BHK",
    BHK4 = "4BHK",
    BHK5 = "5BHK"
}

export const bhkArray: string[] = [BHK.RK, BHK.BHK, BHK.BHK2, BHK.BHK3, BHK.BHK4, BHK.BHK5];

export const securityDeposit: string[] = ["None", "1 month", "2 months", "3 months"];




export const locationHubOptions: LocationHubType[] = [
    "IT Park",
    "Business Park",
    "Others"
];

export const propertyConditionOptions: PropertyConditionType[] = [
    "Ready to use",
    "Bare shell"
];




export const amenities: FurnishingItem[] = [
    { name: 'CCTV', icon: <Security /> },
    { name: 'Power Backup', icon: <BatteryChargingFull /> },
    { name: 'Furnishing', icon: <Chair /> },
    { name: 'UPS', icon: <Power /> },
    { name: 'Central Air Conditioning', icon: <AcUnit /> },
    { name: 'Oxygen Duct', icon: <Router /> },
    { name: 'Internet Connectivity', icon: <Wifi /> },
    { name: 'Vastu Compliant', icon: <CheckCircleOutline /> },
    { name: 'Fire Extinguishers', icon: <FireExtinguisher /> },
    { name: 'Fire Sensors', icon: <SmokeFree /> },
    { name: 'Security Personnel', icon: <SecurityOutlined /> },
    { name: 'Water Storage', icon: <WaterDrop /> },
    { name: 'DG Availability', icon: <CheckCircleOutline /> },
    { name: 'Cafeteria', icon: <Restaurant /> },
    { name: 'Reception Area', icon: <AssignmentInd /> },
    { name: 'Pantry', icon: <Kitchen /> },
    { name: 'Fire NOC Certified', icon: <AssignmentTurnedIn /> },
    { name: 'Occupancy Certificate', icon: <LocalPolice /> }
];

export enum ZoneTypeEnum {
    INDUSTRIAL = 'Industrial',
    COMMERCIAL = 'Commercial',
    RESIDENTIAL = 'Residential',
    SPECIAL_ECONOMIC_ZONE = 'Special Economic Zone',
    OPEN_SPACES = 'Open Spaces',
    AGRICULTURAL_ZONE = 'Agricultural Zone',
}

export const ZoneType: ZoneTypeEnum[] = [
    ZoneTypeEnum.AGRICULTURAL_ZONE,
    ZoneTypeEnum.COMMERCIAL,
    ZoneTypeEnum.INDUSTRIAL,
    ZoneTypeEnum.OPEN_SPACES,
    ZoneTypeEnum.RESIDENTIAL,
    ZoneTypeEnum.SPECIAL_ECONOMIC_ZONE
]


export enum OwnershipTypeEnum {
    FREEHOLD = 'Freehold',
    LEASEHOLD = 'Leasehold',
    JOINT_TENANCY = 'Joint Tenancy',
    COOPERATIVE_SOCIETY = 'Cooperative Society',
    PARTNERSHIP = 'Partnership',
}

export const OwnershipType: OwnershipTypeEnum[] = [
    OwnershipTypeEnum.COOPERATIVE_SOCIETY,
    OwnershipTypeEnum.FREEHOLD,
    OwnershipTypeEnum.JOINT_TENANCY,
    OwnershipTypeEnum.LEASEHOLD,
    OwnershipTypeEnum.PARTNERSHIP
]

export enum CommercialPlotOwnerShipTypeEnum {
    Freehold = "Freehold",
    Leasehold = "Leasehold",
    Cooperative = "Cooperative",
    Power_of_attorney = "Power of attorney"
}

export const CommercialPlotOwnerShipTypeOptions: CommercialPlotOwnerShipTypeEnum[] = [
    CommercialPlotOwnerShipTypeEnum.Cooperative,
    CommercialPlotOwnerShipTypeEnum.Freehold,
    CommercialPlotOwnerShipTypeEnum.Leasehold,
    CommercialPlotOwnerShipTypeEnum.Power_of_attorney
]

export enum OfficeLocationHubEnum {
    IT_PARK = 'IT Park',
    BUSINESS_PARK = 'Business Park',
    OTHERS = 'Others',
}

export const OfficeLocationHub: OfficeLocationHubEnum[] = [
    OfficeLocationHubEnum.BUSINESS_PARK,
    OfficeLocationHubEnum.IT_PARK,
    OfficeLocationHubEnum.OTHERS
]

export enum OtherLocationHubEnum {
    Commercial = "Commercial",
    Residential = "Residential",
    Retail = "Retail",
    Market = "Market"
}

export const OtherLocationHub: OtherLocationHubEnum[] = [
    OtherLocationHubEnum.Commercial,
    OtherLocationHubEnum.Residential,
    OtherLocationHubEnum.Market,
    OtherLocationHubEnum.Retail,
]

export enum CommercialPropertyTypeEnum {
    OFFICE = 'Office',
    RETAIL_SHOP = 'Retail Shop',
    SHOW_ROOM = 'Show Room',
    PLOT = 'Plot',
}

export const CommercialPropertyType = [
    { name: "Office", icon: <Business /> },
    { name: "Plot", icon: <MapOutlined /> },
    { name: "Retail Shop", icon: <Store /> },
    { name: "Show Room", icon: <Apartment /> }
] as { name: CommercialPropertyTypeEnum; icon: JSX.Element }[];



export enum SuitableForOfficePlotEnum {
    Industrial = "Industrial",
    Commercial = "Commercial",
    Residential = "Residential",
    Special_economic_zone = "Special economic zone",
    Open_spaces = "Open Spaces",
    Agricultural_zone = "Agricultural Zone"
}

export const SuitableForOfficePlotOptions = Object.entries(SuitableForOfficePlotEnum).map(([key, value]) => ({
    label: value.replace(/_/g, " "), // Replace underscores with spaces for better readability
    value: value,
}));

export enum SuitableForShowRoomAndShopEnum {
    Jewellery = "Jewellery",
    Gym = "Gym",
    Grocery = "Grocery",
    Clinic = "Clinic",
    Footwear = "Footwear",
    Electronics = "Electronics",
    Clothing = "Clothing",
}

export const SuitableForShowRoomAndShopOptions = Object.entries(SuitableForShowRoomAndShopEnum).map(([key, value]) => ({
    label: value.replace(/_/g, " "),
    value: value,
}));


export enum LookingType {
    Rent = "Rent",
    Sell = "Sell",
    FlatShare = "Flat Share"
}
export enum LookingTypeEnum {
    Rent = "Rent",
    Sell = "Sell",
}

export enum FurnitureType {
    FURNISHED = 'Furnished',
    SEMI_FURNISHED = 'Semi-Furnished',
    UNFURNISHED = 'Unfurnished',
}

export enum AmenitiesType {
    CCTV = 'CCTV',
    POWER_BACKUP = 'Power Backup',
    FURNISHING = 'Furnishing',
    UPS = 'UPS',
    CENTRAL_AIR_CONDITIONING = 'Central Air Conditioning',
    OXYGEN_DUCT = 'Oxygen Duct',
    INTERNET_CONNECTIVITY = 'Internet Connectivity',
    VASTU_COMPLIANT = 'Vastu Compliant',
    FIRE_EXTINGUISHERS = 'Fire Extinguishers',
    FIRE_SENSORS = 'Fire Sensors',
    SECURITY_PERSONNEL = 'Security Personnel',
    WATER_STORAGE = 'Water Storage',
    DG_AVAILABILITY = 'DG Availability',
    CAFETERIA = 'Cafeteria',
    RECEPTION_AREA = 'Reception Area',
    PANTRY = 'Pantry',
    FIRE_NOC_CERTIFIED = 'Fire NOC Certified',
    OCCUPANCY_CERTIFICATE = 'Occupancy Certificate',
}

export enum FlatFurnishingsEnum {
    DINING_TABLE = 'Dining Table',
    WASHING_MACHINE = 'Washing Machine',
    SOFA = 'Sofa',
    MICROWAVE = 'Microwave',
    STOVE = 'Stove',
    FRIDGE = 'Fridge',
    WATER_PURIFIER = 'Water Purifier',
    GAS_PIPELINE = 'Gas Pipeline',
    AC = 'AC',
    TV = 'TV',
    CUPBOARD = 'Cupboard',
    GEYSER = 'Geyser',
}


export enum PurposeType {
    Residential = "Residential",
    Commercial = "Commercial"
}

export interface FurnishingItem {
    name: string;
    icon: JSX.Element;
}

export type ZoneType =
    "Industrial"
    | "Commercial"
    | "Residential"
    | "Agriculture"
    | "Special economic zone"
    | "Open Spaces"
    | "Agricultural zone"
    | "Others"

export const zoneStatus: ZoneType[] = [
    "Industrial",
    "Commercial",
    "Residential",
    "Agriculture",
    "Special economic zone",
    "Open Spaces",
    "Agricultural zone",
    "Others"
];

export const posessionStatus: PosessionType[] = [
    "Ready To Move", "Under Construction", "New Launch"
];
export const getLookingTypePath = (type: string | undefined | null): string => {
  switch (type) {
    case LookingType.Rent:
      return "rent";
    case LookingType.Sell:
      return "buy"; 
    case LookingType.FlatShare:
      return "flatshare";
    default:
      return "unknown";
  }
};
