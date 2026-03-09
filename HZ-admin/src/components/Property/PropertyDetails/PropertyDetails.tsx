import SelectBtnGrp from "@/src/common/SelectBtnGrp";
import usePostPropertyStore, {
  FlatshareAttributes,
  IPropertyDetails,
  SizeWithUnit,
} from "@/src/stores/postproperty";
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
import CommericalDetails from "./CommericalDetails";
import CustomInput from "@/src/common/FormElements/CustomInput";
import { initialErrorState } from "../PropertyForm";
import FlatshareDetails from "./flatshareDetails";

export interface FurnishingItem {
  name: string;
  icon: JSX.Element;
}

const PropertyDetails = ({
  errors,
  setErrors,
}: {
  errors: any;
  setErrors: any;
}) => {
  const property = usePostPropertyStore((state) => state.getProperty());
  const { propertyDetails, locationDetails, basicDetails } = property;
  const setPropertyDetails = usePostPropertyStore(
    (state) => state.setPropertyDetails
  );

 const handleChange = (
  key:
    | keyof IPropertyDetails
    | `flatshare.${keyof FlatshareAttributes}`,
  value: any,
  nestedKey?: keyof SizeWithUnit
) => {
  setErrors(initialErrorState);

  // Start from current propertyDetails
  const updatedPropertyDetails: any = { ...propertyDetails };

  // ---------------------------------------
  // 1) FLATSHARE updates (supports nested)
  // ---------------------------------------
  if (typeof key === "string" && key.startsWith("flatshare.")) {
    const flatKey = key.replace("flatshare.", "") as keyof FlatshareAttributes;

    const prevAttributes: Partial<FlatshareAttributes> =
      updatedPropertyDetails.flatshareAttributes ?? {};

    // caps
    if (flatKey === "bathroom" && typeof value === "number" && value > 999)
      value = 999;
    if (flatKey === "balcony" && typeof value === "number" && value > 999)
      value = 999;
    if (flatKey === "totalFloors" && typeof value === "number" && value > 999)
      value = 999;

    const updatedAttributes = {
      ...prevAttributes,
      [flatKey]: nestedKey
        ? {
            ...((prevAttributes[flatKey] as SizeWithUnit) ?? {}),
            [nestedKey]: value,
          }
        : value,
    };

    updatedPropertyDetails.flatshareAttributes = updatedAttributes;

    setPropertyDetails({
      ...property,
      propertyDetails: updatedPropertyDetails,
    });
    return;
  }

  // ---------------------------------------
  // 2) Normal propertyDetails updates
  // ---------------------------------------
  updatedPropertyDetails[key as keyof IPropertyDetails] = value;

  // ---------------------------------------
  // 3) Your propertyType reset logic
  // ---------------------------------------
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

      // ✅ also reset flatshare because Plot/Agri won't use it
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

    // ✅ flatshare not relevant in commercial
    updatedPropertyDetails.flatshareAttributes = null;
  }

  setPropertyDetails({
    ...property,
    propertyDetails: updatedPropertyDetails,
  });
};

  return (
    <div className="flex flex-col md:mb-8 mb-4  md:p-3 p-1 !w-full ">
      <p className="text-[16px] font-medium text-[#3586FF]">
        Tell us more about your Property
      </p>

      <div className="md:mt-4 mt-2">
        <div className="flex flex-col gap-2 max-w-[500px]">
          <CustomInput
            label="City"
            type="text"
            labelCls=" label-text- text-black"
            className="md:px-3  px-2"
            placeholder="Enter City"
            value={locationDetails?.city || ""}
            name="city"
            onChange={() => { }}
            disabled
          />

          <CustomInput
            label="Property Name"
            type="text"
            labelCls=" label-text- text-black"
            className="md:px-3  px-2"
            placeholder="Enter Property Name"
            value={propertyDetails?.propertyName}
            name="propertyName"
            onChange={(e) => handleChange("propertyName", e.target.value)}
            errorMsg={errors.propertyDetails?.propertyName}
            required
          />
        </div>

        <div className="mt-4 md:mb-5 mb-3 w-full">
          {basicDetails?.purpose === PurposeType.Residential ? (
            <div className="mt-4">
              <SelectBtnGrp
                label="Property Type"
                labelCls=" label-text- text-black"
                options={
                  basicDetails?.lookingType === LookingType.Sell
                    ? sellPropertyType
                    : rentPropertyType
                }
                className="gap-2  max-w-[800px] "
                btnClass="md:text-[12px] text-[12px] font-medium rounded-md md:px-[14px] px-[10px] shadow-custom md:py-[6px] py-[4px] border-[1px] border-gray-200"
                onSelectChange={(value: any) =>
                  handleChange(
                    "propertyType",
                    typeof value === "object" && value && "name" in value
                      ? value?.name
                      : value
                  )
                }
                slant={false}
                defaultValue={propertyDetails?.propertyType}
                error={errors.propertyDetails?.propertyType}
              />
            </div>
          ) : (
            <div>
              <SelectBtnGrp
                label="Property Type"
                labelCls=" label-text- text-black"
                options={CommercialPropertyType}
                className="gap-2  max-w-[800px] flex-wrap"
                btnClass="md:text-[12px] text-[12px] font-medium rounded-md md:px-[14px] px-[10px] shadow-custom md:py-[6px] py-[4px] border-[1px] border-gray-200"
                onSelectChange={(value: any) =>
                  handleChange(
                    "propertyType",
                    typeof value === "object" && value && "name" in value
                      ? value?.name
                      : value
                  )
                }
                slant={false}
                defaultValue={propertyDetails?.propertyType}
                error={errors.propertyDetails?.propertyType}
              />
            </div>
          )}
        </div>
      </div>

    <div className="relative max-w-[500px]">
        {propertyDetails?.propertyType === propertyTypeEnum.Plot ||
          propertyDetails?.propertyType === propertyTypeEnum.AgriculturalLand ? (
          <PlotAndAgricultureDetails
                errors={errors}
                setErrors={setErrors}
              />
        ) : basicDetails?.purpose === PurposeType.Residential ? (
          basicDetails?.lookingType === LookingType.FlatShare ? (
            <FlatshareDetails />
          ) : (
            <>
              <ResidentialDetails errors={errors} setErrors={setErrors} />
               <ConstructionStatusDetails
                errors={errors}
                setErrors={setErrors}
              />
            </>
          )
        ) : (
         <CommericalDetails errors={errors} setErrors={setErrors} />
        )}
      </div>

      <div>
        <PricingDetails errors={errors} setErrors={setErrors} />
      </div>
      <div className="w-full max-w-[700px]">

        <CustomInput
          label="Additional property information"
          labelCls=" label-text- text-black"
          type="textarea"
          className="md:text-[14px] text-[12px] font-regular md:h-[100px] text-black"
          value={propertyDetails?.description}
          name="description"
          onChange={(e) => handleChange("description", e.target.value)}
          errorMsg={errors.propertyDetails?.description}
        />
      </div>
    </div>
  );
};

export default PropertyDetails;
