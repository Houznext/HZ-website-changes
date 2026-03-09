export enum BranchLevel {
  ORG = 'ORG', // OneCasa (root)
  STATE = 'STATE', // Telangana, Maharashtra...
  CITY = 'CITY', // Hyderabad...
  AREA = 'AREA', // Madhapur, Kukatpally...
  OFFICE = 'OFFICE', // If you ever split an area into multiple offices
}

export enum OwnerIdProofType {
  AADHAAR = 'AADHAAR',
  PAN = 'PAN',
  VOTER_ID = 'VOTER_ID',
  PASSPORT = 'PASSPORT',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
}

/** Business type of branch – used for permissions and scoping. ORGANIZATION = org/root branch with full access. */
export enum BranchCategory {
  ORGANIZATION = 'ORGANIZATION', // Org/head office – access to everything
  GENERAL = 'GENERAL',
  CUSTOM_BUILDER = 'CUSTOM_BUILDER',
  INTERIORS = 'INTERIORS',
  INTERIORS_AND_CONSTRUCTION = 'INTERIORS_AND_CONSTRUCTION',
  LEGAL = 'LEGAL',
  HOME_DECOR = "HOME_DECOR",
  FURNITURE = 'FURNITURE',
  ELECTRONICS = 'ELECTRONICS',
  SERVICES = 'SERVICES',
  SOLAR = 'SOLAR',
  PAINTING = 'PAINTING',
  PLUMBING = 'PLUMBING',
  VASTU = 'VASTU',
  PROPERTY_LISTING = 'PROPERTY_LISTING',
}
