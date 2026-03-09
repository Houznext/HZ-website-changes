import CustomInput from "@/src/common/FormElements/CustomInput";
import usePostPropertyStore, {
  CommercialFacilities,
} from "@/src/stores/postproperty";
import React, { useState } from "react";
import { initialErrorState } from "../PropertyForm";

const CommercialFacilites = ({
  errors,
  setErrors,
}: {
  errors: any;
  setErrors: any;
}) => {
  const property = usePostPropertyStore((state) => state.getProperty());
  const propertyDetails = usePostPropertyStore(
    (state) => state.getProperty().propertyDetails
  );
  const setPropertyDetails = usePostPropertyStore(
    (state) => state.setPropertyDetails
  );

  const handleChange = (key: keyof CommercialFacilities, value: any) => {
    setErrors(initialErrorState);
    const updatedPropertyDetails = {
      ...propertyDetails,
      facilities: {
        ...propertyDetails?.facilities,
        [key]: value,
      },
    };

    setPropertyDetails({
      ...property,
      propertyDetails: { ...updatedPropertyDetails },
    });
  };
  return (
    <>
      <CustomInput
        label="Min number of seats"
        type="number"
         labelCls="label-text font-medium text-black "
        
        value={propertyDetails?.facilities?.minSeats}
        name="minSeats"
        onChange={(e) => handleChange("minSeats", +e.target.value)}
        errorMsg={errors.propertyDetails.facilities?.minSeats}
      />
      <CustomInput
        label="Number of Cabins"
        type="number"
        labelCls="label-text font-medium text-black "
        value={propertyDetails?.facilities?.numberOfCabins}
        name="numberOfCabins"
        onChange={(e) => handleChange("numberOfCabins", +e.target.value)}
        errorMsg={errors.propertyDetails.facilities?.numberOfCabins}
      />
      <CustomInput
        label="No of Meeeting rooms"
        type="number"
        labelCls="label-text font-medium text-black "
        value={propertyDetails?.facilities?.numberOfMeetingRooms}
        name="numberOfMeetingRooms"
        onChange={(e) => handleChange("numberOfMeetingRooms", +e.target.value)}
        errorMsg={errors.propertyDetails.facilities?.numberOfMeetingRooms}
      />
      <CustomInput
        label="No of wash rooms"
        type="number"
         labelCls="label-text font-medium text-black "
        value={propertyDetails?.facilities?.numberOfWashrooms}
        name="numberOfWashrooms"
        onChange={(e) => handleChange("numberOfWashrooms", +e.target.value)}
        errorMsg={errors.propertyDetails.facilities?.numberOfWashrooms}
      />
    </>
  );
};

export default CommercialFacilites;
