import SelectBtnGrp from "@/common/SelectBtnGrp";
import usePostPropertyStore, { IPricingDetails } from "@/store/postproperty";
import { LookingType } from "./PropertyHelpers";
import CustomInput from "@/common/FormElements/CustomInput";

const PricingDetails = ({ error }: any) => {
  const basicDetails = usePostPropertyStore((state) => state.basicDetails);
  const propertyDetails = usePostPropertyStore(
    (state) => state.propertyDetails
  );
  const setPropertyDetails = usePostPropertyStore(
    (state) => state.setPropertyDetails
  );
  const property = usePostPropertyStore((state) => state.getProperty());
  const { errors } = usePostPropertyStore();

  const handleChange = (key: keyof IPricingDetails, value: any) => {
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
    <div className="md:mb-4 md:mt-5 mb-3 mt-3 max-w-[500px]">
      <p className="btn-text text-[#3586FF]   font-medium mb-3">
        Pricing Details
      </p>
      {/* {for rent and flat sharing this can be used } */}
       {(basicDetails?.lookingType === LookingType.Rent ||
          basicDetails?.lookingType === LookingType.FlatShare) && (
        <div className="md:space-y-3 space-y-1">
          <CustomInput
            placeholder="Enter Monthly Rent"
            label="Monthly Rent (in Rs.)"
            labelCls="md:text-[14px] text-[13px] font-medium text-black "
            className="md:px-3 px-2  label-text rounded-md "
            value={propertyDetails?.pricingDetails?.monthlyRent || null}
            name="monthlyRent"
            onChange={(e) => handleChange("monthlyRent", +e.target.value)}
            errorMsg={errors?.monthlyRent}
            type={"number"}
          />
          <CustomInput
            label="Security Deposit (in Rs.)"
            labelCls="md:text-[14px] text-[13px] font-medium text-black "
            className="md:px-3 px-2 md:text-[14px]  text-[12px] rounded-md "
            value={propertyDetails?.pricingDetails?.securityDeposit || null}
            name="securityDeposit"
            onChange={(e) => handleChange("securityDeposit", +e.target.value)}
            type={"number"}
            maxLength={9}
          />
          <CustomInput
            label="Maintenance Charges (in Rs.)"
            labelCls="md:text-[14px] text-[13px] font-medium text-black "
            className="md:px-3 px-2 md:text-[14px]  text-[12px] rounded-md "
            value={propertyDetails?.pricingDetails?.maintenanceCharges || null}
            name="maintenanceCharges"
            onChange={(e) =>
              handleChange("maintenanceCharges", +e.target.value)
            }
            errorMsg={errors?.maintenanceCharges}
            type={"number"}
            maxLength={9}
          />

          <SelectBtnGrp
            label="Is the rent negotiable?"
            options={["Yes", "No"]}
            btnClass="md:text-[12px] text-[13px] font-medium md:px-3 px-3 md:py-1 py-1 rounded-md"
            labelCls="md:text-[14px] text-[13px] font-medium text-black mb-2"
            onSelectChange={(value) =>
              handleChange("isNegotiable", value === "Yes" ? true : false)
            }
            className="flex gap-2"
            defaultValue={
              propertyDetails?.pricingDetails?.isNegotiable ? "Yes" : "No"
            }
          />

          {propertyDetails?.pricingDetails?.isNegotiable && (
            <>
              <CustomInput
                label="Min Price Offer (in Rs.)"
                placeholder="Enter Min Price Offer"
                value={propertyDetails?.pricingDetails?.minPriceOffer || null}
                name="minPriceOffer"
                labelCls="md:text-[14px] text-[13px]  font-medium text-black "
                className="md:px-3 px-2   rounded-md"
                onChange={(e) => handleChange("minPriceOffer", +e.target.value)}
                errorMsg={error.minPriceOffer}
                type="number"
                maxLength={9}
                required
              />
              <CustomInput
                label="Max Price Offer (in Rs.)"
                placeholder="Enter Max Price Offer"
                value={propertyDetails?.pricingDetails?.maxPriceOffer || null}
                name="maxPriceOffer"
                labelCls="md:text-[14px] text-[13px] font-medium text-black "
                className="md:px-3 px-2   rounded-md"
                onChange={(e) => handleChange("maxPriceOffer", +e.target.value)}
                errorMsg={errors?.maxPriceOffer}
                type="number"
                maxLength={9}
              />
            </>
          )}
        </div>
      )}

      {basicDetails?.lookingType === LookingType.Sell && (
        <div className="md:space-y-3 space-y-1 max-w-[450px]">
          <CustomInput
            label="Price Per Sq. Ft. (in Rs.)"
            value={propertyDetails?.pricingDetails?.pricePerSqft}
            name="pricePerSqft"
            maxLength={9}
            type="number"
            className="md:px-3 px-2 label-text  rounded-md "
            labelCls="md:text-[14px] text-[13px] font-medium text-black "
            onChange={(e) => handleChange("pricePerSqft", +e.target.value)}
            errorMsg={error.pricePerSqft}
            placeholder="Enter Price amount"
          />
          <CustomInput
            label="Expected Price (in Rs.)"
            value={propertyDetails?.pricingDetails?.expectedPrice}
            name="expectedPrice"
            className="md:px-3 px-2 label-text  rounded-md "
            labelCls="md:text-[14px] text-[13px] font-medium text-black "
            onChange={(e) => handleChange("expectedPrice", +e.target.value)}
            errorMsg={error.price}
            maxLength={9}
            type="number"
            placeholder="Enter Expected amount"
          />
          <CustomInput
            label="Advance Amount (in Rs.)"
            value={propertyDetails?.pricingDetails?.advanceAmount}
            name="advanceAmount"
            className="md:px-3 px-2 label-text  rounded-md "
            labelCls="md:text-[14px] text-[13px] font-medium text-black "
            onChange={(e) => handleChange("advanceAmount", +e.target.value)}
            errorMsg={error.advanceAmount}
            maxLength={9}
            type="number"
            placeholder="Enter Advance amount"
          />
          <SelectBtnGrp
            label="Is the price negotiable?"
            options={["Yes", "No"]}
            btnClass="md:text-[12px] text-[13px] font-medium px-3 py-[6px]   rounded-md"
            labelCls="md:text-[14px] text-[13px] font-medium text-black mb-1"
            onSelectChange={(value) =>
              handleChange("isNegotiable", value === "Yes" ? true : false)
            }
            className="flex gap-2"
            defaultValue={
              propertyDetails?.pricingDetails?.isNegotiable ? "Yes" : "No"
            }
          />

          {propertyDetails?.pricingDetails?.isNegotiable && (
            <>
              <CustomInput
                label="Min Price Offer (in Rs.)"
                value={propertyDetails?.pricingDetails?.minPriceOffer}
                name="minPriceOffer"
                labelCls="md:text-[14px] text-[13px] font-medium text-black "
                onChange={(e) => handleChange("minPriceOffer", +e.target.value)}
                errorMsg={error.minPriceOffer}
                maxLength={9}
                className="md:px-3 px-2 label-text  rounded-md "
                type="number"
                placeholder="Enter Min price"
              />
              <CustomInput
                label="Max Price Offer (in Rs.)"
                labelCls="md:text-[14px] text-[13px] font-medium text-black "
                value={propertyDetails?.pricingDetails?.maxPriceOffer}
                name="maxPriceOffer"
                onChange={(e) => handleChange("maxPriceOffer", +e.target.value)}
                errorMsg={error.maxPriceOffer}
                maxLength={9}
                className="md:px-3 px-2 label-text  rounded-md "
                type="number"
                placeholder="Enter Max price"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PricingDetails;
