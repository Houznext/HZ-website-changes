export enum ReferAndEarnStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum BrokerageModel {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  PER_SQFT = 'PER_SQFT',
  PER_SQYD = 'PER_SQYD',
  PER_ACRE = 'PER_ACRE',
}

export enum ContactRouting {
  OWNER = 'OWNER',
  ONECASA_INTERNAL = 'ONECASA_INTERNAL',
}

export enum ReferralCaseStatus {
  OPEN = 'OPEN',
  WON = 'WON',
  LOST = 'LOST',
  CANCELLED = 'CANCELLED',
}

export enum ReferralCategory
{
  PROPERTY="PROPERTY",
  PROJECT="PROJECT",
  INTERIORS="INTERIORS",
  FURNITURE="FURNITURE",
  CONSTRUCTION="CONSTRUCTION"
}