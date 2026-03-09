export enum ServiceCategory {
  RealEstate = 'RealEstate',
  Interiors = 'Interiors',
  CustomBuilder = 'CustomBuilder',
  Solar = 'Solar',
  PackersAndMovers = 'PackersAndMovers',
  Painting = 'Painting',
  Plumber = 'Plumber',
  EarthMovers = 'EarthMovers',
  HomeDecor = 'HomeDecor',
  Furniture = 'Furniture',
  CivilEngineeringDesign = 'CivilEngineeringDesign',
  VaastuConsultation = 'VaastuConsultation',
}
export enum LeadStatus {
  /* @deprecated - kept for backward compatibility, hidden in UI */
  YES = 'Yes',
  NO = 'No',
  New = 'New',
  Contacted = 'Contacted',
  Qualified = 'Qualified',
  Proposal_Sent = 'Proposal Sent',
  Negotiation = 'Negotiation',
  Follow_up = 'Follow-up',
  Interested = 'Interested',
  NotInterested = 'Not Interested',
  Closed = 'Closed',
  SiteVisit = 'Site Visit',
  Visit_Scheduled = 'Visit Scheduled',
  Visit_Done = 'Visit Done',
  Not_Lifted = 'Not Lifted',
  Switched_Off = 'Switched Off',
  Wrong_Number = 'Wrong Number',
  DND = 'DND',
  /* @deprecated - use Visit Done */
  SiteVisited = 'Site visited',
  completed = 'completed',
  /* @deprecated - kept for backward compatibility */
  Notcompleted = 'Not completed',
  NotAnswered = 'Not Answered',
  Rejected = 'Rejected',
  Won = 'Won',
  Lost = 'Lost',
}
export enum PaintingTypeEnum {
  FRESH = "Fresh Painting",
  REPAINT = "Repainting",
  RENTAL = "Rental Painting",
}

export enum PaintingPackageEnum {
  ECONOMY = "Economy",
  PREMIUM = "Premium",
  LUXURY = "Luxury",
}


export enum Categories {
  Commercial = 'Commercial',
  Residential = 'Residential',
  Industrial = 'Industrial',
  Agriculture = 'Agriculture',
}
export enum PropertyTypeEnum {
  flat = 'Flat',
  villa = 'Villa',
  independent_house = 'Independent House',
  independent_floor = 'Independent Floor',
}
export enum PlatForm {
  MAGIC_BRICKS = 'MAGIC BRICKS',
  NINETY_NINE_ACRES = '99 ACERS',
  HOUSING = 'HOUSING.Com',
  TOLET = 'TOLET',
  WALKIN = 'Walkin',
  OWNER_REFERENCE = 'OWNER REFERENCE',
  HIHIKER = 'Hihiker',
  SULEKHA = 'SULEKHA',
  BUILDER_LEAD = 'Builder Lead',
  COMMONFLOOR = 'commonfloor',
  PROPTEINSION = 'propteinsion',
  MAKSAAN = 'maksaen',
  COMMENY = 'commeny',
  REAL_ESTATE_INDIA = 'real estate India',
  BNI = 'BNI',
  SQUAREYARD = 'squareyard',
  NO_BROKER = 'no broker',
  WEB_SITE = 'Website',
  FACEBOOK = 'Facebook',     
  INSTAGRAM = 'Instagram', 
}
