import Button from "@/src/common/Button";
import apiClient from "@/src/utils/apiClient";
import { Menu } from "@headlessui/react";
import {
  ChevronDownIcon,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileCheck,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { BiRupee } from "react-icons/bi";
import { CgTrash } from "react-icons/cg";
import {
  FaBed,
  FaCity,
  FaCouch,
  FaEdit,
  FaHome,
  FaRulerCombined,
} from "react-icons/fa";
import { twMerge } from "tailwind-merge";
import {
  MdStar,
  MdAttachMoney,
  MdVerified,
  MdWorkspacePremium,
  MdPeopleAlt,
  MdTrendingUp,
} from "react-icons/md";
import { HiBadgeCheck } from "react-icons/hi";
import Loader from "@/src/common/Loader";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";
import Modal from "@/src/common/Modal";

interface PropertyCardProps {
  property: any;
  handleView: (property: any) => void;
  handleEdit: (property: any) => void;
  handleDelete: (id: number) => void;
  handleApprove?: (id: number) => void;
  handleReject?: (id: number, reason?: string) => void;
  handlePublish?: (id: number, alsoApprove?: boolean) => void;
  setProperty: (property: any) => void;
  hasPermission: any;
  variant: any;
}

export const promotionBadges = [
  "Featured",
  "Sponsored",
  "Verified",
  "Premium",
  "Top",
  "Popular",
];
export const promotionBadgeMap: Record<string, string> = promotionBadges.reduce(
  (acc, badge) => {
    acc[badge.toLowerCase()] = badge;
    return acc;
  },
  {} as Record<string, string>,
);

const PropertyCard = ({
  property,
  handleView,
  handleEdit,
  handleDelete,
  handleApprove,
  handleReject,
  handlePublish,
  setProperty,
  hasPermission,
  variant,
}: PropertyCardProps) => {
  const router = useRouter();
  const [promotions, setPromotions] = useState<string[]>(
    property?.promotionType || [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Property status helpers
  const isPosted = property?.isPosted;
  const isApproved = property?.isApproved;
  const isPendingApproval = isPosted && !isApproved;
  const isDraft = !isPosted;

  // Get status badge
  const getStatusBadge = () => {
    if (isApproved) {
      return {
        label: "Approved",
        color: "bg-green-100 text-green-700 border-green-300",
        icon: <CheckCircle className="w-3 h-3" />,
      };
    }
    if (isPendingApproval) {
      return {
        label: "Pending Review",
        color: "bg-yellow-100 text-yellow-700 border-yellow-300",
        icon: <Clock className="w-3 h-3" />,
      };
    }
    if (isDraft) {
      return {
        label: "Draft",
        color: "bg-blue-100 text-blue-700 border-blue-300",
        icon: <FileCheck className="w-3 h-3" />,
      };
    }
    return null;
  };

  const statusBadge = getStatusBadge();
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openDeleteModal = () => setDeleteModal(true);

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await handleDelete(property.propertyId); // parent fn (API + state update)
      setDeleteModal(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleSelect = (option: string) => {
    setPromotions((prev) =>
      prev?.includes(option)
        ? prev?.filter((item) => item !== option)
        : [...prev, option],
    );
  };
  const images: string[] = property?.mediaDetails?.propertyImages ?? [];
  const hero = images[0] || "/images/buy_home.webp";

  const name = property?.propertyDetails?.propertyName || "—";
  const city = property?.locationDetails?.city || "—";
  const type = property?.propertyDetails?.propertyType || "—";
  // const size =
  //   property?.propertyDetails?.residentialAttributes?.buildupArea?.size || "";
  // const unit =
  //   property?.propertyDetails?.residentialAttributes?.buildupArea?.unit || "";
  // const bhk = property?.propertyDetails?.residentialAttributes?.bhk || "—";
  const furnished = property?.propertyDetails?.furnishing?.furnishedType || "—";
  const price =
    property?.propertyDetails?.pricingDetails?.expectedPrice ??
    property?.propertyDetails?.pricingDetails?.monthlyRent;
  const borderByPromo = promotions.includes("Featured")
    ? "border-amber-300"
    : promotions.includes("Sponsored")
      ? "border-emerald-300"
      : promotions.includes("Verified")
        ? "border-sky-300"
        : promotions.includes("Premium")
          ? "border-violet-300"
          : promotions.includes("Top")
            ? "border-pink-300"
            : promotions.includes("Popular")
              ? "border-orange-300"
              : "border-gray-200";
  console.log(property);

  const handleClose = async () => {
    setIsLoading(true);

    try {
      const response = await apiClient.patch(
        `${apiClient.URLS.property}/admin/${property.propertyId}/promotion`,
        {
          promotionType: promotions,
          approvedBy: "admin",
          updatedBy: "admin",
        },
        true,
      );

      if (!response.ok) {
        console.error("Failed to update promotions");
        return;
      }
      toast.success("promotion updated successfully!");
      setProperty((prev) => ({
        ...prev,
        promotions,
      }));
      console.log("Patch success:", response.data);
    } catch (error) {
      console.error("API error:", error);
    } finally {
      setIsLoading(false);
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
  const isFlatShare =
    property?.basicDetails?.lookingType === "Flat Share" ||
    property?.basicDetails?.purpose === "Flat Share";
  const size = isFlatShare
    ? property?.propertyDetails?.flatshareAttributes?.floorArea?.size || ""
    : property?.propertyDetails?.residentialAttributes?.buildupArea?.size || "";

  const unit = isFlatShare
    ? property?.propertyDetails?.flatshareAttributes?.floorArea?.unit || ""
    : property?.propertyDetails?.residentialAttributes?.buildupArea?.unit || "";
  const bhk = isFlatShare
    ? property?.propertyDetails?.flatshareAttributes?.bhk || "—"
    : property?.propertyDetails?.residentialAttributes?.bhk || "—";

  const renderDropdown = (label: string, key: string, options?: string[]) => {
    if (!options) return null;
    const displayLabel =
      promotions?.length > 0 ? promotions?.join(", ") : label;

    return (
      <div className="relative md:w-[100%]">
        <Menu as="div" className="inline-block text-left md:w-[100%] ">
          {({ open, close }) => (
            <>
              <Menu.Button
                className={`flex items-center border md:w-[100%] md:text-[${
                  promotions?.length > 2 ? "11px" : "13px"
                }] text-[10px] md:px-4 px-2 md:py-[6px] py-[3px] rounded-md font-medium bg-white text-black hover:bg-gray-100 flex items-center`}
              >
                {iconMap[displayLabel]} {displayLabel}
                <ChevronDownIcon className="w-4 h-4 ml-auto" />
              </Menu.Button>

              {open && (
                <Menu.Items className="md:absolute relative mt-1 w-auto md:w-[100%] bg-white border rounded-md shadow-lg md:max-h-60 md:overflow-auto p-2 z-50">
                  {options.map((option) => (
                    <div key={option}>
                      <Button
                        type="button"
                        onClick={() => handleSelect(option)}
                        className={` w-full border-[1px] key-text border-gray-200 font-medium px-4 py-1 text-left flex items-center ${
                          promotions?.includes(option)
                            ? "bg-[#5297ff] text-white"
                            : "bg-gray-100"
                        }`}
                      >
                        <span>{iconMap[option]}</span>
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
                      showTooltip={!hasPermission("property", "edit")}
                    >
                      <Button
                        className="bg-[#5297ff] btn-text text-white md:px-3 px-1 md:py-1 py-1 md:rounded-[6px] rounded-[4px]"
                        onClick={() => {
                          handleClose();
                          close();
                        }}
                        disabled={!hasPermission("property", "edit")}
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
      </div>
    );
  };
  if (variant === "cards") {
    return (
      <div
        className={twMerge(
          "relative flex h-full flex-col overflow-hidden md:rounded-[10px] rounded-[4px] border bg-white shadow-sm hover:shadow-md transition",
          borderByPromo,
        )}
      >
        <div className="relative aspect-[18/10] w-full bg-gray-100">
          <Image src={hero} alt={name} fill className="object-cover" />

          {/* Status Badge */}
          {statusBadge && (
            <div className="absolute top-2 right-2 z-20">
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border ${statusBadge.color} bg-white/90 backdrop-blur-sm`}
              >
                {statusBadge.icon}
                {statusBadge.label}
              </div>
            </div>
          )}

          {promotions.length > 0 && (
            <div className="absolute md:top-0 top-0 left-0 flex flex-row gap-1 items-end z-10">
              {promotions.map((type) => {
                const capitalizedType =
                  type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

                const colorMap = {
                  Featured: "bg-amber-100 text-amber-700 border-amber-300",
                  Sponsored:
                    "bg-emerald-100 text-emerald-700 border-emerald-300",
                  Verified: "bg-sky-100 text-sky-700 border-sky-300",
                  Premium: "bg-violet-100 text-violet-700 border-violet-300",
                  Top: "bg-pink-100 text-pink-700 border-pink-400",
                  Popular: "bg-orange-100 text-orange-700 border-orange-400",
                };

                return (
                  <div
                    key={type}
                    className="relative  mb-3 w-32 flex justify-center"
                  >
                    <span
                      className={` inline-flex items-center
          md:px-3 px-2 md:py-[4x] py-[3px]
       rounded-tl-[15px] rounded-tr-[2px] rounded-bl-[1px] rounded-br-[20px]
          md:text-[12px] text-[10px]
          font-medium 
          border
          shadow-md
          backdrop-blur-md  ${colorMap[capitalizedType]}`}
                    >
                      {iconMap[capitalizedType] || null}
                      <span>{capitalizedType}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="absolute bottom-2 right-3 z-10">
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

        <div className="p-3 md:p-3 flex flex-col md:gap-2 gap-1 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-[12px] md:text-[14px] ">{name}</h3>
            {price != null && (
              <div className="shrink-0 text-right">
                <div className="flex items-center gap-1 font-bold md:text-[14px] text-[12px]">
                  <BiRupee />
                  {Number(price).toLocaleString("en-IN")}{" "}
                  {(property?.basicDetails?.lookingType === "Rent" ||
                    property?.basicDetails?.lookingType === "Flat Share") && (
                    <span>/Month</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Meta chip icon={<FaCity />} text={city} />
            <Meta chip icon={<FaHome />} text={type} />
            <Meta chip icon={<FaBed />} text={bhk || "—"} />

            <Meta
              chip
              icon={<FaRulerCombined />}
              text={`${size || ""} ${unit || ""}`}
            />

            {!isFlatShare && <Meta chip icon={<FaCouch />} text={furnished} />}
          </div>

          <div className="mt-1 h-px bg-gray-100" />

          <div className=" grid grid-cols-2 md:grid-cols-2 gap-1 w-full">
            <Button
              className="flex-1 md:px-2 px-3 py-1 rounded md:text-[12px] label-text key-text font-medium text-nowrap text-white bg-[#3586FF]"
              onClick={() => handleView(property)}
            >
              View Details
            </Button>
            <Button
              className="flex-1 md:px-2 px-3 py-1 rounded label-text md:text-[12px] key-text font-medium text-nowrap text-white bg-[#3586FF]"
              onClick={() => {
                setProperty(property);
                router.push(`/property/${property.propertyId}/viewleads`);
              }}
            >
              View Leads
            </Button>
            <Button
              className="flex-1 md:px-2 px-3 py-1 rounded  md:text-[12px] label-text key-text font-medium text-nowrap text-white bg-[#3586FF]"
              onClick={() => {
                setProperty(property);
                router.push(`/property/${property.propertyId}/viewanalytics`);
              }}
            >
              View Analytics
            </Button>
            
              {property?.isReferAndEarnEnabled===true && (
              <Button
                className="flex-1 md:px-2 px-3 py-1 rounded md:text-[12px] label-text key-text font-medium text-nowrap text-white bg-[#3586FF]"
                onClick={() => {
                  setProperty(property);
                  router.push(`/property/${property.propertyId}/viewreferrals`);
              }}
            >
              View Referrals
            </Button>)}
          </div>

          {/* Approval Actions for Pending Properties */}
          {isPendingApproval && handleApprove && handleReject && (
            <div className="flex gap-1.5 w-full">
              <Button
                className="flex-1 py-1 rounded text-[10px] font-medium text-white bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center gap-1"
                onClick={() => handleApprove(property.propertyId)}
                disabled={!hasPermission("property", "edit")}
              >
                <CheckCircle className="w-3 h-3" /> Approve
              </Button>
              <Button
                className="flex-1 py-1 rounded text-[10px] font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center gap-1"
                onClick={() => handleReject?.(property.propertyId)}
                disabled={!hasPermission("property", "edit")}
              >
                <XCircle className="w-3 h-3" /> Reject
              </Button>
            </div>
          )}

          {/* Publish Actions for Draft Properties */}
          {isDraft && handlePublish && (
            <div className="flex gap-1.5 w-full">
              <Button
                className="flex-1 py-1 rounded text-[10px] font-medium text-white bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center gap-1"
                onClick={() => handlePublish(property.propertyId, true)}
                disabled={!hasPermission("property", "edit")}
              >
                <CheckCircle className="w-3 h-3" /> Publish
              </Button>
              <Button
                className="flex-1 py-1 rounded text-[10px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center justify-center gap-1"
                onClick={() => handlePublish(property.propertyId, false)}
                disabled={!hasPermission("property", "edit")}
              >
                <Eye className="w-3 h-3" /> Post Only
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <CustomTooltip
              label="Access Restricted Contact Admin"
              position="bottom"
              tooltipBg="bg-black/60 backdrop-blur-md"
              tooltipTextColor="text-white py-2 px-4 font-medium"
              labelCls="text-[10px] font-medium"
              showTooltip={!hasPermission("property", "edit")}
            >
              <Button
                className="py-1 rounded font-medium md:px-4 px-2 btn-text text-[#605F5F] bg-[#E2E2E2] flex items-center justify-center gap-1 self-auto"
                onClick={() => handleEdit(property)}
                disabled={!hasPermission("property", "edit")}
              >
                <FaEdit /> Edit
              </Button>
            </CustomTooltip>
            <CustomTooltip
              label="Access Restricted Contact Admin"
              position="bottom"
              tooltipBg="bg-black/60 backdrop-blur-md"
              tooltipTextColor="text-white py-2 px-4 font-medium"
              labelCls="text-[10px] font-medium"
              showTooltip={!hasPermission("property", "delete")}
            >
              <Button
                className="py-1 rounded font-medium md:px-4 px-2 btn-text text-[#CA4D37] bg-[#E2E2E2] flex justify-center items-center gap-1 self-auto"
                // onClick={() => handleDelete(property.propertyId)}
                onClick={openDeleteModal}
                disabled={!hasPermission("property", "delete")}
              >
                <CgTrash /> Delete
              </Button>
            </CustomTooltip>
          </div>

          {/* Approval Info & Owner */}
          <div className="mt-1 pt-1.5 border-t border-gray-100 text-[10px] text-gray-500 space-y-0.5">
            {isApproved && property?.approvedBy && (
              <p>
                Approved:{" "}
                <span className="text-emerald-600">{property.approvedBy}</span>
                {property?.approvedDate &&
                  ` • ${new Date(property.approvedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`}
              </p>
            )}
            {property?.owner && (
              <p>
                By:{" "}
                <span className="text-gray-600">
                  {property.owner.name || property.owner.email}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className={twMerge(
        "w-full relative rounded max-md:px-3 flex md:flex-row flex-col gap-4 p-2 shadow shadow-gray-200 border-[1px] border-gray-200",
        property?.promotionType?.includes("Featured")
          ? "border-amber-300 border-2 shadow-custom"
          : property?.promotionType?.includes("Sponsored")
            ? "border-emerald-300 border-2 shadow-custom"
            : property?.promotionType?.includes("Verified")
              ? "border-sky-500 border-2 shadow-custom"
              : property?.promotionType?.includes("Premium")
                ? "border-violet-400 border-2 shadow-custom"
                : property?.promotionType?.includes("Top")
                  ? "border-pink-400 border-2 shadow-custom"
                  : property?.promotionType?.includes("Popular")
                    ? "border-orange-400 border-2 shadow-custom"
                    : "border-gray-400",
      )}
    >
      {property?.promotionType?.length > 0 && (
        <div className="absolute md:top-0 top-0 left-0 flex flex-row gap-1 items-end z-10">
          {property.promotionType.map((type, index) => {
            const capitalizedType =
              type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

            const colorMap = {
              Featured: "bg-amber-100 text-amber-700 border-amber-300",
              Sponsored: "bg-emerald-100 text-emerald-700 border-emerald-300",
              Verified: "bg-sky-100 text-sky-700 border-sky-300",
              Premium: "bg-violet-100 text-violet-700 border-violet-300",
              Top: "bg-pink-100 text-pink-700 border-pink-400",
              Popular: "bg-orange-100 text-orange-700 border-orange-400",
            };

            return (
              <div
                key={type}
                className="relative  mb-3 w-32 flex justify-center"
              >
                <span
                  className={` inline-flex items-center
          md:px-3 px-2 md:py-[4x] py-[3px]
       rounded-tl-[15px] rounded-tr-[2px] rounded-bl-[1px] rounded-br-[20px]
          md:text-[12px] text-[10px]
          font-medium 
          border
          shadow-md
          backdrop-blur-md  ${colorMap[capitalizedType]}`}
                >
                  {iconMap[capitalizedType] || null}
                  <span>{capitalizedType}</span>
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="md:w-1/5 flex flex-col gap-2">
        <div className="relative w-full md:h-[90px] h-20">
          <Image
            className="absolute bg-cover"
            src={
              property.mediaDetails?.propertyImages?.[0] ||
              "/images/buy_home.webp"
            }
            alt="image 1"
            fill
          />
        </div>
        <div className="w-full flex flex-row  gap-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="relative w-[50%] h-14 rounded overflow-hidden"
            >
              <Image
                className="absolute"
                bg-cover
                src={
                  property.mediaDetails?.propertyImages?.[i] ||
                  "/images/buy_home.webp"
                }
                alt={`image ${i + 1}`}
                fill
              />
              {i === 2 && property.mediaDetails?.propertyImages?.length > 2 && (
                <span className="w-full h-full text-[12px] font-medium bg-black bg-opacity-40 absolute z-10 flex justify-center items-center text-white">
                  +{property.mediaDetails?.propertyImages?.length - 2} photos
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="md:w-3/5 flex flex-col justify-between gap-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-3">
          <InfoBlock
            label="Name"
            value={property.propertyDetails?.propertyName}
          />
          <IconBlock
            icon={<FaCity />}
            label="City"
            value={property.locationDetails?.city}
          />
          <IconBlock
            icon={<FaHome />}
            label="Property Type"
            value={property.propertyDetails?.propertyType}
          />
          {property?.basicDetails?.purpose === "Commercial" ? (
            <InfoBlock
              label="Area"
              value={`${
                property.propertyDetails?.commercialAttributes?.buildupArea
                  ?.size || ""
              } ${
                property.propertyDetails?.commercialAttributes?.buildupArea
                  ?.unit || ""
              }`}
            />
          ) : (
            <InfoBlock
              label="Area"
              value={
                isFlatShare
                  ? `${
                      property.propertyDetails?.flatshareAttributes?.floorArea
                        ?.size || ""
                    } ${
                      property.propertyDetails?.flatshareAttributes?.floorArea
                        ?.unit || ""
                    }`
                  : `${
                      property.propertyDetails?.residentialAttributes
                        ?.buildupArea?.size || ""
                    } ${
                      property.propertyDetails?.residentialAttributes
                        ?.buildupArea?.unit || ""
                    }`
              }
            />
          )}
          {property?.basicDetails?.purpose !== "Commercial" && (
            <>
              <IconBlock icon={<FaBed />} label="No of BHK" value={bhk} />
              {property?.basicDetails?.lookingType !== "Flat Share" && (
                <IconBlock
                  icon={<FaCouch />}
                  label="Furniture Type"
                  value={property.propertyDetails?.furnishing?.furnishedType}
                />
              )}
            </>
          )}
          {property.propertyDetails?.pricingDetails?.expectedPrice ? (
            <IconBlock
              icon={<BiRupee />}
              label="Expected Price"
              value={property.propertyDetails?.pricingDetails?.expectedPrice}
            />
          ) : (
            <IconBlock
              icon={<BiRupee />}
              label="Monthly Rent"
              value={property.propertyDetails?.pricingDetails?.monthlyRent}
            />
          )}
        </div>

        <div className="flex md:flex-nowrap flex-wrap justify-center items-center md:gap-x-[50px] mt-5 md:mt-8 gap-x-[25px] gap-y-2 w-full">
          <Button
            className="md:px-5 px-3  py-1 rounded label-text key-text font-medium text-nowrap text-white bg-[#3586FF]"
            onClick={() => handleView(property)}
          >
            View Details
          </Button>
          <Button
            className="md:px-5 px-3  py-1 label-text key-text  rounded font-medium text-nowrap text-white bg-[#3586FF]"
            onClick={() => {
              setProperty(property);
              router.push(`/property/${property.propertyId}/viewleads`);
            }}
          >
            View Leads
          </Button>
          <Button
            className="md:px-5 px-3  py-1 label-text rounded font-medium  key-text text-nowrap text-white bg-[#3586FF]"
            onClick={() => {
              setProperty(property);
              router.push(`/property/${property.propertyId}/viewanalytics`);
            }}
          >
            View Analytics
          </Button>
         {property?.isReferAndEarnEnabled===true && (
              <Button
                className="md:px-5 px-3  py-1 label-text rounded font-medium  key-text text-nowrap text-white bg-[#3586FF]"
                onClick={() => {
                  setProperty(property);
                  router.push(`/property/${property.propertyId}/viewreferrals`);
              }}
            >
              View Referrals
            </Button>)}
        </div>
      </div>

      <div className="md:w-[18%] flex md:flex-col gap-2 justify-center pr-5 items-start">
        {/* Status Badge */}
        {statusBadge && (
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${statusBadge.color}`}
          >
            {statusBadge.icon}
            {statusBadge.label}
          </div>
        )}

        {/* Approval Info */}
        {isApproved && property?.approvedBy && (
          <p className="text-[10px] text-gray-500">
            By:{" "}
            <span className="font-medium text-emerald-600">
              {property.approvedBy}
            </span>
            {property?.approvedDate &&
              ` • ${new Date(property.approvedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`}
          </p>
        )}

        {/* Approval Actions for Pending Properties */}
        {isPendingApproval && handleApprove && handleReject && (
          <div className="flex gap-1.5 w-full">
            <Button
              className="flex-1 py-1 rounded text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center gap-1"
              onClick={() => handleApprove(property.propertyId)}
              disabled={!hasPermission("property", "edit")}
            >
              <CheckCircle className="w-3 h-3" /> Approve
            </Button>
            <Button
              className="flex-1 py-1 rounded text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center gap-1"
              onClick={() => setShowRejectModal(true)}
              disabled={!hasPermission("property", "edit")}
            >
              <XCircle className="w-3 h-3" /> Reject
            </Button>
          </div>
        )}

        {/* Publish Actions for Draft Properties */}
        {isDraft && handlePublish && (
          <div className="flex flex-col gap-1.5 w-full">
            <Button
              className="w-full py-1 rounded text-xs font-medium text-white bg-orange-400 hover:bg-orange-500 flex items-center justify-center gap-1"
              onClick={() => handlePublish(property.propertyId, true)}
              disabled={!hasPermission("property", "edit")}
            >
              <CheckCircle className="w-3 h-3" /> Publish & Approve
            </Button>
            <Button
              className="w-full py-1 rounded text-xs font-medium text-amber-700 bg-amber-100 hover:bg-gray-200 border border-amber-300 flex items-center justify-center gap-1"
              onClick={() => handlePublish(property.propertyId, false)}
              disabled={!hasPermission("property", "edit")}
            >
              <Eye className="w-3 h-3" /> Publish Only
            </Button>
          </div>
        )}

        {renderDropdown("Promotion Badge", "promotionBadge", [
          "Featured",
          "Sponsored",
          "Verified",
          "Premium",
          "Top",
          "Popular",
        ])}
        <CustomTooltip
          label="Access Restricted Contact Admin"
          position="bottom"
          tooltipBg="bg-black/60 backdrop-blur-md"
          tooltipTextColor="text-white py-2 px-4 font-medium"
          labelCls="text-[10px] font-medium"
          showTooltip={!hasPermission("property", "edit")}
        >
          <Button
            className="py-1 rounded font-medium md:px-4 px-2 btn-text text-[#605F5F] bg-[#E2E2E2] flex items-center justify-center gap-1 self-auto"
            onClick={() => handleEdit(property)}
            // disabled={hasPermission("property", "edit")}
          >
            <FaEdit /> Edit
          </Button>
        </CustomTooltip>
        <CustomTooltip
          label="Access Restricted Contact Admin"
          position="bottom"
          tooltipBg="bg-black/60 backdrop-blur-md"
          tooltipTextColor="text-white py-2 px-4 font-medium"
          labelCls="text-[10px] font-medium"
          showTooltip={!hasPermission("property", "delete")}
        >
          <Button
            className="py-1 rounded font-medium md:px-4 px-2 btn-text text-[#CA4D37] bg-[#E2E2E2] flex justify-center items-center gap-1 self-auto"
            // onClick={() => handleDelete(property.propertyId)}
            onClick={openDeleteModal}
            disabled={!hasPermission("property", "delete")}
          >
            <CgTrash /> Delete
          </Button>
        </CustomTooltip>

        {/* Owner Info */}
        {property?.owner && (
          <p className="text-[10px] text-gray-400">
            By:{" "}
            <span className="text-gray-600">
              {property.owner.name || property.owner.email}
            </span>
          </p>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">Reject Property</h3>
            <p className="text-gray-600 text-sm mb-4">
              Please provide a reason for rejection (optional):
            </p>
            <textarea
              className="w-full border rounded-lg p-3 text-sm resize-none"
              rows={3}
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <Button
                className="flex-1 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 py-2 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600"
                onClick={() => {
                  handleReject?.(property.propertyId, rejectReason);
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        </div>
      )}
      <Modal
        isOpen={deleteModal}
        closeModal={() => setDeleteModal(false)}
        className="md:max-w-[480px] max-w-[340px] rounded-xl"
        rootCls="flex items-center justify-center z-[9999]"
        isCloseRequired={false}
        title="Delete property?"
        titleCls="font-semibold text-[16px] text-center text-gray-900"
      >
        <div className="px-2 md:px-4 pb-2">
          <p className="mt-2 text-[13px] text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-medium text-gray-900">{name}</span>?
            <br />
            This action cannot be undone.
          </p>

          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              className="bg-gray-100 text-gray-700 md:px-4 px-2 md:py-2 py-1  btn-text font-medium rounded-md"
              onClick={() => setDeleteModal(false)}
              disabled={deleting}
            >
              Cancel
            </Button>

            <Button
              type="button"
              className="bg-red-600 text-white md:px-4 px-2 md:py-2 py-1  btn-text font-medium rounded-md"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Yes, Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const InfoBlock = ({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined;
}) => (
  <div className="flex flex-col">
    <p className="font-medium text-gray-400 key-text">{label}</p>
    <p className="font-medium key-text">{value}</p>
  </div>
);

const IconBlock = ({
  icon,
  label,
  value,
}: {
  icon: JSX.Element;
  label: string;
  value: string | number | undefined;
}) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-2 md:text-sm text-[12px] text-gray-400">
      {icon}
      <span className="font-medium key-text">{label}</span>
    </div>
    <p className="font-medium key-text">{value}</p>
  </div>
);

const Meta = ({
  chip,
  icon,
  text,
}: {
  chip?: boolean;
  icon?: JSX.Element;
  text: string;
}) => (
  <span
    className={
      chip
        ? "inline-flex items-center gap-1.5 text-[10px] px-2 py-[3px] rounded-full bg-gray-50 border border-gray-200 text-gray-700"
        : ""
    }
  >
    {icon} {text}
  </span>
);

export default PropertyCard;
