import { LuUser, LuMapPin, LuPhone, LuCalendar } from "react-icons/lu";
import { FaRegEnvelope } from "react-icons/fa";
import { BiRupee } from "react-icons/bi";
import { HiBadgeCheck } from "react-icons/hi";
import { useRouter } from "next/router";
import Button from "@/src/common/Button";
import { Menu } from "@headlessui/react";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import {
  MdStar,
  MdAttachMoney,
  MdVerified,
  MdWorkspacePremium,
  MdTrendingUp,
  MdPeopleAlt,
} from "react-icons/md";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";

interface Props {
  project: any;
  variant?: "list" | "grid";

  isCompared?: boolean;
  compareDisabled?: boolean;
  onToggleCompare?: () => void;
}

export const ProjectCard = ({
  project,
  variant = "list",
  isCompared = false,
  compareDisabled = false,
  onToggleCompare,
}: Props) => {
  const router = useRouter();
  const {
    id,
    name,
    location,
    minPrice,
    maxPrice,
    company,
    mediaDetails,
    propertyType,
  } = project;

  const [promotions, setPromotions] = useState<string[]>(
    project?.promotionType || []
  );
  const images = mediaDetails?.propertyImages || [];
  const { hasPermission } = usePermissionStore((state) => state);

  const handleSelect = (option: string) => {
    setPromotions((prev) =>
      prev?.includes(option)
        ? prev?.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleClose = async () => {
    try {
      const response = await apiClient.patch(
        `${apiClient.URLS.company_Onboarding}/admin/${project.id}/promotion`,
        {
          promotionType: promotions,
          approvedBy: "admin",
          updatedBy: "admin",
        },
        true
      );
      if (!response.ok) {
        console.error("Failed to update promotions");
        return;
      }
      toast.success("promotion updated successfully!");
    } catch (error) {
      console.error("API error:", error);
    }
  };

  const iconMap: Record<string, JSX.Element> = {
    Featured: <MdStar className="text-amber-500 mr-2" />,
    Sponsored: <MdAttachMoney className="text-emerald-500 mr-2" />,
    Verified: <MdVerified className="text-sky-600 mr-2" />,
    Premium: <MdWorkspacePremium className="text-violet-600 mr-2" />,
    Top: <MdTrendingUp className="text-pink-500 mr-2" />,
    Popular: <MdPeopleAlt className="text-orange-500 mr-2" />,
  };

  const renderDropdown = (label: string, key: string, options?: string[]) => {
    if (!options) return null;
    const displayLabel =
      promotions?.length > 0 ? promotions?.join(", ") : label;

    return (
      <Menu as="div" className="w-full relative max-w-[200px]">
        {({ open, close }) => (
          <>
            <Menu.Button
              className={`flex items-center border md:w-[100%] md:text-[${
                promotions?.length > 2 ? "12px" : "14px"
              }] text-[10px] md:px-4 px-2 md:py-[6px] py-[4px] rounded-md font-medium bg-white text-black hover:bg-gray-100`}
            >
              {displayLabel}
              <ChevronDownIcon className="w-4 h-4 ml-auto" />
            </Menu.Button>

            {open && (
              <Menu.Items className="absolute mt-1 right-0 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto p-2 z-50">
                {options.map((option) => (
                  <div key={option}>
                    <Button
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={`block w-full border-[1px] md:text-[14px] text-[10px] border-gray-200 font-medium px-4 py-1 text-left ${
                        promotions?.includes(option)
                          ? "bg-[#5297ff] text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      {option}
                    </Button>
                  </div>
                ))}
                <div className="flex justify-end mt-2">
                  <CustomTooltip
                    label="Access Restricted Contact Admin"
                    position="bottom"
                    tooltipBg="bg-black/60 backdrop-blur-md"
                    tooltipTextColor="text-white py-2 px-4 font-medium"
                    labelCls="text-[10px] font-medium"
                    showTooltip={!hasPermission("project", "edit")}
                  >
                    <Button
                      disabled={!hasPermission("project", "edit")}
                      className="bg-[#5297ff] text-white px-3 py-1 font-medium rounded text-sm"
                      onClick={() => {
                        handleClose();
                        close();
                      }}
                    >
                      Apply
                    </Button>
                  </CustomTooltip>
                </div>
              </Menu.Items>
            )}
          </>
        )}
      </Menu>
    );
  };

  const badges = project?.promotionType || [];
  const isGrid = variant === "grid";

  return (
    <div
      className={twMerge(
        "group relative rounded-xl border bg-white transition-shadow",
        isGrid
          ? "p-4 shadow-sm hover:shadow-md"
          : "p-4 shadow-sm hover:shadow-md flex md:flex-row flex-col gap-x-6 gap-y-4",
        badges.includes("Featured")
          ? "border-amber-300"
          : badges.includes("Sponsored")
          ? "border-emerald-300"
          : badges.includes("Verified")
          ? "border-sky-400"
          : badges.includes("Premium")
          ? "border-violet-400"
          : badges.includes("Top")
          ? "border-pink-400"
          : badges.includes("Popular")
          ? "border-orange-400"
          : "border-gray-200"
      )}
    >
      {/* Badges */}
      {badges.length > 0 && (
        <div className="absolute left-0 top-0 flex flex-row gap-1 items-end z-10">
          {badges.map((type: string) => {
            const cap =
              type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
            const colorMap = {
              Featured: "bg-amber-100 text-amber-800 border-amber-300",
              Sponsored: "bg-emerald-100 text-emerald-800 border-emerald-300",
              Verified: "bg-sky-100 text-sky-800 border-sky-300",
              Premium: "bg-violet-100 text-violet-800 border-violet-300",
              Top: "bg-pink-100 text-pink-800 border-pink-300",
              Popular: "bg-orange-100 text-orange-800 border-orange-300",
            } as const;
            return (
              <div key={type} className="relative mb-3 flex justify-center">
                <span
                  className={`inline-flex items-center border shadow-md rounded-tl-[15px] rounded-tr-[2px] rounded-bl-[1px] rounded-br-[20px]
                    md:px-3 px-2 md:py-[3px] py-[3px] md:text-[12px] text-[10px]
                    backdrop-blur-md ${colorMap[cap]}`}
                >
                  {iconMap[cap] || null}
                  <span className="leading-none">{cap}</span>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {onToggleCompare && (
        <input
          type="checkbox"
          checked={isCompared}
          disabled={compareDisabled && !isCompared}
          onChange={onToggleCompare}
          className={twMerge(
            "absolute top-2 right-2 z-10 h-4 w-4 cursor-pointer rounded border-gray-300 text-[#3586FF]  focus:ring-[#5297ff]",
            compareDisabled && !isCompared
              ? "opacity-50 cursor-not-allowed"
              : ""
          )}
          title={isCompared ? "Remove from Compare" : "Add to Compare"}
        />
      )}

      {isGrid ? (
        <div className="flex flex-col gap-3">
          <div className="relative w-full rounded-lg overflow-hidden h-36">
            <img
              className="absolute inset-0 w-full h-full object-cover"
              src={
                images[0] ||
                "https://cdn.pixabay.com/photo/2017/04/10/22/28/residence-2219972_640.jpg"
              }
              alt={`${name} primary`}
            />
          </div>
          <h3 className="font-bold text-gray-900 md:text-[16px] text-[12px]">
            {name}
          </h3>

          <div className="grid md:grid-cols-2 grid-cols-2 gap-2">
            <InfoBlock
              icon={<LuPhone className="md:h-5 h-3 md:w-5 w-3 text-[#3586FF] " />}
              label="Developer"
              value={company?.developer || "N/A"}
            />
            <InfoBlock
              icon={
                <HiBadgeCheck className="md:h-5 h-3 md:w-5 w-3 text-[#3586FF] " />
              }
              label="Project Type"
              value={propertyType || "N/A"}
            />
            <InfoBlock
              icon={
                <LuMapPin className="md:h-5 h-3 md:w-5 w-3 text-[#3586FF] " />
              }
              label="Location"
              value={`${location?.locality}, ${location?.city}`}
            />
            <InfoBlock
              icon={<BiRupee className="md:h-5 h-3 md:w-5 w-3 text-[#3586FF] " />}
              label="Price"
              value={`₹ ${minPrice.toLocaleString()} - ₹ ${maxPrice.toLocaleString()}`}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button
              className="inline-flex items-center rounded-md text-white bg-blue-500 hover:bg-blue-700 px-4 py-1.5 text-[13px]"
              onClick={() => router.push(`/projects/${id}/projectdetails`)}
            >
              View Details
            </Button>
             <Button
                className="inline-flex items-center rounded-md text-white bg-blue-500 hover:bg-blue-700 px-4 py-1.5 text-[13px]"
                onClick={() => router.push(`/projects/${id}/viewleads`)}
              >
                View Leads
              </Button>
            <div className="min-w-[140px]">
              {renderDropdown("Promotion Badge", "promotionBadge", [
                "Featured",
                "Sponsored",
                "Verified",
                "Premium",
                "Top",
                "Popular",
              ])}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="md:w-[22%] w-full">
            <div className="flex flex-col gap-2">
              <div className="relative w-full rounded-lg overflow-hidden md:h-[120px] h-28">
                <img
                  className="absolute inset-0 w-full h-full object-cover"
                  src={
                    images[0] ||
                    "https://cdn.pixabay.com/photo/2017/04/10/22/28/residence-2219972_640.jpg"
                  }
                  alt={`${name} primary`}
                />
              </div>
              <div className="w-full flex gap-2">
                <div className="relative w-1/2 rounded-md overflow-hidden md:h-16 h-12">
                  <img
                    className="absolute inset-0 w-full h-full object-cover"
                    src={
                      images[1] ||
                      "https://cdn.pixabay.com/photo/2017/04/10/22/28/residence-2219972_640.jpg"
                    }
                    alt={`${name} secondary 1`}
                  />
                </div>
                <div className="relative w-1/2 rounded-md overflow-hidden md:h-16 h-12">
                  <img
                    className="absolute inset-0 w-full h-full object-cover"
                    src={
                      images[2] ||
                      "https://cdn.pixabay.com/photo/2017/04/10/22/28/residence-2219972_640.jpg"
                    }
                    alt={`${name} secondary 2`}
                  />
                  {images.length > 3 && (
                    <span className="absolute inset-0 bg-black/40 text-white flex items-center justify-center text-[11px] font-medium">
                      +{images.length - 2} photos
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-[58%] w-full flex flex-col justify-between">
            <div className="grid gap-y-3 gap-x-4 md:grid-cols-3 grid-cols-2 lg:grid-cols-4">
              <InfoBlock
                icon={
                  <LuUser className="md:h-5 h-3 md:w-5 w-3 text-[#3586FF] " />
                }
                label="Project Name"
                value={name}
              />
              <InfoBlock
                icon={
                  <LuPhone className="md:h-5 h-3 md:w-5 w-3 text-[#3586FF] " />
                }
                label="Developer"
                value={company?.developer || "N/A"}
              />
              <InfoBlock
                icon={
                  <LuMapPin className="md:h-5 h-3 md:w-5 w-3 text-[#3586FF] " />
                }
                label="Location"
                value={`${location?.locality}, ${location?.city}`}
              />
              <InfoBlock
                icon={
                  <LuCalendar className="md:h-5 h-3 md:w-5 w-3 text-[#3586FF] " />
                }
                label="Estd Year"
                value={company?.estdYear || "N/A"}
              />
              <InfoBlock
                icon={
                  <BiRupee className="md:h-5 h-3 md:w-5 w-3 text-[#3586FF] " />
                }
                label="Price Range"
                value={`₹ ${minPrice.toLocaleString()} - ₹ ${maxPrice.toLocaleString()}`}
              />
              <InfoBlock
                icon={
                  <HiBadgeCheck className="md:h-5 h-3 md:w-5 w-3 text-[#3586FF] " />
                }
                label="Project Type"
                value={propertyType || "N/A"}
              />
              <InfoBlock
                icon={
                  <FaRegEnvelope className="md:h-5 h-3 md:w-5 w-3 text-[#3586FF] " />
                }
                label="Company"
                value={company?.name || "N/A"}
              />
            </div>

            <div className="flex  md:gap-2 gap-1 justify-between items-center mt-3">
              <Button
                className="inline-flex items-center rounded-md text-white bg-blue-500 hover:bg-blue-700 px-4 py-1.5 text-[13px]"
                onClick={() => router.push(`/projects/${id}/projectdetails`)}
              >
                View Details
              </Button>
               <Button
                className="inline-flex items-center rounded-md text-white bg-blue-500 hover:bg-blue-700 px-4 py-1.5 text-[13px]"
                onClick={() => router.push(`/projects/${id}/viewleads`)}
              >
                View Leads
              </Button>
            </div>
          </div>

          <div className="md:w-[20%] w-full md:max-w-[240px]">
            {renderDropdown("Promotion Badge", "promotionBadge", [
              "Featured",
              "Sponsored",
              "Verified",
              "Premium",
              "Top",
              "Popular",
            ])}
          </div>
        </>
      )}
    </div>
  );
};

const InfoBlock = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div className="md:space-y-2 space-y-1">
    <div className="flex items-center md:gap-2 gap-1 md:text-sm text-[12px] text-gray-500">
      <div className="md:h-5 h-3 md:w-5 w-3 text-[#3586FF] ">{icon}</div>
      <span className="key-text ">{label}</span>
    </div>
    <p className=" key-text text-gray-900 break-words">{value}</p>
  </div>
);
