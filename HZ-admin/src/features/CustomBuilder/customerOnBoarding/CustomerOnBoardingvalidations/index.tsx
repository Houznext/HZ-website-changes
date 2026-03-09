import { SizeWithUnit } from "@/src/stores/custom-builder";
import { Size } from "aws-sdk/clients/cloudsearchdomain";

interface PropertyValidationErrors {
  [key: string]: string | undefined;
  propertyName?: string;
  property_type?: string;
  construction_type?: string;
  construction_scope?: string;
}

interface HouseConstructionValidationErrors {
  [key: string]: string | undefined;
  total_area?: string;
  adjacent_roads?: string;
  land_facing?: string;
  total_floors?: string;
  gate_side?: string;
  additionOptions?: string;
  staircase_gate?: string;
  propertyImages?: string;
  additional_details?: string;
}
interface InteriorValidationErrors {
  project_scope?: string;
  total_area?: string;
  style_preference?: string;
  budget?: string;
  special_requirements?: string;
  total_floors?: string;
  totalFloors?: string;
  additional_details?: string;
}

export const validateCustomerOnboarding = (customerOnboarding: any) => {
  const propertyErrors: PropertyValidationErrors = {};
  const houseConstructionErrors: HouseConstructionValidationErrors = {};
  const interiorErrors: InteriorValidationErrors = {};
  const addressErrors: { city?: string; pincode?: string } = {};

  const { propertyInformation, addressDetails } = customerOnboarding;

  const name = propertyInformation?.propertyName?.trim();
  if (!name) {
    propertyErrors.propertyName = "Property name is required.";
  } else if (/^\d+$/.test(name)) {
    propertyErrors.propertyName = "Property name should include letters.";
  } else if (/^[0-9]/.test(name)) {
    propertyErrors.propertyName =
      "Property name should not start with a number.";
  } else if (/[^a-zA-Z0-9\s-]/.test(name)) {
    propertyErrors.propertyName = "No special characters allowed.";
  }

  if (!propertyInformation.property_type) {
    propertyErrors.property_type = "Property type is required";
  }

  if (!propertyInformation.construction_type) {
    propertyErrors.construction_type = "Construction type is required";
  }

  if (propertyInformation.construction_scope === "House") {
    const houseInfo = propertyInformation.house_construction_info;

    if (!houseInfo?.total_area) {
      houseConstructionErrors.total_area = "Total area is required.";
    } else if (!houseInfo?.total_area?.unit) {
      houseConstructionErrors.total_area =
        "Select a valid unit for total area.";
    } else {
      const { total_area } = houseInfo;

      if (total_area?.unit === "sq.yd" && total_area?.size > 2000) {
        houseConstructionErrors.total_area =
          "Total area cannot exceed 2000 sq.yd.";
      } else if (total_area?.unit === "sq.ft" && total_area?.size > 18000) {
        houseConstructionErrors.total_area =
          "Total area cannot exceed 18,000 sq.ft.";
      } else if (total_area?.unit === "ac" && total_area?.size > 0.5) {
        houseConstructionErrors.total_area =
          "Total area cannot exceed 0.5 acres.";
      } else if (total_area?.unit === "sq.m" && total_area?.size > 1670) {
        houseConstructionErrors.total_area =
          "Total area cannot exceed 1,670 sq.m.";
      } else if (total_area?.unit === "ha" && total_area?.size > 0.2) {
        houseConstructionErrors.total_area =
          "Total area cannot exceed 0.2 hectares.";
      }
    }

    if (!houseInfo?.adjacent_roads)
      houseConstructionErrors.adjacent_roads = "Adjacent Roads is required.";
    if (!houseInfo?.land_facing)
      houseConstructionErrors.land_facing = "Land Facing is required.";
    if (!houseInfo?.gate_side)
      houseConstructionErrors.gate_side = "Gate Side is required.";
    if (!houseInfo?.staircase_gate)
      houseConstructionErrors.staircase_gate = "Staircase Gate is required.";
    if (houseInfo?.total_floors === null || houseInfo?.total_floors === undefined)
      houseConstructionErrors.total_floors = "Total floors is required.";
  }
  if (propertyInformation.construction_scope === "Interior") {
    const interior_info = propertyInformation.interior_info;
    if (!interior_info.total_area) {
      interiorErrors.total_area = "Total Area is required.";
    } else {
      const { total_area } = interior_info;

      if (total_area?.unit === "sq.yd" && total_area?.size > 2000) {
        interiorErrors.total_area = "Total area cannot exceed 2000 sq.yd.";
      } else if (total_area?.unit === "sq.ft" && total_area?.size > 18000) {
        interiorErrors.total_area = "Total area cannot exceed 18,000 sq.ft.";
      } else if (total_area?.unit === "ac" && total_area?.size > 0.5) {
        interiorErrors.total_area = "Total area cannot exceed 0.5 acres.";
      } else if (total_area?.unit === "sq.m" && total_area?.size > 1670) {
        interiorErrors.total_area = "Total area cannot exceed 1,670 sq.m.";
      } else if (total_area?.unit === "ha" && total_area > 0.2) {
        interiorErrors.total_area = "Total area cannot exceed 0.2 hectares.";
      }
    }
    if (!interior_info.style_preference) {
      interiorErrors.style_preference = "Style preference is required.";
    }

    if (!interior_info.budget) {
      interiorErrors.budget = "Budget is required.";
    }
    if (interior_info.total_floors === null || interior_info.total_floors === undefined) {
      interiorErrors.total_floors = "Total floors is required.";
      interiorErrors.totalFloors = "Total floors is required.";
    }
    if (!interior_info.project_scope) {
      interiorErrors.project_scope = "project scope is required.";
    }

    if (!interior_info.special_requirements) {
      interiorErrors.special_requirements = "Special requirements is required.";
    }
  }

  if (!addressDetails.city) {
    addressErrors.city = "City is required";
  }

  if (!addressDetails.pincode) {
    addressErrors.pincode = "Pincode is required";
  } else if (!/^\d{6}$/.test(addressDetails.pincode)) {
    addressErrors.pincode = "Invalid pincode (must be 6 digits)";
  }

  return {
    propertyErrors,
    houseConstructionErrors,
    interiorErrors,
    addressErrors,
  };
};
