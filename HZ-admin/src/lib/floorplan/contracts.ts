export const FLOORPLAN_CONTRACT_VERSION = "1.0.0";

export type LengthUnit = "ft" | "meters" | "sq.ft";
export type AreaUnit = "sq.ft" | "sq.meter";

export type VastuPreference = "STRICT" | "BALANCED" | "FLEXIBLE";
export type PortionAreaDistributionMode = "EQUAL" | "EXPLICIT";

export interface SizeWithUnit {
  size: number;
  unit: string;
}

export interface PlotBoundary {
  shape: "RECTANGLE" | "POLYGON";
  width: SizeWithUnit;
  length: SizeWithUnit;
  polygon?: Array<{ x: number; y: number; unit: "ft" | "meters" }>;
}

export interface RoomConstraint {
  minWidthFt: number;
  minHeightFt: number;
  targetAreaFt2?: number;
}

export interface RoomConstraints {
  living: RoomConstraint;
  dining: RoomConstraint;
  kitchen: RoomConstraint;
  bedroom: RoomConstraint;
  bathroom: RoomConstraint;
  wc: RoomConstraint;
  pooja: RoomConstraint;
  guest_room: RoomConstraint;
  balcony: RoomConstraint;
}

export interface ConstructionRules {
  wallThicknessFt: number;
  minPassageWidthFt: number;
  defaultDoorWidthFt: number;
  bedroomDoorWidthFt: number;
  bathroomDoorWidthFt: number;
  windowWidthFt: number;
  minWindowPerRoom: number;
}

export interface StaircaseRules {
  type: "DOGLEG" | "STRAIGHT" | "SPIRAL";
  widthFt: number;
  positionPreference: "NEAR_SOUTH_OR_WEST" | "ANY";
}

export interface PortionAreaDistribution {
  mode: PortionAreaDistributionMode;
  explicitPercentages?: number[];
}

export interface HousePortionDetails {
  portionType: string;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  indian_bathroom_required: boolean;
  additional_rooms: string[];
}

export interface HouseFloorInput {
  floor: string;
  portions: number;
  type_of_portions: string[];
  portionDetails: HousePortionDetails[];
  ground_floor_details: string[];
}

export interface HouseConstructionInput {
  total_area: SizeWithUnit | null;
  length: SizeWithUnit | null;
  width: SizeWithUnit | null;
  adjacent_roads: number | null;
  land_facing: string;
  total_floors: number | null;
  gate_side: string;
  staircase_gate: string;
  additionOptions: string[];
  floors: HouseFloorInput[];
}

export interface GeneratePlanRequest {
  schemaVersion: string;
  id?: string | number;
  propertyName?: string;
  construction_type: string;
  property_type: string;
  construction_scope: "House";
  house_construction_info: HouseConstructionInput;
  plotBoundary?: PlotBoundary;
  vastuPreference?: VastuPreference;
  roomConstraints?: Partial<RoomConstraints>;
  constructionRules?: Partial<ConstructionRules>;
  staircase?: Partial<StaircaseRules>;
  portionAreaDistribution?: PortionAreaDistribution;
  tolerance?: {
    areaTolerancePct?: number;
  };
  generateVariants?: number;
  seed?: number;
}

export interface ZonePreference {
  roomType: string;
  preferredZones: string[];
  forbiddenZones?: string[];
  weight: number;
  hardConstraint: boolean;
}

export interface RoomSpec {
  id: string;
  name: string;
  type:
    | "LIVING"
    | "DINING"
    | "KITCHEN"
    | "BEDROOM"
    | "BATHROOM"
    | "WC"
    | "BALCONY"
    | "POOJA"
    | "GUEST_ROOM"
    | "STAIRCASE"
    | "RESERVED"
    | "OTHER";
  minWidthFt: number;
  minHeightFt: number;
  targetAreaFt2: number;
  optional?: boolean;
}

export interface AdjacencyPreference {
  from: string;
  to: string;
  strength: "HARD" | "SOFT";
  weight: number;
}

export interface PortionPlanSpec {
  floorIndex: number;
  floorName: string;
  portionIndex: number;
  portionType: string;
  boundaryFt: { width: number; length: number };
  gateSide: string;
  facing: string;
  vastuPreference: VastuPreference;
  tolerance: { areaTolerancePct: number };
  rules: ConstructionRules;
  staircase: StaircaseRules;
  rooms: RoomSpec[];
  adjacencyPreferences: AdjacencyPreference[];
  zonePreferences: ZonePreference[];
  notes: string[];
}

export interface PlanSpec {
  schemaVersion: string;
  requestHash: string;
  generatedAtIso: string;
  generator: {
    provider: string;
    model: string;
  };
  portions: PortionPlanSpec[];
  warnings: string[];
}

export interface RectFt {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Opening {
  id: string;
  roomId: string;
  wall: "N" | "S" | "E" | "W";
  offsetFt: number;
  widthFt: number;
  kind: "DOOR" | "WINDOW";
}

export interface PlacedRoom {
  id: string;
  name: string;
  type: string;
  rectFt: RectFt;
  areaFt2: number;
  label: string;
}

export interface PlacedVariant {
  variantId: string;
  score: number;
  scoreBreakdown: Record<string, number>;
  warnings: string[];
  boundaryFt: { width: number; length: number };
  wallThicknessFt: number;
  rooms: PlacedRoom[];
  openings: Opening[];
}

export interface PlacedPortion {
  floorIndex: number;
  floorName: string;
  portionIndex: number;
  portionType: string;
  variants: PlacedVariant[];
}

export interface PlacedPlan {
  schemaVersion: string;
  createdAtIso: string;
  planId: string;
  requestHash: string;
  warnings: string[];
  portions: PlacedPortion[];
}

export interface NormalizedGeneratePlanRequest extends GeneratePlanRequest {
  schemaVersion: string;
  plotBoundary: PlotBoundary;
  vastuPreference: VastuPreference;
  roomConstraints: RoomConstraints;
  constructionRules: ConstructionRules;
  staircase: StaircaseRules;
  portionAreaDistribution: PortionAreaDistribution;
  tolerance: { areaTolerancePct: number };
  generateVariants: number;
}
