import {
  AdjacencyPreference,
  NormalizedGeneratePlanRequest,
  PlanSpec,
  PortionPlanSpec,
  RoomSpec,
  ZonePreference,
} from "./contracts";

const clampCount = (v: unknown): number => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
};

const makeRoom = (
  id: string,
  name: string,
  type: RoomSpec["type"],
  width: number,
  height: number,
  area: number,
  optional = false
): RoomSpec => ({
  id,
  name,
  type,
  minWidthFt: width,
  minHeightFt: height,
  targetAreaFt2: area,
  optional,
});

const normalizeSide = (v?: string): "NORTH" | "SOUTH" | "EAST" | "WEST" | "UNKNOWN" => {
  const s = (v || "").toLowerCase();
  if (s.includes("north")) return "NORTH";
  if (s.includes("south")) return "SOUTH";
  if (s.includes("east")) return "EAST";
  if (s.includes("west")) return "WEST";
  return "UNKNOWN";
};

const resolvePortionBoundaries = (
  totalWidthFt: number,
  totalLengthFt: number,
  portionsCount: number,
  gateSideRaw: string
): Array<{ width: number; length: number; split: "WIDTH" | "LENGTH" }> => {
  if (portionsCount <= 1) {
    return [{ width: totalWidthFt, length: totalLengthFt, split: "WIDTH" }];
  }

  const gateSide = normalizeSide(gateSideRaw);
  const splitAlongWidth =
    gateSide === "NORTH" || gateSide === "SOUTH"
      ? true
      : gateSide === "EAST" || gateSide === "WEST"
        ? false
        : totalWidthFt >= totalLengthFt;

  if (splitAlongWidth) {
    const unitW = Number((totalWidthFt / portionsCount).toFixed(3));
    return Array.from({ length: portionsCount }, () => ({
      width: unitW,
      length: totalLengthFt,
      split: "WIDTH",
    }));
  }

  const unitL = Number((totalLengthFt / portionsCount).toFixed(3));
  return Array.from({ length: portionsCount }, () => ({
    width: totalWidthFt,
    length: unitL,
    split: "LENGTH",
  }));
};

const applyAreaSanity = (
  rooms: RoomSpec[],
  boundaryFt: { width: number; length: number },
  tolerancePct: number,
  warnings: string[],
  contextLabel: string
) => {
  const boundaryArea = boundaryFt.width * boundaryFt.length;
  const circulationReserve = boundaryArea <= 1200 ? 0.15 : 0.12;
  const usableArea = boundaryArea * (1 - circulationReserve);
  const mandatory = rooms.filter((r) => !r.optional);
  const mandatoryTarget = mandatory.reduce((sum, r) => sum + Math.max(0, r.targetAreaFt2), 0);

  if (mandatoryTarget <= usableArea) return;

  const relaxedUsable = boundaryArea * (1 - Math.max(0.08, circulationReserve - tolerancePct / 100));
  const scale = Math.max(0.55, Math.min(1, relaxedUsable / mandatoryTarget));
  warnings.push(
    `${contextLabel}: mandatory target area (${mandatoryTarget.toFixed(
      1
    )} sq.ft) exceeds usable area (${usableArea.toFixed(
      1
    )} sq.ft). Scaled room targets by ${(scale * 100).toFixed(1)}%.`
  );

  rooms.forEach((r) => {
    r.targetAreaFt2 = Number((r.targetAreaFt2 * scale).toFixed(2));
  });
};

const defaultPortionTemplate = (portionType: string) => {
  const normalized = (portionType || "").toLowerCase();
  if (normalized.includes("3")) return { bedrooms: 3, bathrooms: 2, balconies: 1, indian: false };
  if (normalized.includes("2")) return { bedrooms: 2, bathrooms: 2, balconies: 1, indian: false };
  return { bedrooms: 1, bathrooms: 1, balconies: 0, indian: false };
};

export const expandPlanProgram = (
  request: NormalizedGeneratePlanRequest,
  requestHash: string,
  seed?: number
): { planSpecBase: Omit<PlanSpec, "generator">; warnings: string[] } => {
  const warnings: string[] = [];
  const boundaryFt = {
    width: Number(request.plotBoundary.width.size),
    length: Number(request.plotBoundary.length.size),
  };

  const portions: PortionPlanSpec[] = [];

  request.house_construction_info.floors.forEach((floor, floorIndex) => {
    const floorName = floor.floor || `Floor ${floorIndex}`;
    const portionsCount = Math.max(1, clampCount(floor.portions));
    const portionBoundaries = resolvePortionBoundaries(
      boundaryFt.width,
      boundaryFt.length,
      portionsCount,
      request.house_construction_info.gate_side
    );
    if (portionsCount > 1) {
      warnings.push(
        `${floorName}: split ${boundaryFt.width}x${boundaryFt.length} ft into ${portionsCount} portions by ${portionBoundaries[0].split}.`
      );
    }

    for (let portionIndex = 0; portionIndex < portionsCount; portionIndex += 1) {
      const detail = floor.portionDetails?.[portionIndex];
      const typeFromList = floor.type_of_portions?.[portionIndex] || "1BHK";
      const fallback = defaultPortionTemplate(typeFromList);

      if (!detail) {
        warnings.push(
          `Missing portionDetails for floor '${floorName}', portion ${portionIndex + 1}; using ${typeFromList} defaults.`
        );
      }

      const bedrooms = detail ? clampCount(detail.bedrooms) : fallback.bedrooms;
      const rawBathrooms = detail ? clampCount(detail.bathrooms) : fallback.bathrooms;
      let bathrooms = rawBathrooms;
      if (rawBathrooms < 0) bathrooms = 0;

      if (rawBathrooms === 0) {
        warnings.push(
          `Bathrooms count is 0 for floor '${floorName}' portion ${portionIndex + 1}; keeping 0 as explicitly requested.`
        );
      }

      const balconies = detail ? clampCount(detail.balconies) : fallback.balconies;
      const indianRequired = detail ? Boolean(detail.indian_bathroom_required) : fallback.indian;

      const roomC = request.roomConstraints;
      const rooms: RoomSpec[] = [];

      rooms.push(makeRoom("living", "Living", "LIVING", roomC.living.minWidthFt, roomC.living.minHeightFt, roomC.living.targetAreaFt2 || 140));
      rooms.push(makeRoom("kitchen", "Kitchen", "KITCHEN", roomC.kitchen.minWidthFt, roomC.kitchen.minHeightFt, roomC.kitchen.targetAreaFt2 || 70));

      if (bedrooms >= 2) {
        rooms.push(makeRoom("dining", "Dining", "DINING", roomC.dining.minWidthFt, roomC.dining.minHeightFt, roomC.dining.targetAreaFt2 || 70, true));
      }

      for (let i = 0; i < Math.max(1, bedrooms); i += 1) {
        rooms.push(
          makeRoom(
            `bedroom_${i + 1}`,
            i === 0 ? "Master Bedroom" : `Bedroom ${i + 1}`,
            "BEDROOM",
            roomC.bedroom.minWidthFt,
            roomC.bedroom.minHeightFt,
            roomC.bedroom.targetAreaFt2 || 120
          )
        );
      }

      let bathroomsToCreate = bathrooms;
      let shouldCreateMandatoryWc = false;
      if (indianRequired && bathrooms >= 2) {
        bathroomsToCreate = Math.max(1, bathrooms - 1);
        shouldCreateMandatoryWc = true;
        warnings.push(
          `${floorName} portion ${portionIndex + 1}: converted one bathroom to WC for indian_bathroom_required to keep wet areas realistic.`
        );
      }

      for (let i = 0; i < bathroomsToCreate; i += 1) {
        rooms.push(
          makeRoom(
            `bathroom_${i + 1}`,
            `Bathroom ${i + 1}`,
            "BATHROOM",
            roomC.bathroom.minWidthFt,
            roomC.bathroom.minHeightFt,
            roomC.bathroom.targetAreaFt2 || 35
          )
        );
      }

      if (indianRequired) {
        if (shouldCreateMandatoryWc) {
          rooms.push(
            makeRoom("wc_1", "Indian WC", "WC", roomC.wc.minWidthFt, roomC.wc.minHeightFt, roomC.wc.targetAreaFt2 || 20)
          );
        } else {
          rooms.push(
            makeRoom(
              "wc_1",
              "Indian WC",
              "WC",
              roomC.wc.minWidthFt,
              roomC.wc.minHeightFt,
              roomC.wc.targetAreaFt2 || 20,
              true
            )
          );
          warnings.push(
            `indian_bathroom_required enabled with bathrooms < 2 for floor '${floorName}' portion ${portionIndex + 1}; added a compact WC.`
          );
        }
      }

      for (let i = 0; i < balconies; i += 1) {
        rooms.push(
          makeRoom(
            `balcony_${i + 1}`,
            `Balcony ${i + 1}`,
            "BALCONY",
            roomC.balcony.minWidthFt,
            roomC.balcony.minHeightFt,
            roomC.balcony.targetAreaFt2 || 24,
            true
          )
        );
      }

      (detail?.additional_rooms || []).forEach((r, i) => {
        const key = (r || "").toLowerCase().replace(/\s+/g, "_");
        if (key.includes("pooja")) {
          rooms.push(makeRoom(`pooja_${i + 1}`, "Pooja", "POOJA", roomC.pooja.minWidthFt, roomC.pooja.minHeightFt, roomC.pooja.targetAreaFt2 || 20, true));
        } else if (key.includes("guest")) {
          rooms.push(makeRoom(`guest_${i + 1}`, "Guest Room", "GUEST_ROOM", roomC.guest_room.minWidthFt, roomC.guest_room.minHeightFt, roomC.guest_room.targetAreaFt2 || 90, true));
        } else {
          rooms.push(makeRoom(`other_${i + 1}`, r, "OTHER", 6, 6, 36, true));
        }
      });

      const adjacency: AdjacencyPreference[] = [
        { from: "living", to: "kitchen", strength: "SOFT", weight: 6 },
        { from: "living", to: "dining", strength: "SOFT", weight: 5 },
        { from: "bedroom_1", to: "bathroom_1", strength: "SOFT", weight: 5 },
        { from: "living", to: "bedroom_1", strength: "SOFT", weight: 7 },
        { from: "living", to: "balcony_1", strength: "SOFT", weight: 6 },
        { from: "kitchen", to: "other_1", strength: "SOFT", weight: 3 },
      ];

      const zonePreferences: ZonePreference[] = [
        {
          roomType: "KITCHEN",
          preferredZones: ["SE", "NW"],
          weight: 10,
          hardConstraint: request.vastuPreference === "STRICT",
        },
        {
          roomType: "BEDROOM",
          preferredZones: ["SW"],
          weight: 8,
          hardConstraint: false,
        },
        {
          roomType: "POOJA",
          preferredZones: ["NE"],
          weight: 8,
          hardConstraint: false,
        },
        {
          roomType: "BATHROOM",
          preferredZones: ["NW", "SE"],
          forbiddenZones: ["NE"],
          weight: 9,
          hardConstraint: request.vastuPreference === "STRICT",
        },
      ];

      if (floorIndex === 0 && floor.ground_floor_details?.length) {
        rooms.push(makeRoom("reserved_core", "Common Core", "RESERVED", 8, 8, 64, true));
      }

      const portionBoundary = portionBoundaries[portionIndex] || portionBoundaries[0];
      applyAreaSanity(
        rooms,
        { width: portionBoundary.width, length: portionBoundary.length },
        request.tolerance.areaTolerancePct,
        warnings,
        `${floorName} portion ${portionIndex + 1}`
      );

      portions.push({
        floorIndex,
        floorName,
        portionIndex,
        portionType: detail?.portionType || typeFromList || "1BHK",
        boundaryFt: { width: portionBoundary.width, length: portionBoundary.length },
        gateSide: request.house_construction_info.gate_side,
        facing: request.house_construction_info.land_facing,
        vastuPreference: request.vastuPreference,
        tolerance: { areaTolerancePct: request.tolerance.areaTolerancePct },
        rules: request.constructionRules,
        staircase: request.staircase,
        rooms,
        adjacencyPreferences: adjacency,
        zonePreferences,
        notes: [
          `seed=${seed ?? "auto"}`,
          `adjacent_roads=${request.house_construction_info.adjacent_roads || 1}`,
          `portion_split=${portionBoundaries[0].split}`,
        ],
      });
    }
  });

  if (boundaryFt.width * boundaryFt.length < 250) {
    warnings.push("Very small area (<250 sq.ft): optional rooms may be removed by solver.");
  }
  return {
    planSpecBase: {
      schemaVersion: "1.0.0",
      requestHash,
      generatedAtIso: new Date().toISOString(),
      portions,
      warnings,
    },
    warnings,
  };
};
