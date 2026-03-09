import { LuInfo } from "react-icons/lu";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { RiBuilding2Line } from "react-icons/ri";
import Button from "@/common/Button";
import { useCustomBuilderStore } from "@/store/useCustomBuilderStore ";
import { FaBuilding, FaRoad } from "react-icons/fa";
import { BiDoorOpen } from "react-icons/bi";
import { FiPlusCircle } from "react-icons/fi";
import Loader from "@/components/Loader";
import { MdPermMedia } from "react-icons/md";
import RouterBack from "../RouterBack";
import Image from "next/image";
import {
  Hammer,
  Ruler,
  Compass,
  DoorOpen,
  Wallet,
  Building2,
  LayoutGrid,
  Home,
  Layers,
  ClipboardList,
  BedDouble,
  Bath,
  Flower2,
  Palette,
  Star,
  Info,
  Snowflake,
  Flame,
  Zap,
  Droplets,
  Car,
  ArrowUpDown,
  ShieldCheck,
  MapPin,
} from "lucide-react";

const iconCls = "md:w-5 w-3 md:h-5 h-3 text-[#3586FF]";

const InfoCard = ({
  label,
  value,
  icon,
  isColorScheme,
  isBooleanTag,
}: {
  label: string;
  value: any;
  icon: React.ReactNode;
  isColorScheme?: boolean;
  isBooleanTag?: boolean;
}) => {
  if (isBooleanTag) {
    return (
      <div className="flex flex-col md:gap-2 gap-1">
        <div className="flex items-center md:gap-2 gap-1">
          {icon}
          <span className="text-gray-400 md:text-[18px] text-[12px] text-nowrap font-medium">
            {label}
          </span>
        </div>
        <span
          className={`inline-flex items-center w-fit md:px-3 px-2 md:py-1 py-0.5 rounded-full text-[10px] md:text-[12px] font-semibold ${
            value
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {value ? "Yes" : "No"}
        </span>
      </div>
    );
  }

  if (isColorScheme) {
    return (
      <div className="flex flex-col md:gap-2 gap-1">
        <div className="flex items-center md:gap-2 gap-1">
          {icon}
          <span className="text-gray-400 md:text-[18px] text-[12px] text-nowrap font-medium">
            {label}
          </span>
        </div>
        <div className="flex flex-wrap md:gap-2 gap-1 mt-1">
          {Array.isArray(value) && value.length > 0 ? (
            value.map((cs: any, i: number) => (
              <div
                key={i}
                className="flex items-center md:gap-2 gap-1 border rounded-md md:px-2 px-1 py-1"
              >
                <div
                  className="md:w-5 w-3 md:h-5 h-3 rounded"
                  style={{ backgroundColor: cs.color }}
                />
                <span className="text-gray-700 md:text-[12px] text-[10px] font-medium capitalize">
                  {cs.label}
                </span>
              </div>
            ))
          ) : (
            <span className="text-gray-500 text-sm">No color scheme</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:gap-2 gap-1">
      <div className="flex items-center md:gap-2 gap-1">
        {icon}
        <span className="text-gray-400 md:text-[18px] text-[12px] text-nowrap font-medium">
          {label}
        </span>
      </div>
      <span className="capitalize md:text-[12px] text-[10px] font-medium">
        {value ?? "N/A"}
      </span>
    </div>
  );
};

const SectionHeader = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <h3 className="text-gray-800 md:mb-4 mb-2 flex items-center md:gap-2 gap-1">
    {icon}
    <span className="text-[#3586FF] md:text-[20px] text-[14px] font-medium">
      {title}
    </span>
  </h3>
);

const formatSize = (obj: any) => {
  if (!obj) return "N/A";
  return `${obj.size || 0} ${obj.unit || ""}`.trim();
};

export default function PropertyInformationView() {
  const router = useRouter();
  const custom_builder_id = router?.query?.id as string;
  const { data: customBuilder, isLoading, fetchData } = useCustomBuilderStore();

  useEffect(() => {
    if (custom_builder_id) fetchData(custom_builder_id);
  }, [custom_builder_id, fetchData]);

  const scope = customBuilder?.propertyInformation?.construction_scope;
  const constructionType = customBuilder?.propertyInformation?.construction_type;
  const isCommercial = constructionType === "Commercial";
  const isInterior = scope === "interior";

  const houseInfo = customBuilder?.propertyInformation?.house_construction_info;
  const interiorInfo = customBuilder?.propertyInformation?.interior_info;
  const commercialInfo = customBuilder?.propertyInformation?.commercial_construction_info;

  const propertyInfo = isCommercial
    ? commercialInfo
    : isInterior
    ? interiorInfo
    : houseInfo;

  // ─── Build details grid based on type ──────────────────────────────────────

  const getConstructionDetails = () => {
    if (isCommercial && commercialInfo) {
      return [
        { label: "Commercial Type", value: commercialInfo.commercial_type, icon: <Building2 className={iconCls} /> },
        { label: "Total Area", value: formatSize(commercialInfo.total_area), icon: <Ruler className={iconCls} /> },
        { label: "Length", value: formatSize(commercialInfo.length), icon: <Ruler className={iconCls} /> },
        { label: "Width", value: formatSize(commercialInfo.width), icon: <Ruler className={iconCls} /> },
        { label: "Height", value: formatSize(commercialInfo.height), icon: <ArrowUpDown className={iconCls} /> },
        { label: "Total Floors", value: commercialInfo.total_floors || "0", icon: <Layers className={iconCls} /> },
        { label: "Basement Floors", value: commercialInfo.basement_floors ?? "0", icon: <Layers className={iconCls} /> },
        { label: "Parking Floors", value: commercialInfo.parking_floors ?? "0", icon: <Car className={iconCls} /> },
        { label: "Land Facing", value: commercialInfo.land_facing || "N/A", icon: <Compass className={iconCls} /> },
        { label: "Gate Side", value: commercialInfo.gate_side || "N/A", icon: <DoorOpen className={iconCls} /> },
        { label: "Adjacent Roads", value: commercialInfo.adjacent_roads || "0", icon: <FaRoad className={iconCls} /> },
        { label: "Elevator Required", value: commercialInfo.elevator_required, icon: <ArrowUpDown className={iconCls} />, isBooleanTag: true },
        ...(commercialInfo.elevator_required ? [{ label: "No. of Elevators", value: commercialInfo.number_of_elevators || "0", icon: <ArrowUpDown className={iconCls} /> }] : []),
        { label: "Central AC", value: commercialInfo.central_ac_required, icon: <Snowflake className={iconCls} />, isBooleanTag: true },
        { label: "Fire Safety", value: commercialInfo.fire_safety_required, icon: <Flame className={iconCls} />, isBooleanTag: true },
        { label: "Parking Required", value: commercialInfo.parking_required, icon: <Car className={iconCls} />, isBooleanTag: true },
        ...(commercialInfo.parking_required ? [{ label: "Parking Capacity", value: commercialInfo.parking_capacity || "0", icon: <Car className={iconCls} /> }] : []),
        { label: "Generator Backup", value: commercialInfo.generator_backup_required, icon: <Zap className={iconCls} />, isBooleanTag: true },
        ...(commercialInfo.generator_backup_required ? [{ label: "Generator (KVA)", value: commercialInfo.generator_capacity_kva || "0", icon: <Zap className={iconCls} /> }] : []),
        { label: "Water Treatment", value: commercialInfo.water_treatment_required, icon: <Droplets className={iconCls} />, isBooleanTag: true },
        { label: "Sewage Treatment", value: commercialInfo.sewage_treatment_required, icon: <Droplets className={iconCls} />, isBooleanTag: true },
        { label: "Project Budget", value: customBuilder?.estimatedCost ? `₹ ${Number(customBuilder.estimatedCost).toLocaleString()}` : "N/A", icon: <Wallet className={iconCls} /> },
      ];
    }

    if (isInterior && interiorInfo) {
      return [
        { label: "Project Scope", value: interiorInfo.project_scope || "N/A", icon: <Hammer className={iconCls} /> },
        { label: "Total Area", value: formatSize(interiorInfo.total_area), icon: <Ruler className={iconCls} /> },
        { label: "Total Floors", value: interiorInfo.totalFloors || "N/A", icon: <FaBuilding className={iconCls} /> },
        { label: "Style Preference", value: interiorInfo.style_preference || "N/A", icon: <Palette className={iconCls} /> },
        { label: "Budget", value: interiorInfo.budget ? `₹ ${Number(interiorInfo.budget).toLocaleString()}` : "N/A", icon: <Wallet className={iconCls} /> },
        { label: "Special Requirements", value: interiorInfo.special_requirements || "N/A", icon: <Star className={iconCls} /> },
        { label: "Additional Details", value: interiorInfo.additional_details || "N/A", icon: <Info className={iconCls} /> },
        { label: "Color Scheme", value: interiorInfo.color_scheme || [], icon: <Palette className={iconCls} />, isColorScheme: true },
      ];
    }

    // House construction (default)
    if (houseInfo) {
      return [
        { label: "Construction Scope", value: scope || "N/A", icon: <Hammer className={iconCls} /> },
        { label: "Total Area", value: formatSize(houseInfo.total_area), icon: <Ruler className={iconCls} /> },
        { label: "Length", value: formatSize(houseInfo.length), icon: <Ruler className={iconCls} /> },
        { label: "Width", value: formatSize(houseInfo.width), icon: <Ruler className={iconCls} /> },
        { label: "Total Floors", value: houseInfo.total_floors || "0", icon: <Layers className={iconCls} /> },
        { label: "Land Facing", value: houseInfo.land_facing || "N/A", icon: <Compass className={iconCls} /> },
        { label: "Gate Side", value: houseInfo.gate_side || "N/A", icon: <DoorOpen className={iconCls} /> },
        { label: "Adjacent Roads", value: houseInfo.adjacent_roads || "0", icon: <FaRoad className={iconCls} /> },
        { label: "Staircase Gate", value: houseInfo.staircase_gate || "N/A", icon: <BiDoorOpen className={iconCls} /> },
        { label: "Project Budget", value: customBuilder?.estimatedCost ? `₹ ${Number(customBuilder.estimatedCost).toLocaleString()}` : "N/A", icon: <Wallet className={iconCls} /> },
      ];
    }

    return [];
  };

  const constructionDetails = getConstructionDetails();

  // ─── Floors (house & interior only) ────────────────────────────────────────

  const floors = isInterior
    ? interiorInfo?.floors || []
    : houseInfo?.floors || [];
  const [activeFloor, setActiveFloor] = useState(0);

  const generateFloorDetails = (floorArr: any[]) => {
    return floorArr.map((floor) => {
      const firstPortion = Array.isArray(floor.portionDetails)
        ? floor.portionDetails[0]
        : null;

      return [
        floor.portionDetails && {
          label: "Portions",
          value: floor.portions || "N/A",
          icon: <LayoutGrid className={iconCls} />,
        },
        firstPortion && {
          label: "Bed Rooms",
          value: firstPortion.bedrooms || "N/A",
          icon: <BedDouble className={iconCls} />,
        },
        firstPortion && {
          label: "Balconies",
          value: firstPortion.balconies || "N/A",
          icon: <Flower2 className={iconCls} />,
        },
        firstPortion && {
          label: "Bath Rooms",
          value: firstPortion.bathrooms || "N/A",
          icon: <Bath className={iconCls} />,
        },
        {
          label: "Type of Portions",
          value: floor.type_of_portions || "N/A",
          icon: <Layers className={iconCls} />,
        },
        {
          label: "Ground Floor",
          value: floor.ground_floor_details?.length
            ? floor.ground_floor_details
            : [],
          icon: <ClipboardList className={iconCls} />,
        },
        firstPortion?.additional_rooms?.length > 0 && {
          label: "Additional Rooms",
          value: firstPortion.additional_rooms,
          icon: <ClipboardList className={iconCls} />,
        },
        firstPortion && {
          label: "Indian Bathroom",
          value: firstPortion.indian_bathroom_required ? "Yes" : "No",
          icon: <Bath className={iconCls} />,
        },
      ].filter(Boolean);
    });
  };

  // ─── Images ────────────────────────────────────────────────────────────────

  const getPropertyImages = () => {
    if (isInterior) return interiorInfo?.reference_images || [];
    if (isCommercial) return commercialInfo?.propertyImages || [];
    return houseInfo?.propertyImages || [];
  };

  const propertyImages = getPropertyImages();

  // ─── Additional features ──────────────────────────────────────────────────

  const getAdditionalOptions = () => {
    if (isCommercial) return commercialInfo?.additionOptions || [];
    if (isInterior) return interiorInfo?.additionOptions || [];
    return houseInfo?.additionOptions || [];
  };

  const getAdditionalDetails = () => {
    if (isCommercial) return commercialInfo?.additional_details;
    if (isInterior) return interiorInfo?.additional_details;
    return houseInfo?.additional_details;
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="px-2 py-4">
        <RouterBack />
      </div>
      <div className="md:space-y-6 space-y-3 md:p-5 p-3 mx-auto w-full">
        <div className="w-full flex items-center md:gap-2 gap-1 md:mb-6 mb-3">
          <LuInfo className="text-[#3586FF] md:w-6 w-3 md:h-6 h-3" />
          <h1 className="font-bold md:text-[24px] text-[16px]">
            Property Information
          </h1>
        </div>

        {/* ─── Header Card ─────────────────────────────────────────────── */}
        <div className="bg-white md:rounded-[8px] rounded-[4px] w-full md:p-6 p-3 border border-gray-100">
          <h2 className="md:text-2xl text-[18px] font-bold text-gray-800">
            {customBuilder?.propertyInformation?.propertyName || "Property Details"}
          </h2>
          <div className="flex items-center md:gap-2 gap-1 md:mt-2 mt-1 flex-wrap">
            {customBuilder?.propertyInformation?.property_type && (
              <span className="md:px-3 px-2 py-1 bg-blue-100 text-blue-800 md:rounded-[10px] rounded-[4px] md:text-sm text-[12px] font-medium capitalize">
                {customBuilder.propertyInformation.property_type}
              </span>
            )}
            {isCommercial && customBuilder?.propertyInformation?.commercial_property_type && (
              <span className="md:px-3 px-2 py-1 bg-orange-100 text-orange-800 md:rounded-[10px] rounded-[4px] md:text-sm text-[12px] font-medium capitalize">
                {customBuilder.propertyInformation.commercial_property_type}
              </span>
            )}
            <span className="md:px-3 px-2 py-1 bg-green-100 text-green-800 md:rounded-[10px] rounded-[4px] md:text-sm text-[12px] font-medium capitalize">
              {constructionType || "N/A"}
            </span>
            <span className="md:px-3 px-2 py-1 bg-purple-100 text-purple-800 md:rounded-[10px] rounded-[4px] md:text-sm text-[12px] font-medium capitalize">
              {scope || "N/A"}
            </span>
          </div>
        </div>

        <div className="md:space-y-4 space-y-2 w-full">
          {/* ─── Basic Info Grid ──────────────────────────────────────── */}
          <div className="bg-white md:rounded-[10px] rounded-[4px] border border-gray-100 w-full md:p-6 p-3">
            <SectionHeader
              icon={<RiBuilding2Line className="text-[#3586FF] md:w-[16px] w-[8px] md:h-[16px] h-[8px]" />}
              title={isCommercial ? "Commercial Construction Details" : "Basic Information"}
            />
            <div className="grid md:grid-cols-5 grid-cols-2 md:gap-4 gap-2">
              {constructionDetails.map((item: any, index: number) => (
                <InfoCard
                  key={index}
                  label={item.label}
                  value={item.value}
                  icon={item.icon}
                  isColorScheme={item.isColorScheme}
                  isBooleanTag={item.isBooleanTag}
                />
              ))}
            </div>
          </div>

          {/* ─── Zoning Info (Commercial only) ────────────────────────── */}
          {isCommercial && commercialInfo?.zoning_info && (
            <div className="bg-white md:rounded-[10px] rounded-[4px] border border-gray-100 w-full md:p-6 p-3">
              <SectionHeader
                icon={<MapPin className="text-[#3586FF] md:w-[16px] w-[8px] md:h-[16px] h-[8px]" />}
                title="Zoning Information"
              />
              <div className="grid md:grid-cols-5 grid-cols-2 md:gap-4 gap-2">
                <InfoCard label="Zone Type" value={commercialInfo.zoning_info.zone_type || "N/A"} icon={<MapPin className={iconCls} />} />
                <InfoCard label="FSI Allowed" value={commercialInfo.zoning_info.fsi_allowed ?? "N/A"} icon={<Building2 className={iconCls} />} />
                <InfoCard label="Setback Front" value={commercialInfo.zoning_info.setback_front ? `${commercialInfo.zoning_info.setback_front}m` : "N/A"} icon={<Ruler className={iconCls} />} />
                <InfoCard label="Setback Side" value={commercialInfo.zoning_info.setback_side ? `${commercialInfo.zoning_info.setback_side}m` : "N/A"} icon={<Ruler className={iconCls} />} />
                <InfoCard label="Setback Rear" value={commercialInfo.zoning_info.setback_rear ? `${commercialInfo.zoning_info.setback_rear}m` : "N/A"} icon={<Ruler className={iconCls} />} />
              </div>
            </div>
          )}

          {/* ─── Floors (house & interior only) ───────────────────────── */}
          {!isCommercial && (
            <div className="bg-white w-full md:rounded-[10px] rounded-[4px] border border-gray-100 md:p-6 p-3">
              <SectionHeader
                icon={<FaBuilding className="text-[#3586FF] md:w-[16px] w-[8px] md:h-[16px] h-[8px]" />}
                title="Floors Information"
              />
              {floors?.length > 0 ? (
                <>
                  <div className="flex gap-2 mb-4 overflow-x-auto">
                    {floors.map((floor: any, index: number) => (
                      <Button
                        key={floor.id || index}
                        onClick={() => setActiveFloor(index)}
                        className={`md:px-4 px-2 md:py-2 py-1 rounded-md md:text-[14px] text-[10px] font-medium ${
                          activeFloor === index
                            ? "bg-[#3586FF] text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        Floor {floor?.floor}
                      </Button>
                    ))}
                  </div>
                  <div className="md:space-y-4 space-y-2">
                    {generateFloorDetails([floors[activeFloor]]).map(
                      (detailsGroup, groupIndex) => (
                        <div
                          key={groupIndex}
                          className="grid md:grid-cols-5 grid-cols-2 md:gap-3 gap-2"
                        >
                          {detailsGroup.map((item: any, itemIndex: number) => {
                            const hasValue =
                              (Array.isArray(item.value) && item.value.length > 0) ||
                              (!Array.isArray(item.value) && item.value != null && item.value !== "");
                            if (!hasValue) return null;

                            return (
                              <div key={itemIndex} className="flex flex-col md:gap-2 gap-1">
                                <div className="flex items-center md:gap-2 gap-1">
                                  {item?.icon}
                                  <span className="text-gray-400 md:text-[18px] text-[12px] font-medium">
                                    {item?.label}
                                  </span>
                                </div>
                                {Array.isArray(item.value) ? (
                                  <div className="flex w-full overflow-auto gap-1 md:gap-2 md:mt-2 mt-1">
                                    {item.value.map((detail: string, i: number) => (
                                      <span
                                        key={i}
                                        className="md:px-2 px-2 md:py-1 py-1 bg-blue-100 text-[#3586FF] md:rounded-[10px] rounded-[4px] md:text-[14px] text-[10px] capitalize"
                                      >
                                        {detail}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="capitalize md:text-[16px] text-[10px] font-medium">
                                    {item?.value}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )
                    )}
                  </div>
                </>
              ) : (
                <p className="text-gray-500">No floor information available</p>
              )}
            </div>
          )}

          {/* ─── Additional Features ──────────────────────────────────── */}
          <div className="bg-white md:rounded-[10px] w-full rounded-[4px] border border-gray-100 p-3 md:p-6">
            <SectionHeader
              icon={<FiPlusCircle className="text-[#3586FF] md:w-[16px] w-[8px] md:h-[16px] h-[8px]" />}
              title="Additional Features"
            />
            <div className="grid md:grid-cols-3 grid-cols-1 gap-5">
              <div className="flex flex-col gap-2">
                <span className="text-gray-400 md:text-[18px] text-[12px] font-medium">
                  Additional Specifications
                </span>
                {getAdditionalOptions().length > 0 ? (
                  <div className="flex flex-wrap md:gap-2 gap-1">
                    {getAdditionalOptions().map((option: string, index: number) => (
                      <span
                        key={index}
                        className="md:px-3 px-2 md:py-2 py-1 bg-blue-100 text-[#3586FF] md:rounded-[10px] rounded-[4px] md:text-xs text-[10px] capitalize"
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No additional features specified</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-gray-400 md:text-[18px] text-[12px] font-medium">
                  Additional Notes
                </span>
                <p className="capitalize md:text-[16px] text-[10px] font-medium">
                  {getAdditionalDetails() || "No additional notes"}
                </p>
              </div>

              {!isCommercial && !isInterior && houseInfo?.floors?.[0]?.portionDetails?.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-gray-400 md:text-[18px] text-[12px] font-medium">
                    Additional Rooms
                  </span>
                  <div className="flex md:gap-2 gap-1 flex-wrap">
                    {houseInfo?.floors?.[0]?.portionDetails?.length > 0 && houseInfo?.floors?.[0]?.portionDetails?.map(
                      (portion: any, pIndex: number) =>
                        (portion.additional_rooms as any[])?.map(
                          (option: string, index: number) => (
                            <span
                              key={`${pIndex}-${index}`}
                              className="md:px-3 px-2 md:py-2 py-1 bg-blue-100 text-[#3586FF] md:rounded-[10px] rounded-[4px] md:text-xs text-[10px] capitalize"
                            >
                              {option}
                            </span>
                          )
                        )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── Property Images ──────────────────────────────────────── */}
          <div className="bg-white md:rounded-[10px] rounded-[4px] border border-gray-100 md:p-6 p-3">
            <SectionHeader
              icon={<MdPermMedia className="text-[#3586FF] md:w-[16px] w-[8px] md:h-[16px] h-[8px]" />}
              title="Property Images"
            />
            {propertyImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-4 gap-2">
                {propertyImages.map((image: string, index: number) => (
                  <div
                    key={index}
                    className="relative aspect-square h-[80px] md:h-[160px] rounded-lg overflow-hidden border border-gray-200"
                  >
                    <Image
                      src={image}
                      alt={`Property image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 md:p-8 p-4 text-center rounded-lg">
                <MdPermMedia className="mx-auto text-gray-400 w-12 h-12" />
                <p className="md:mt-2 mt-1 text-gray-500">No images available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
