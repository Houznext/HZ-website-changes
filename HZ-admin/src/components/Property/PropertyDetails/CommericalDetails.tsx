import React, { useState } from 'react'
import ConstructionStatusDetails from './ConstructionStatusDetails'
import SelectBtnGrp from '@/src/common/SelectBtnGrp'
import { CommercialPropertyTypeEnum } from './PropertyHelpers'
import usePostPropertyStore, { CommercialAttributes } from '@/src/stores/postproperty'
import CommercialPlotDetails from './CommercialPlotDetails'
import CommercialPropertyDetails from './CommercialPropertyDetails'
import { initialErrorState } from '../PropertyForm'

const CommericalDetails = ({ errors, setErrors }: { errors: any, setErrors: any }) => {
  const propertyDetails = usePostPropertyStore((state) => state.getProperty().propertyDetails)
  const setPropertyDetails = usePostPropertyStore((state) => state.setPropertyDetails)
  const basicDetails = usePostPropertyStore((state) => state.getProperty().basicDetails)

  const property = usePostPropertyStore((state) => state.getProperty())

  const handleChange = (key: keyof CommercialAttributes, value: any) => {
    setErrors(initialErrorState)
    const updatedPropertyDetails = {
      ...propertyDetails,
      commercialAttributes: {
        ...propertyDetails?.commercialAttributes,
        [key]: value,
      }
    };

    setPropertyDetails({
      ...property,
      propertyDetails: { ...updatedPropertyDetails }
    });
  };

  return (
    <div>
      <ConstructionStatusDetails errors={errors} setErrors={setErrors} />

      {
        propertyDetails?.propertyType === CommercialPropertyTypeEnum.PLOT ?
          <CommercialPlotDetails errors={errors} setErrors={setErrors} />
          :
          <CommercialPropertyDetails errors={errors} setErrors={setErrors} />
      }

    </div>
  )
}

export default CommericalDetails