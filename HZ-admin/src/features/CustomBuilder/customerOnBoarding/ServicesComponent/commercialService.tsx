import React, { useState } from "react";
import CustomInput from "@/src/common/FormElements/CustomInput";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import Button from "@/src/common/Button";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import SearchComponent from "@/src/common/SearchSelect";

const serviceConfigs: Record<
  string,
  { fields: Array<{ name: string; label: string; type: string; options?: any[] }> }
> = {
  hvac: {
    fields: [
      { name: "systemType", label: "System Type", type: "select", options: [
        { label: "Central AC", value: "central_ac" },
        { label: "Split AC", value: "split_ac" },
        { label: "VRV/VRF System", value: "vrv_vrf" },
        { label: "Chilled Water System", value: "chilled_water" },
        { label: "Ductable AC", value: "ductable" },
      ]},
      { name: "capacity", label: "Capacity (TR / Tons)", type: "text" },
      { name: "brand", label: "Preferred Brand", type: "select", options: [
        { label: "Daikin", value: "daikin" },
        { label: "Carrier", value: "carrier" },
        { label: "Blue Star", value: "blue_star" },
        { label: "Voltas", value: "voltas" },
        { label: "Hitachi", value: "hitachi" },
        { label: "Mitsubishi", value: "mitsubishi" },
      ]},
      { name: "ductingRequired", label: "Ducting Required", type: "select", options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ]},
      { name: "coveredArea", label: "Area to be Covered (sq.ft)", type: "number" },
      { name: "specifications", label: "Additional Specifications", type: "textarea" },
    ],
  },
  fire_safety: {
    fields: [
      { name: "systemType", label: "System Type", type: "select", options: [
        { label: "Fire Alarm System", value: "fire_alarm" },
        { label: "Fire Sprinkler System", value: "sprinkler" },
        { label: "Fire Extinguishers", value: "extinguishers" },
        { label: "Fire Hydrant System", value: "hydrant" },
        { label: "Complete Fire Safety Package", value: "complete" },
      ]},
      { name: "nocRequired", label: "Fire NOC Required", type: "select", options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ]},
      { name: "totalFloors", label: "Floors to Cover", type: "number" },
      { name: "smokeDetectors", label: "Smoke Detectors Required", type: "select", options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ]},
      { name: "specifications", label: "Additional Specifications", type: "textarea" },
    ],
  },
  elevator: {
    fields: [
      { name: "elevatorType", label: "Elevator Type", type: "select", options: [
        { label: "Passenger Elevator", value: "passenger" },
        { label: "Goods Elevator", value: "goods" },
        { label: "Hospital Elevator (Stretcher)", value: "hospital" },
        { label: "Panoramic / Glass Elevator", value: "panoramic" },
        { label: "Capsule Elevator", value: "capsule" },
      ]},
      { name: "capacity", label: "Capacity (Persons)", type: "number" },
      { name: "numberOfStops", label: "Number of Stops", type: "number" },
      { name: "brand", label: "Preferred Brand", type: "select", options: [
        { label: "OTIS", value: "otis" },
        { label: "KONE", value: "kone" },
        { label: "Schindler", value: "schindler" },
        { label: "ThyssenKrupp", value: "thyssenkrupp" },
        { label: "Johnson Lifts", value: "johnson" },
        { label: "Mitsubishi", value: "mitsubishi" },
      ]},
      { name: "specifications", label: "Additional Specifications", type: "textarea" },
    ],
  },
  glazing_facade: {
    fields: [
      { name: "glassType", label: "Glass Type", type: "select", options: [
        { label: "Tempered Glass", value: "tempered" },
        { label: "Laminated Glass", value: "laminated" },
        { label: "Double Glazed (DGU)", value: "dgu" },
        { label: "Low-E Glass", value: "low_e" },
        { label: "Reflective Glass", value: "reflective" },
      ]},
      { name: "facadeType", label: "Facade Type", type: "select", options: [
        { label: "Curtain Wall", value: "curtain_wall" },
        { label: "ACP Cladding", value: "acp" },
        { label: "Stone Cladding", value: "stone" },
        { label: "Glass Facade", value: "glass" },
        { label: "Composite", value: "composite" },
      ]},
      { name: "totalArea", label: "Total Facade Area (sq.ft)", type: "number" },
      { name: "specifications", label: "Additional Specifications", type: "textarea" },
    ],
  },
  parking_infra: {
    fields: [
      { name: "parkingType", label: "Parking Type", type: "select", options: [
        { label: "Open Parking", value: "open" },
        { label: "Covered Parking", value: "covered" },
        { label: "Basement Parking", value: "basement" },
        { label: "Multi-level Automated Parking", value: "automated" },
        { label: "Stacked Parking", value: "stacked" },
      ]},
      { name: "capacity", label: "Total Parking Spots", type: "number" },
      { name: "evCharging", label: "EV Charging Points", type: "select", options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ]},
      { name: "specifications", label: "Additional Specifications", type: "textarea" },
    ],
  },
  signage: {
    fields: [
      { name: "signageType", label: "Signage Type", type: "select", options: [
        { label: "LED Signboard", value: "led" },
        { label: "Neon Signs", value: "neon" },
        { label: "ACP Lettering", value: "acp" },
        { label: "3D Letters", value: "3d_letters" },
        { label: "Digital Display / Video Wall", value: "digital" },
        { label: "Backlit Signage", value: "backlit" },
      ]},
      { name: "location", label: "Location", type: "select", options: [
        { label: "Building Exterior", value: "exterior" },
        { label: "Entrance / Lobby", value: "entrance" },
        { label: "Rooftop", value: "rooftop" },
        { label: "Road Facing", value: "road_facing" },
        { label: "Multiple Locations", value: "multiple" },
      ]},
      { name: "dimensions", label: "Approximate Dimensions (L x W)", type: "text" },
      { name: "specifications", label: "Additional Specifications", type: "textarea" },
    ],
  },
};

interface Props {
  serviceKey: string;
  title: string;
}

const CommercialServiceForm: React.FC<Props> = ({ serviceKey, title }) => {
  const {
    customerOnboarding,
    updateServiceDetails,
    custom_builder_id,
  } = useCustomBuilderStore();

  const [isSaving, setIsSaving] = useState(false);
  const serviceDetail = customerOnboarding.servicesRequired.serviceDetails[serviceKey] || {};
  const config = serviceConfigs[serviceKey];

  const handleChange = (name: string, value: any) => {
    updateServiceDetails(serviceKey as any, { [name]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const existing = customerOnboarding.servicesRequired;
      const payload = {
        serviceType: existing.serviceType,
        selectedServices: existing.selectedServices,
        package: existing.package,
        commercialServiceDetails: {
          ...(existing.serviceDetails || {}),
          [serviceKey]: serviceDetail,
        },
      };

      const isEditing = Boolean(existing?.id);
      const response = isEditing
        ? await apiClient.patch(
            `${apiClient.URLS.cb_services}/${existing?.id}`,
            payload,
            true
          )
        : await apiClient.post(
            `${apiClient.URLS.cb_services}/${custom_builder_id}`,
            payload,
            true
          );

      if (response.status === 200 || response.status === 201) {
        toast.success("Service details saved");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving service details");
    } finally {
      setIsSaving(false);
    }
  };

  if (!config) return null;

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-[16px] font-semibold text-[#3586FF] mb-4 flex items-center gap-2">
        {title} Details
      </h3>

      <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
        {config.fields.map((field) => {
          if (field.type === "select" && field.options) {
            return (
              <SearchComponent
                key={field.name}
                label={field.label}
                labelCls="text-[12px] md:text-[14px] font-medium text-black"
                options={field.options}
                onChange={(v) => handleChange(field.name, v.value)} 
                value={serviceDetail?.[field.name] || ""}
              />
            );
          }
          if (field.type === "textarea") {
            return (
              <div key={field.name} className="md:col-span-2">
                <label className="text-[12px] md:text-[14px] font-medium text-black block mb-1">
                  {field.label}
                </label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-200 min-h-[80px]"
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                  value={serviceDetail?.[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              </div>
            );
          }
          return (
            <CustomInput
              key={field.name}
              label={field.label}
              type={field.type as "text" | "textarea" | "number" | "email" | "password" | "url"}
              labelCls="text-[12px] md:text-[14px] font-medium text-black"
              className="md:px-2 px-2 py-[2px] md:rounded-md rounded-[4px] md:text-[14px] text-[12px]"
              placeholder={`Enter ${field.label.toLowerCase()}`}
              value={serviceDetail?.[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              name={field.name}
            />
          );
        })}
      </div>

      <CustomInput
        label="Additional Requirements"
        type="text"
        labelCls="text-[12px] md:text-[14px] font-medium text-black mt-4"
        className="md:px-2 px-2 py-[2px] md:rounded-md rounded-[4px] md:text-[14px] text-[12px]"
        placeholder="Any other requirements..."
        value={serviceDetail?.additionalRequirement || ""}
        onChange={(e) => handleChange("additionalRequirement", e.target.value)}
        name="additionalRequirement"
      />

      <div className="flex justify-end mt-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="md:px-5 md:py-1 px-3 py-1 font-medium bg-[#3B82F6] text-white rounded-[6px] disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Details"}
        </Button>
      </div>
    </div>
  );
};

export default CommercialServiceForm;
