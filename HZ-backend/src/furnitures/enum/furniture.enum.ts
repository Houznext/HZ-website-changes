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

export enum SortOption {
  Default = 'default',
  Popularity = 'popularity',
  Latest = 'latest',
  PriceLowHigh = 'priceLowHigh',
  PriceHighLow = 'priceHighLow',
}

export enum PriceRange {
  Under20000 = 'under20000',
  Between20000And29999 = '20000to29999',
  Between30000And39999 = '30000to39999',
  Between40000And49999 = '40000to49999',
  Above50000 = 'above50000',
}

export enum FurnitureStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
}

// src/furniture/enum/furniture-subcategory.enum.ts

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
