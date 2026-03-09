import CustomInput from "@/common/FormElements/CustomInput";
import SelectBtnGrp from "@/common/SelectBtnGrp";
import { LookingType } from "@/components/Property/PropertyDetails/PropertyHelpers";
import usePostPropertyStore, { IPricingDetails } from "@/store/postproperty";
import toast from "react-hot-toast";

const PricingDetails = ({ error }: any) => {
  const basicDetails = usePostPropertyStore((state) => state.basicDetails);
  const propertyDetails = usePostPropertyStore(
    (state) => state.propertyDetails
  );
  const setPropertyDetails = usePostPropertyStore(
    (state) => state.setPropertyDetails
  );
  const property = usePostPropertyStore((state) => state.getProperty());

  const handleChange = (key: keyof IPricingDetails, value: any) => {
    if (key === "monthlyRent" && value != null && value > 10000000) {
      value = 10000000;
    }

    if (key === "maxPriceOffer" && value != null) {
      if (
        propertyDetails?.pricingDetails?.minPriceOffer != null &&
        value < propertyDetails.pricingDetails.minPriceOffer
      ) {
        toast.error("Max Price Offer cannot be less than Min Price Offer.");
      }
    }

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
      <p className="md:text-[16px] text-[#3586FF]  text-[14px] font-medium mb-3">
        Pricing Details:
      </p>
      {/* {for rent and flat sharing this can be used } */}
      {(basicDetails?.lookingType === LookingType.Rent ||
        basicDetails?.lookingType === LookingType.FlatShare) && (
          <div className="flex flex-col gap-2 max-w-[450px]">
            <CustomInput
              label="Monthly Rent (in Rs.)"
              placeholder="Enter Monthly Rent"
              value={propertyDetails?.pricingDetails?.monthlyRent || null}
              name="monthlyRent"
              labelCls="md:text-[14px] text-[13px] font-medium text-black "
              className="md:px-2 px-1 md:text-[14px] text-[12px] rounded-md "
              onChange={(e) => handleChange("monthlyRent", +e.target.value)}
              errorMsg={error.monthlyRent}
              type="number"
              min={1000}
              max={1000000}
              step={500}
              required
            />
            <CustomInput
              label="Security Deposit (in Rs.)"
              placeholder="Enter Security Deposit"
              value={propertyDetails?.pricingDetails?.securityDeposit || null}
              name="securityDeposit"
              labelCls="md:text-[14px] text-[13px] font-medium text-black "
              className="md:px-2 px-1 md:text-[14px] text-[12px] rounded-md "
              onChange={(e) => handleChange("securityDeposit", +e.target.value)}
              type="number"
            />
            <CustomInput
              label="Maintenance Charges (in Rs.)"
              placeholder="Enter Maintenance Charges"
              labelCls="md:text-[14px] text-[13px] font-medium text-black "
              className="md:px-2 px-1 md:text-[14px] text-[12px] rounded-md "
              value={propertyDetails?.pricingDetails?.maintenanceCharges || null}
              name="maintenanceCharges"
              onChange={(e) =>
                handleChange("maintenanceCharges", +e.target.value)
              }
              errorMsg={error.maintenanceCharges}
              type="number"
              required
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
            />

            {propertyDetails?.pricingDetails?.isNegotiable && (
              <>
                <CustomInput
                  label="Min Price Offer (in Rs.)"
                  placeholder="Enter Min Price Offer"
                  value={propertyDetails?.pricingDetails?.minPriceOffer || null}
                  name="minPriceOffer"
                  labelCls="md:text-[14px] text-[13px] font-medium text-black "
                  className="md:px-2 px-1   rounded-md"
                  onChange={(e) => handleChange("minPriceOffer", +e.target.value)}
                  maxLength={9}
                  errorMsg={error.minPriceOffer}
                  type="number"
                  required
                />
                <CustomInput
                  label="Max Price Offer (in Rs.)"
                  placeholder="Enter Max Price Offer"
                  value={propertyDetails?.pricingDetails?.maxPriceOffer || null}
                  name="maxPriceOffer"
                  labelCls="md:text-[14px] text-[13px] font-medium text-black "
                  className="md:px-2 px-1   rounded-md"
                  onChange={(e) => handleChange("maxPriceOffer", +e.target.value)}
                  maxLength={9}
                  errorMsg={error.maxPriceOffer}
                  type="number"
                  required
                />
              </>
            )}
          </div>
        )}

      {basicDetails?.lookingType === LookingType.Sell && (
        <div className="flex flex-col gap-3 max-w-[450px]">
          <CustomInput
            label="Price Per Sq. Ft. (in Rs.)"
            placeholder="Enter Price Per Sq. Ft."
            value={propertyDetails?.pricingDetails?.pricePerSqft}
            name="pricePerSqft"
            labelCls="md:text-[14px] text-[13px] font-medium text-black "
            className="md:px-2 px-1   label-text rounded-md"
            onChange={(e) => handleChange("pricePerSqft", +e.target.value)}
            errorMsg={error.pricePerSqft}
            type="number"
            maxLength={9}
            required
          />
          <CustomInput
            label="Expected Price (in Rs.)"
            placeholder="Enter Expected Price"
            value={propertyDetails?.pricingDetails?.expectedPrice}
            name="expectedPrice"
            labelCls="md:text-[14px] text-[13px] font-medium text-black "
            className="md:px-2 px-1   rounded-md"
            onChange={(e) => handleChange("expectedPrice", +e.target.value)}
            errorMsg={error.expectedPrice}
            type="number"
            maxLength={9}
            required
          />
          <CustomInput
            label="Advance Amount (in Rs.)"
            placeholder="Enter Advance Amount"
            value={propertyDetails?.pricingDetails?.advanceAmount}
            name="advanceAmount"
            labelCls="md:text-[14px] text-[13px] font-medium text-black "
            className="md:px-2 px-1   rounded-md"
            onChange={(e) => handleChange("advanceAmount", +e.target.value)}
            type="number"
            maxLength={9}
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
                placeholder="Enter Min Price Offer"
                value={propertyDetails?.pricingDetails?.minPriceOffer}
                name="minPriceOffer"
                labelCls="md:text-[14px] text-[13px] font-medium text-black "
                className="md:px-2 px-1   rounded-md"
                onChange={(e) => handleChange("minPriceOffer", +e.target.value)}
                errorMsg={error.minPriceOffer}
                type="number"
                maxLength={9}
              />
              <CustomInput
                label="Max Price Offer (in Rs.)"
                placeholder="Enter Max Price Offer"
                value={propertyDetails?.pricingDetails?.maxPriceOffer}
                name="maxPriceOffer"
                labelCls="md:text-[14px] text-[13px] font-medium text-black "
                className="md:px-2 px-1   rounded-md"
                onChange={(e) => handleChange("maxPriceOffer", +e.target.value)}
                errorMsg={error.maxPriceOffer}
                type="number"
                maxLength={9}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PricingDetails;
