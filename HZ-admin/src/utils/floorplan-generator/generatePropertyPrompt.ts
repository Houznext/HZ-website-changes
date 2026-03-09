import { SizeWithUnit } from "@/src/stores/companyproperty";

interface PortionDetail {
  portionType: string;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  indian_bathroom_required: boolean;
  additional_rooms: string[];
}

interface FloorInformation {
  floor: string | number | null;
  portions: number;
  type_of_portions: string[];
  ground_floor_details: string[];
  portionDetails: PortionDetail[];
}

interface PropertyInformation {
  total_area: SizeWithUnit | null;
  construction_type: string;
  adjacent_roads: number | null;
  land_facing: string;
  property_type: string;
  total_floors: number | null;
  gate_side: string;
  additional_details: string;
  staircase_gate: string;
  additionOptions: string[];
  floors: FloorInformation[];
}

interface FloorPrompts {
  [key: string]: string;
}

const generatePropertyPrompt = (
  property: PropertyInformation
): FloorPrompts => {
  // Common property-wide details
  const dimensions = `${property.total_area?.size} ${property.total_area?.unit}`;
  const constructionType = property.construction_type.toLowerCase();
  const propertyType = property.property_type.toLowerCase();
  const orientation = `The building is ${property.land_facing}-facing.`;
  const additionalOptions =
    property.additionOptions.length > 0
      ? `Additional features include ${property.additionOptions.join(", ")}.`
      : "";

  // Prepare an object to hold prompts by floor key.
  const floorPrompts: FloorPrompts = {};

  // Loop over each floor in the property.floors array
  property.floors.forEach((floor) => {
    let floorName = "";
    let promptKey = "";

    // Determine the floor's name and corresponding key
    if (
      floor.floor === null ||
      floor.floor === "0" ||
      floor.floor === 0 ||
      (typeof floor?.floor === "string" &&
        floor?.floor?.toLowerCase()?.includes("ground"))
    ) {
      floorName = "ground floor";
      promptKey = "groundfloor";
    } else {
      floorName = `floor ${floor.floor}`;
      promptKey = `floor${floor.floor}`;
    }

    // Process floor-specific details
    const portions = floor.portions;
    const typeOfPortions = floor.type_of_portions.join(", ");
    const portionDetails = floor.portionDetails
      .map(
        (portion) =>
          `${portion.bedrooms} bedrooms, ${portion.balconies} balconies, ${
            portion.bathrooms
          } bathrooms, and additional rooms like ${portion.additional_rooms.join(
            ", "
          )}`
      )
      .join("; ");

    // Build prompt for this floor
    const floorPrompt = `Generate a minimal 2D floor plan for the ${floorName} of a ${constructionType} property (${propertyType}) with dimensions of ${dimensions}. This is a 2D floor plan, commonly used in architectural design and real estate to showcase the layout of a building or home. It represents the spatial arrangement of rooms, walls, doors, windows, and other architectural features viewed from above. This floor features ${portions} portion(s) (${typeOfPortions}), including ${portionDetails}. ${orientation} ${additionalOptions} The design should be minimalist and functional, clearly labeling each room and feature with precise measurements optimized for natural light and convenience.`;

    // Assign the prompt to the proper key
    if (promptKey) {
      floorPrompts[promptKey] = floorPrompt;
    }
  });

  // Return the prompts wrapped in an array as requested.
  return floorPrompts;
};

export default generatePropertyPrompt;
