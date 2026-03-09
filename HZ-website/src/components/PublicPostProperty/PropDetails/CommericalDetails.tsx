import React, { useState } from 'react'
import ConstructionStatusDetails from './ConstructionStatusDetails'
import SelectBtnGrp from '@/common/SelectBtnGrp'
import { CommercialPropertyType, CommercialPropertyTypeEnum } from '../PropertyHelpers'
import usePostPropertyStore, { CommercialAttributes } from '@/store/postproperty'
import CommercialPlotDetails from './CommercialPlotDetails'
import CommercialPropertyDetails from './CommercialPropertyDetails'

const CommericalDetails = () => {
  const propertyDetails = usePostPropertyStore((state) => state.getProperty().propertyDetails)
  const setPropertyDetails = usePostPropertyStore((state) => state.setPropertyDetails)
  const basicDetails = usePostPropertyStore((state) => state.getProperty().basicDetails)

  const property = usePostPropertyStore((state) => state.getProperty())

  const [error, setError] = useState<{ [key: string]: string }>({});

  const handleChange = (key: keyof CommercialAttributes, value: any) => {
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
      <ConstructionStatusDetails />

      {
        propertyDetails?.propertyType === CommercialPropertyTypeEnum.PLOT ?
          <CommercialPlotDetails />
          :
          <CommercialPropertyDetails />
      }

    </div>
  )
}

export default CommericalDetails