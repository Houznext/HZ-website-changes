import { GeneratePlanRequest } from "./contracts";

const ensureString = (value: unknown, field: string): string => {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} must be a non-empty string`);
  }
  return value;
};

export const validateGeneratePlanRequest = (input: GeneratePlanRequest): void => {
  if (!input || typeof input !== "object") throw new Error("Request body must be object");
  if (input.construction_scope !== "House") {
    throw new Error("construction_scope must be House");
  }

  ensureString(input.property_type, "property_type");
  ensureString(input.construction_type, "construction_type");

  const hci = input.house_construction_info;
  if (!hci) throw new Error("house_construction_info is required");

  if (!hci.length || !hci.width) throw new Error("length and width are required");
  if (!Array.isArray(hci.floors) || hci.floors.length === 0) {
    throw new Error("house_construction_info.floors must be a non-empty array");
  }

  hci.floors.forEach((floor, i) => {
    if (Number(floor.portions) < 1) {
      throw new Error(`floors[${i}].portions must be >= 1`);
    }
    if (!Array.isArray(floor.type_of_portions)) {
      throw new Error(`floors[${i}].type_of_portions must be an array`);
    }
    if (!Array.isArray(floor.portionDetails)) {
      throw new Error(`floors[${i}].portionDetails must be an array`);
    }
  });
};
