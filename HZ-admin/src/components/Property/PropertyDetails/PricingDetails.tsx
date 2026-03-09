import FloatingInput from "@/src/common/FloatingInput";
import SelectBtnGrp from "@/src/common/SelectBtnGrp";
import usePostPropertyStore, {
  IPricingDetails,
} from "@/src/stores/postproperty";
import { LookingType } from "./PropertyHelpers";
import { initialErrorState } from "../PropertyForm";
import CustomInput from "@/src/common/FormElements/CustomInput";

const PricingDetails = ({
  errors,
  setErrors,
}: {
  errors: any;
  setErrors: any;
}) => {
  const basicDetails = usePostPropertyStore((state) => state.basicDetails);
  const propertyDetails = usePostPropertyStore(
    (state) => state.propertyDetails
  );
  const setPropertyDetails = usePostPropertyStore(
    (state) => state.setPropertyDetails
  );
  const property = usePostPropertyStore((state) => state.getProperty());

  const handleChange = (key: keyof IPricingDetails, value: any) => {
    setErrors(initialErrorState);
    const updatedPropertyDetails = {
      ...propertyDetails,
      pricingDetails: {
        ...propertyDetails?.pricingDetails,
        [key]: value,
      },
    };

    setPropertyDetails({
      ...property,
      propertyDetails: { ...updatedPropertyDetails },
    });
  };

  return (
    <div className="w-full mt-5">
      <p className="md:text-[18px] text-[16px] font-bold mb-6 mt-4  text-[#3586FF] ">
        Pricing Details:
      </p>
      {/* {for rent and flat sharing this can be used } */}
      <div className="max-w-[500px]">
        {(basicDetails?.lookingType === LookingType.Rent ||
          basicDetails?.lookingType === LookingType.FlatShare) && (
            <div className="flex flex-col md:gap-5 gap-3 shadow-custom px-4 py-3 rounded-md w-full mb-4">
              <CustomInput
                label="Monthly Rent (in Rs.)"
                labelCls="label-text font-medium"
                value={propertyDetails?.pricingDetails?.monthlyRent || 0}
                name="monthlyRent"
                onChange={(e) => handleChange("monthlyRent", +e.target.value)}
                type="number"
                errorMsg={errors.propertyDetails.pricingDetails?.monthlyRent}
                className="md:px-3 px-2 md:text-[14px] text-[12px] rounded-md "
              />
              <CustomInput
                label="Security Deposit (in Rs.)"
                labelCls="label-text font-medium"
                value={propertyDetails?.pricingDetails?.securityDeposit || 0}
                name="securityDeposit"
                onChange={(e) => handleChange("securityDeposit", +e.target.value)}
                type="number"
                errorMsg={errors.propertyDetails.pricingDetails?.securityDeposit}
                className="md:px-3 px-2 md:text-[14px] text-[12px] rounded-md "
              />
              <CustomInput
                label="Maintenance Charges (in Rs.)"
                labelCls="label-text font-medium"
                value={propertyDetails?.pricingDetails?.maintenanceCharges || 0}
                name="maintenanceCharges"
                onChange={(e) =>
                  handleChange("maintenanceCharges", +e.target.value)
                }
                type="number"
                errorMsg={errors.propertyDetails.pricingDetails?.maintenanceCharges}
                className="md:px-3 px-2 md:text-[14px] text-[12px] rounded-md "
              />

              <SelectBtnGrp
                label="Is the rent negotiable?"
                options={["Yes", "No"]}
                btnClass="md:text-[12px] text-[13px] font-medium md:px-3 px-3 md:py-1 py-1 rounded-md"
                labelCls="label-text font-medium text-black"
                onSelectChange={(value) =>
                  handleChange("isNegotiable", value === "Yes" ? true : false)
                }
                className="flex gap-2"
                defaultValue={
                  propertyDetails?.pricingDetails?.isNegotiable ? "Yes" : "No"
                }
                error={errors.propertyDetails.pricingDetails?.isNegotiable}
              />

              {propertyDetails?.pricingDetails?.isNegotiable && (
                <>
                  <CustomInput
                    label="Min Price Offer (in Rs.)"
                    labelCls="label-text"
                    value={propertyDetails?.pricingDetails?.minPriceOffer || 0}
                    name="minPriceOffer"
                    type="number"
                    onChange={(e) => handleChange("minPriceOffer", +e.target.value)}
                    errorMsg={errors.propertyDetails.pricingDetails?.minPriceOffer}
                    className="md:px-3 px-2 md:py-[4px] py-[2px]  rounded-md"
                  />
                  <CustomInput
                    label="Max Price Offer (in Rs.)"
                    labelCls="label-text"
                    value={propertyDetails?.pricingDetails?.maxPriceOffer || 0}
                    name="maxPriceOffer"
                    type="number"
                    onChange={(e) => handleChange("maxPriceOffer", +e.target.value)}
                    errorMsg={errors.propertyDetails.pricingDetails?.maxPriceOffer}
                    className="md:px-3 px-2 md:py-[4px] py-[2px]  rounded-md"
                  />
                </>
              )}
            </div>
          )}

        {basicDetails?.lookingType === LookingType.Sell && (
          <>
            <CustomInput
              label="Price Per Sq. Ft. (in Rs.)"
              labelCls="label-text"
              type={"number"}
              value={propertyDetails?.pricingDetails?.pricePerSqft}
              name="pricePerSqft"
              className="md:px-3 px-2 md:text-[14px] text-[12px] rounded-md "
              onChange={(e) => handleChange("pricePerSqft", +e.target.value)}
              errorMsg={errors.propertyDetails.pricingDetails?.pricePerSqft}
            />
            <CustomInput
              label="Expected Price (in Rs.)"
              type={"number"}
              labelCls="label-text"
              value={propertyDetails?.pricingDetails?.expectedPrice}
              className="md:px-3 px-2 md:text-[14px] text-[12px] rounded-md "
              name="expectedPrice"
              onChange={(e) => handleChange("expectedPrice", +e.target.value)}
              errorMsg={errors.propertyDetails.pricingDetails?.expectedPrice}
            />
            <CustomInput
              label="Advance Amount (in Rs.)"
              labelCls="label-text"
              value={propertyDetails?.pricingDetails?.advanceAmount}
              className="md:px-3 px-2 md:text-[14px] text-[12px] rounded-md "
              name="advanceAmount"
              onChange={(e) => handleChange("advanceAmount", +e.target.value)}
              errorMsg={errors.propertyDetails.pricingDetails?.advanceAmount}
              type={"number"}
            />
            <SelectBtnGrp
              label="Is the price negotiable?"
              options={["Yes", "No"]}
              btnClass="md:text-[12px] text-[13px] font-medium px-3 py-[6px]   rounded-md"
              labelCls="label-text font-medium text-black mb-3"
              onSelectChange={(value) =>
                handleChange("isNegotiable", value === "Yes" ? true : false)
              }
              className="flex gap-2"
              defaultValue={
                propertyDetails?.pricingDetails?.isNegotiable ? "Yes" : "No"
              }
              error={errors.propertyDetails.pricingDetails?.isNegotiable}
            />

            {propertyDetails?.pricingDetails?.isNegotiable && (
              <>
                <CustomInput
                  label="Min Price Offer (in Rs.)"
                  labelCls="label-text"
                  value={propertyDetails?.pricingDetails?.minPriceOffer || 0}
                  name="minPriceOffer"
                  type="number"
                  onChange={(e) => handleChange("minPriceOffer", +e.target.value)}
                  errorMsg={errors.propertyDetails.pricingDetails?.minPriceOffer}
                  className="md:px-3 px-2 md:py-[4px] py-[2px]  rounded-md"
                />
                <CustomInput
                  label="Max Price Offer (in Rs.)"
                  labelCls="label-text"
                  value={propertyDetails?.pricingDetails?.maxPriceOffer || 0}
                  name="maxPriceOffer"
                  type="number"
                  onChange={(e) => handleChange("maxPriceOffer", +e.target.value)}
                  errorMsg={errors.propertyDetails.pricingDetails?.maxPriceOffer}
                  className="md:px-3 px-2 md:py-[4px] py-[2px]  rounded-md"
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PricingDetails;
