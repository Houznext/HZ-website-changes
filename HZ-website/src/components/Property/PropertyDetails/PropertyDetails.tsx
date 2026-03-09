import FloatingInput from "@/common/FormElements/FloatingInput";
import SelectBtnGrp from "@/common/SelectBtnGrp";
import usePostPropertyStore, {
  FlatshareAttributes,
  IPropertyDetails,
  SizeWithUnit,
} from "@/store/postproperty";
import { Button } from "@mui/material";
import { useState } from "react";
import {
  CommercialPropertyType,
  CommercialRentPropertyOptions,
  LookingType,
  propertyTypeEnum,
  PurposeType,
  rentPropertyType,
  sellPropertyType,
} from "./PropertyHelpers";
import PlotAndAgricultureDetails from "./PlotAndAgricultureDetails";
import ResidentialDetails from "./ResidentialDetails";
import PricingDetails from "./PricingDetails";
import ConstructionStatusDetails from "./ConstructionStatusDetails";
import apiClient from "@/utils/apiClient";
import CommericalDetails from "./CommericalDetails";
import CustomInput from "@/common/FormElements/CustomInput";
import FlatshareDetails from "./flatshareDetails";

export interface FurnishingItem {
  name: string;
  icon: JSX.Element;
}

const PropertyDetails = () => {
  const [error, setError] = useState<{ [key: string]: string }>({});

  const property = usePostPropertyStore((state) => state.getProperty());
  const { propertyDetails, locationDetails, basicDetails } = property;
  const setPropertyDetails = usePostPropertyStore(
    (state) => state.setPropertyDetails,
  );

  const handleChange = (
    key: keyof IPropertyDetails | `flatshare.${keyof FlatshareAttributes}`,
    value: any,
    nestedKey?: keyof SizeWithUnit,
  ) => {
    const updatedPropertyDetails: any = {
      ...propertyDetails,
    };

    if (typeof key === "string" && key.startsWith("flatshare.")) {
      const flatKey = key.replace(
        "flatshare.",
        "",
      ) as keyof FlatshareAttributes;

      const prevFlatshare = updatedPropertyDetails.flatshareAttributes ?? {};

      if (["bathroom", "balcony", "totalFloors"].includes(flatKey as string)) {
        if (typeof value === "number" && value > 999) value = 999;
      }

      updatedPropertyDetails.flatshareAttributes = {
        ...prevFlatshare,

        [flatKey]: nestedKey
          ? {
              ...(prevFlatshare[flatKey] as SizeWithUnit),
              [nestedKey]: value,
            }
          : value,
      };
    } else {
      updatedPropertyDetails[key as keyof IPropertyDetails] = value;
    }

    if (
      key === "propertyType" &&
      basicDetails?.purpose === PurposeType.Residential
    ) {
      if (
        value === propertyTypeEnum.Plot ||
        value === propertyTypeEnum.AgriculturalLand
      ) {
        updatedPropertyDetails.residentialAttributes = null;
        updatedPropertyDetails.constructionStatus = null;
        updatedPropertyDetails.furnishing = null;

        updatedPropertyDetails.flatshareAttributes = null;
      } else {
        updatedPropertyDetails.plotAttributes = null;
      }

      updatedPropertyDetails.commercialAttributes = null;
      updatedPropertyDetails.facilities = null;
      updatedPropertyDetails.pricingDetails = null;
    } else if (
      key === "propertyType" &&
      basicDetails?.purpose === PurposeType.Commercial
    ) {
      updatedPropertyDetails.constructionStatus = null;
      updatedPropertyDetails.residentialAttributes = null;

      updatedPropertyDetails.pricingDetails = {
        advanceAmount: 0,
        expectedPrice: 0,
        isNegotiable: false,
        maintenanceCharges: 0,
        monthlyRent: 0,
        pricePerSqft: 0,
        maxPriceOffer: 0,
        minPriceOffer: 0,
        securityDeposit: 0,
      };

      updatedPropertyDetails.plotAttributes = null;
      updatedPropertyDetails.commercialAttributes = null;
      updatedPropertyDetails.furnishing = null;
      updatedPropertyDetails.occupancyDetails = null;
      updatedPropertyDetails.facilities = null;

      updatedPropertyDetails.flatshareAttributes = null;
    }

    setPropertyDetails({
      ...property,
      propertyDetails: updatedPropertyDetails,
    });
  };

  return (
    <div className="flex flex-col w-full">
      {/* City & Property Name */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <CustomInput
          label="City"
          labelCls="text-sm text-slate-700 font-medium"
          placeholder="Enter City Name"
          className="md:px-3 px-2 rounded-lg bg-slate-50 border-slate-200 md:py-1 py-0.5"
          value={locationDetails?.city || ""}
          name="city"
          type="text"
          onChange={() => {}}
          disabled
          required
        />

        <CustomInput
          label="Property Name"
          type="text"
          labelCls="text-sm text-slate-700 font-medium"
          placeholder="Enter Property Name"
          value={propertyDetails?.propertyName}
          className="md:px-3 px-2 rounded-lg border-slate-200 focus:border-[#3586FF] md:py-1 py-0.5 transition-colors"
          name="propertyName"
          maxLength={40}
          onChange={(e) => handleChange("propertyName", e.target.value)}
          errorMsg={error?.propertyName}
          required
        />
      </div>

      {/* Property Type */}
      <div className="mb-6">
        {basicDetails?.purpose === PurposeType.Residential ? (
          <SelectBtnGrp
            label="Property Type"
            labelCls="text-sm text-slate-700 font-medium mb-2"
            options={
              basicDetails?.lookingType === LookingType.Sell
                ? sellPropertyType
                : rentPropertyType
            }
            required
            className="flex flex-wrap gap-2"
            btnClass="text-xs font-medium rounded-lg px-4 py-2 border border-slate-200 hover:border-[#3586FF] transition-colors"
            onSelectChange={(value) =>
              handleChange(
                "propertyType",
                typeof value === "object" && value && "name" in value
                  ? value.name
                  : value,
              )
            }
            slant={false}
            defaultValue={propertyDetails?.propertyType}
            error={error?.propertyType}
          />
        ) : (
          <SelectBtnGrp
            options={CommercialPropertyType}
            className="flex flex-wrap gap-2"
            btnClass="text-xs font-medium rounded-lg px-4 py-2 border border-slate-200 hover:border-[#3586FF] transition-colors"
            onSelectChange={(value) =>
              handleChange(
                "propertyType",
                typeof value === "object" && value && "name" in value
                  ? value.name
                  : value,
              )
            }
            required
            label="Property Type"
            labelCls="text-sm text-slate-700 font-medium mb-2"
            slant={false}
            defaultValue={propertyDetails?.propertyType}
            error={error?.propertyType}
          />
        )}
      </div>

      {/* Property Type Specific Details */}
      <div className="mb-6">
        {propertyDetails?.propertyType === propertyTypeEnum.Plot ||
        propertyDetails?.propertyType === propertyTypeEnum.AgriculturalLand ? (
          <PlotAndAgricultureDetails />
        ) : basicDetails?.purpose === PurposeType.Residential ? (
          basicDetails?.lookingType === LookingType.FlatShare ? (
            <FlatshareDetails />
          ) : (
            <>
              <ResidentialDetails />
              <ConstructionStatusDetails error={{}} />
            </>
          )
        ) : (
          <CommericalDetails />
        )}
      </div>

      {/* Pricing Details */}
      <div className="mb-6">
        <PricingDetails error={error} />
      </div>

      {/* Additional Info */}
      <div className="max-w-lg">
        <CustomInput
          label="Additional Property Information"
          labelCls="text-sm text-slate-700 font-medium"
          type="textarea"
          value={propertyDetails?.description}
          className="px-3 rounded-lg border-slate-200 focus:border-[#3586FF] transition-colors min-h-[100px] text-sm"
          name="description"
          onChange={(e) => handleChange("description", e.target.value)}
          errorMsg={error.description}
        />
      </div>
    </div>
  );
};

export default PropertyDetails;
