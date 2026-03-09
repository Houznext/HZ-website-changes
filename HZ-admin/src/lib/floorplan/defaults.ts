import {
  ConstructionRules,
  RoomConstraints,
  StaircaseRules,
  VastuPreference,
} from "./contracts";

export const DEFAULT_VASTU_PREFERENCE: VastuPreference = "BALANCED";

export const DEFAULT_ROOM_CONSTRAINTS_1BHK: RoomConstraints = {
  living: { minWidthFt: 10, minHeightFt: 10, targetAreaFt2: 140 },
  dining: { minWidthFt: 8, minHeightFt: 8, targetAreaFt2: 64 },
  kitchen: { minWidthFt: 7, minHeightFt: 8, targetAreaFt2: 70 },
  bedroom: { minWidthFt: 10, minHeightFt: 10, targetAreaFt2: 120 },
  bathroom: { minWidthFt: 5, minHeightFt: 7, targetAreaFt2: 35 },
  wc: { minWidthFt: 4, minHeightFt: 5, targetAreaFt2: 20 },
  pooja: { minWidthFt: 4, minHeightFt: 5, targetAreaFt2: 20 },
  guest_room: { minWidthFt: 9, minHeightFt: 10, targetAreaFt2: 90 },
  balcony: { minWidthFt: 4, minHeightFt: 6, targetAreaFt2: 24 },
};

export const DEFAULT_ROOM_CONSTRAINTS_2BHK: RoomConstraints = {
  ...DEFAULT_ROOM_CONSTRAINTS_1BHK,
  bedroom: { minWidthFt: 10, minHeightFt: 11, targetAreaFt2: 130 },
  living: { minWidthFt: 11, minHeightFt: 12, targetAreaFt2: 165 },
  kitchen: { minWidthFt: 8, minHeightFt: 8, targetAreaFt2: 75 },
};

export const DEFAULT_ROOM_CONSTRAINTS_3BHK: RoomConstraints = {
  ...DEFAULT_ROOM_CONSTRAINTS_2BHK,
  bedroom: { minWidthFt: 11, minHeightFt: 11, targetAreaFt2: 140 },
  living: { minWidthFt: 12, minHeightFt: 13, targetAreaFt2: 190 },
  dining: { minWidthFt: 9, minHeightFt: 9, targetAreaFt2: 81 },
};

export const DEFAULT_CONSTRUCTION_RULES: ConstructionRules = {
  wallThicknessFt: 0.375,
  minPassageWidthFt: 3,
  defaultDoorWidthFt: 2.5,
  bedroomDoorWidthFt: 2.5,
  bathroomDoorWidthFt: 2.5,
  windowWidthFt: 3,
  minWindowPerRoom: 1,
};

export const DEFAULT_STAIRCASE: StaircaseRules = {
  type: "DOGLEG",
  widthFt: 3.5,
  positionPreference: "NEAR_SOUTH_OR_WEST",
};
