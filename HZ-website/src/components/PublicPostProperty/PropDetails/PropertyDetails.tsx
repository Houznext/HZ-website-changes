import SelectBtnGrp from "@/common/SelectBtnGrp";
import usePostPropertyStore, { IPropertyDetails } from "@/store/postproperty";
import { useState } from "react";
import {
  CommercialPropertyType,
  propertyTypeEnum,
  rentPropertyType,
  sellPropertyType,
  CommercialPropertyTypeEnum,
} from "../PropertyHelpers";
import PlotAndAgricultureDetails from "./PlotAndAgricultureDetails";
import ResidentialDetails from "./ResidentialDetails";
import PricingDetails from "./PricingDetails";
import ConstructionStatusDetails from "./ConstructionStatusDetails";
import apiClient from "@/utils/apiClient";
import CommericalDetails from "./CommericalDetails";
import CustomInput from "@/common/FormElements/CustomInput";
import {
  LookingType,
  PurposeType,
} from "@/components/Property/PropertyDetails/PropertyHelpers";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";
import { propertyValidations } from "../PropertyValidations";
import FlatshareDetails from "./flatshareDetails";
import Button from "@/common/Button";

export interface FurnishingItem {
  name: string;
  icon: JSX.Element;
}

const PropertyDetails = ({
  handleNext,
  user,
}: {
  handleNext: () => void;
  user: any;
}) => {
  const property = usePostPropertyStore((state) => state.getProperty());
  const { propertyDetails, locationDetails, basicDetails } = property;

  const setPropertyDetails = usePostPropertyStore(
    (state) => state.setPropertyDetails
  );
  const setProperty = usePostPropertyStore((state) => state.setProperty);
  const { errors, setErrors } = usePostPropertyStore();
  const [loading, setLoading] = useState(false);

  const handleChange = (key: keyof IPropertyDetails, value: any) => {
    const updatedPropertyDetails = {
      ...propertyDetails,
      [key]: value,
    };

    if (key === "description") {
      const filteredValue = value.replace(/[^a-zA-Z0-9\s,.\-_/]/g, "");
      updatedPropertyDetails[key] = filteredValue;
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
        advanceAmount: null,
        expectedPrice: null,
        isNegotiable: false,
        maintenanceCharges: null,
        monthlyRent: null,
        pricePerSqft: null,
        maxPriceOffer: null,
        minPriceOffer: null,
        securityDeposit: null,
      };
      updatedPropertyDetails.plotAttributes = null;
      updatedPropertyDetails.commercialAttributes = null;
      updatedPropertyDetails.furnishing = null;
      updatedPropertyDetails.flatshareAttributes = null;
      updatedPropertyDetails.occupancyDetails = null;
      updatedPropertyDetails.facilities = null;
    }

    setPropertyDetails({
      ...property,
      propertyDetails: updatedPropertyDetails,
    });
  };

  const validate = () => {
    const validationErrors = propertyValidations(
      propertyDetails,
      basicDetails,
      locationDetails,
      property
    );

    console.log("Validation Errors:", validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    const residentialAttributes =
      property.propertyDetails?.residentialAttributes;
    const floorArea = residentialAttributes?.floorArea;
    const buildupArea = residentialAttributes?.buildupArea;

    const validUnits = [
      "sq.ft",
      "sq.yard",
      "sq.meter",
      "acre",
      "cent",
      "marla",
    ];
    const isPlotOrAgri =
      propertyDetails?.propertyType === propertyTypeEnum.Plot ||
      propertyDetails?.propertyType === propertyTypeEnum.AgriculturalLand;

    const isOffice =
      propertyDetails?.propertyType === CommercialPropertyTypeEnum.OFFICE;
    const isFlatShare = basicDetails?.lookingType === LookingType.FlatShare;
    const isCommercial = basicDetails?.purpose === PurposeType.Commercial;

    if (!isPlotOrAgri && !isOffice && !isFlatShare && !isCommercial) {
      if (!floorArea?.size || floorArea.size <= 0) {
        toast.error("Please enter a valid Floor Area size");
        return;
      }

      if (!floorArea?.unit || !validUnits.includes(floorArea.unit)) {
        toast.error("Please select a valid unit for Floor Area");
        return;
      }

      if (!buildupArea?.size || buildupArea.size <= 0) {
        toast.error("Please enter a valid Built-up Area size");
        return;
      }

      if (!buildupArea.unit || !validUnits.includes(buildupArea.unit)) {
        toast.error("Please select a valid unit for Built-up Area");
        return;
      }
    }

    if (!validate()) return;
    try {
      setLoading(true);
      const res = await apiClient.patch(
        `${apiClient.URLS.post_property}/property-details/${property.propertyId}`,
        property.propertyDetails,
        true
      );

      if (res?.status === 200) {
        setProperty(res.body);
        setLoading(false);
        toast.success("Property details updated successfully!");
        handleNext();
      }
    } catch (error) {
      setLoading(false);
      console.log("error", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  if (loading)
    return <Loader />;

  return (
    <div className="flex flex-col md:mb-16 mb-5">
      {/* Header */}
      <h1 className="text-lg md:text-xl font-bold text-[#3586FF] mb-1">Property Details</h1>
      <p className="text-sm text-slate-500 mb-5">
        Tell us more about your property
      </p>

      {/* Basic Info */}
      <div className="flex flex-col gap-3 mb-4">
        <CustomInput
          label="City"
          labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium"
          placeholder="Enter City Name"
          className="text-sm"
          required
          rootCls="max-w-[450px]"
          type="text"
          value={locationDetails?.city || ""}
          name="city"
          onChange={() => { }}
          errorMsg={errors?.city}
          disabled
        />

        <CustomInput
          label="Property Name"
          type="text"
          labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium"
          placeholder="Enter Property Name"
          value={propertyDetails?.propertyName}
          className="text-sm"
          name="propertyName"
          rootCls="max-w-[450px]"
          maxLength={40}
          onChange={(e) => handleChange("propertyName", e.target.value)}
          errorMsg={errors?.propertyName}
          required
        />
      </div>

      {/* Property Type */}
      <div className="mb-4">
        {basicDetails?.purpose === PurposeType.Residential ? (
          <SelectBtnGrp
            label="Property Type"
            labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium mb-2"
            options={
              basicDetails?.lookingType === LookingType.Sell
                ? sellPropertyType
                : rentPropertyType
            }
            required
            className="gap-2 max-w-[800px] flex-wrap"
            btnClass="text-[12px] font-medium rounded-lg px-3 py-2 border border-slate-200 hover:border-[#3586FF] transition-colors"
            onSelectChange={(value) =>
              handleChange(
                "propertyType",
                typeof value === "object" && value && "name" in value
                  ? value.name
                  : value
              )
            }
            slant={false}
            defaultValue={propertyDetails?.propertyType}
            error={errors?.propertyType}
          />
        ) : (
          <SelectBtnGrp
            options={CommercialPropertyType}
            className="gap-2 max-w-[800px] flex-wrap"
            btnClass="text-[11px] md:text-[12px] font-medium rounded-lg px-4 py-2 border border-slate-200 hover:border-[#3586FF] transition-colors"
            onSelectChange={(value) =>
              handleChange(
                "propertyType",
                typeof value === "object" && value && "name" in value
                  ? value.name
                  : value
              )
            }
            required
            label="Property Type"
            labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium mb-2"
            slant={false}
            defaultValue={propertyDetails?.propertyType}
            error={errors?.propertyType}
          />
        )}
      </div>

      <div className="relative max-w-[500px]">
        {propertyDetails?.propertyType === propertyTypeEnum.Plot ||
          propertyDetails?.propertyType === propertyTypeEnum.AgriculturalLand ? (
          <PlotAndAgricultureDetails />
        ) : basicDetails?.purpose === PurposeType.Residential ? (
          basicDetails?.lookingType === LookingType.FlatShare ? (
            <FlatshareDetails />
          ) : (
            <>
              <ResidentialDetails />
              <ConstructionStatusDetails />
            </>
          )
        ) : (
          <CommericalDetails />
        )}
      </div>
      {/* <div className="relative max-w-[500px]">
        {basicDetails?.purpose === PurposeType.Residential ? (
          propertyDetails?.propertyType === propertyTypeEnum.Plot ||
          propertyDetails?.propertyType ===
            propertyTypeEnum.AgriculturalLand ? (
            <PlotAndAgricultureDetails />
          ) : basicDetails?.lookingType === LookingType.FlatShare ? (
            <FlatshareDetails />
          ) : (
            <>
              <ResidentialDetails />
              <ConstructionStatusDetails />
            </>
          )
        ) : (
          <CommericalDetails />
        )}
      </div> */}

      {/* Pricing */}
      <div>
        <PricingDetails error={errors} />
      </div>

      {/* Description & Submit */}
      <div className="max-w-[500px]">
        <CustomInput
          label="Additional Property Information"
          labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium mb-1"
          type="textarea"
          placeholder="Enter any additional details about your property..."
          value={propertyDetails?.description}
          className="text-sm min-h-[80px]"
          name="description"
          onChange={(e) => handleChange("description", e.target.value)}
          errorMsg={errors?.description}
        />
        <Button
          type="button"
          onClick={handleSubmit}
          className="mt-5 w-full py-2.5 bg-[#3586FF] hover:bg-[#2d75e6] text-white font-medium rounded-lg text-[14px] md:text-[15px] transition-colors duration-200"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default PropertyDetails;
