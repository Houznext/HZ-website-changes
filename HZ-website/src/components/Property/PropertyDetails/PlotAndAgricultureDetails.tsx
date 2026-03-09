import FloatingDatePicker from "@/common/FormElements/FloatingDateInput";
import SelectBtnGrp from "@/common/SelectBtnGrp";
import usePostPropertyStore, {
  PlotAttributes,
  SizeWithUnit,
} from "@/store/postproperty";
import React, { useState } from "react";
import {
  facingTypes,
  PlotAgriculturePosessionTypeEnum,
  PlotAgriculturePossessionStatus,
  transactionTypes,
} from "./PropertyHelpers";
import { FaCalendarAlt } from "react-icons/fa";
import CustomInput from "@/common/FormElements/CustomInput";
import CustomDate from "@/common/FormElements/CustomDate";

const PlotAndAgricultureDetails = () => {
  const propertyDetails = usePostPropertyStore(
    (state) => state.getProperty().propertyDetails
  );
  const setPropertyDetails = usePostPropertyStore(
    (state) => state.setPropertyDetails
  );
  const [optional, setOptional] = useState(false);

  const property = usePostPropertyStore((state) => state.getProperty());

  const [error, setError] = useState<{ [key: string]: string }>({});

  const handleChange = (
    key: keyof PlotAttributes,
    value: any,
    nestedKey?: keyof SizeWithUnit
  ) => {
    const prevAttributes: Partial<PlotAttributes> =
      propertyDetails?.plotAttributes ?? {};

    const updatedPlotAttributes = {
      ...prevAttributes,
      [key]: nestedKey
        ? {
          ...((prevAttributes[key] as SizeWithUnit) ?? {}),
          [nestedKey]: value,
        }
        : value,
    };

    const updatedPropertyDetails = {
      ...propertyDetails,
      plotAttributes: updatedPlotAttributes,
    };

    setPropertyDetails({
      ...property,
      propertyDetails: updatedPropertyDetails,
    });
  };

  const handleDateChange = (key: keyof PlotAttributes, date: Date | null) => {
    const updatedPropertyDetails = {
      ...propertyDetails,
      plotAttributes: {
        ...propertyDetails?.plotAttributes,
        [key]: date,
      },
    };

    setPropertyDetails({
      ...property,
      propertyDetails: { ...updatedPropertyDetails },
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <CustomInput
        label="Plot Area"
        labelCls="md:text-[14px] text-[13px] font-medium mb-2"
        type="number"
        placeholder="Enter Plot Area"
        className="px-2 md:py-[4px] py-[2px]"
        value={propertyDetails?.plotAttributes?.plotArea?.size || null}
        name="plotArea"
        onChange={(e) => handleChange("plotArea", +e.target.value, "size")}
        required
        unitsDropdown={{
          value: propertyDetails?.plotAttributes?.plotArea?.unit || null,
          options: ["sq.ft", "sq.yard", "sq.meter", "acre", "cent", "marla"],
          onChange: (val: any) => handleChange("plotArea", val, "unit"),
        }}
        errorMsg={error.plotArea}
      />

      <CustomInput
        label="Length"
        type="number"
        labelCls="md:text-[14px] text-[13px] font-medium mb-2"
        className="px-2 md:py-[4px] py-[2px]"
        value={propertyDetails?.plotAttributes?.length?.size || null}
        name="length"
        onChange={(e) => handleChange("length", +e.target.value, "size")}
        unitsDropdown={{
          value: propertyDetails?.plotAttributes?.length?.unit || null,
          options: ["sq.ft", "sq.yard", "sq.meter", "acre", "cent", "marla"],
          onChange: (val: any) => handleChange("length", val, "unit"),
        }}
        required
        errorMsg={error.length}
      />

      <CustomInput
        label="Width"
        labelCls="md:text-[14px] text-[13px] font-medium mb-2"
        className="px-2 md:py-[4px] py-[2px]"
        type="number"
        value={propertyDetails?.plotAttributes?.width?.size || null}
        name="width"
        onChange={(e) => handleChange("width", +e.target.value, "size")}
        unitsDropdown={{
          value: propertyDetails?.plotAttributes?.width?.unit || null,
          options: ["sq.ft", "sq.yard", "sq.meter", "acre", "cent", "marla"],
          onChange: (val: any) => handleChange("width", val, "unit"),
        }}
        required
        errorMsg={error.width}
      />

      <CustomInput
        label="Width Facing Road"
        labelCls="md:text-[14px] text-[13px] font-medium mb-2"
        className="px-2 md:py-[4px] py-[2px]"
        type="number"
        value={propertyDetails?.plotAttributes?.widthFacingRoad?.size || null}
        name="widthFacingRoad"
        onChange={(e) =>
          handleChange("widthFacingRoad", +e.target.value, "size")
        }
        unitsDropdown={{
          value: propertyDetails?.plotAttributes?.widthFacingRoad?.unit || null,
          options: ["sq.ft", "sq.yard", "sq.meter", "acre", "cent", "marla"],
          onChange: (val: any) => handleChange("widthFacingRoad", val, "unit"),
        }}
        required
        errorMsg={error.widthFacingRoad}
      />

      <SelectBtnGrp
        options={facingTypes}
        label="Facing"
        labelCls="md:text-[14px] text-[13px] font-medium text-black mt-2 mb-3"
        className="md:gap-2 gap-1 mb-4  md:max-w-[400px] lg:max-w-[700px] flex overflow-auto min-w-[1500px]:max-w-[700px]"
        btnClass="md:text-[12px] text-[13px] font-medium rounded-md  px-[6px] shadow-custom md:py-[6px] py-[4px] border-[1px] border-gray-200"
        onSelectChange={(value) => handleChange("facing", value)}
        slant={false}
        defaultValue={propertyDetails?.plotAttributes?.facing}
        error={error.facing}
      />

      <SelectBtnGrp
        options={PlotAgriculturePossessionStatus}
        label="Possession Status"
        labelCls="md:text-[14px] text-[13px] font-medium text-black md:mb-2"
        className="md:gap-2 gap-1 mb-4 flex overflow-auto"
        btnClass="md:text-[12px] text-[13px] font-medium rounded-md px-[12px] shadow-custom py-[4px] md:py-[6px] border-[1px] border-gray-200"
        onSelectChange={(value) => handleChange("possessionStatus", value)}
        slant={false}
        error={error.possessionStatus}
      />

      {propertyDetails?.plotAttributes?.possessionStatus ===
        PlotAgriculturePosessionTypeEnum.InFuture && (
          <CustomDate
            value={propertyDetails?.plotAttributes?.possessionDate || null}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleDateChange("possessionDate", new Date(e.target.value))
            }
            label="Possession Date"
            labelCls="md:text-[14px] text-[13px] font-medium text-black mb-2"
            rightIcon={<FaCalendarAlt />}
            errorMsg={error.possessionDate}
          />
        )}

      <SelectBtnGrp
        options={transactionTypes}
        label="Trasaction Type"
        labelCls="md:text-[14px] text-[13px] font-medium text-black mb-2"
        className="md:gap-2 gap-1 mb-4 flex overflow-auto"
        btnClass="text-[13px] md:text-[12px] font-medium rounded-md px-[12px] shadow-custom py-[4px] md:px-[18px] md:py-[8px] border-[1px] border-gray-200"
        onSelectChange={(value) => handleChange("transactionType", value)}
        slant={false}
        error={error.transactionType}
      />

      {optional ? (
        <div>
          <p
            className="md:text-[12px] text-[10px] font-medium text-[#3586FF] cursor-pointer"
            onClick={() => setOptional(false)}
          >
            - Hide optional fields
          </p>

          <div>
            <SelectBtnGrp
              label="Does your property have a boundary wall?"
              options={["Yes", "No"]}
              btnClass="md:text-[12px] text-[13px] font-medium md:px-3 px-2 md:py-1 py-1"
              labelCls="md:text-[14px] text-[13px] font-medium text-black mb-3"
              onSelectChange={(value) =>
                handleChange("boundaryWall", value === "Yes" ? true : false)
              }
              className="md:gap-2 gap-1"
            />

            <CustomInput
              label="No of floors allowed for construction"
              type="number"
              labelCls="md:text-[14px] text-[13px] font-medium mb-2"
              className="px-2 md:py-[4px] py-[2px]"
              value={propertyDetails?.plotAttributes?.noOfFloorsAllowed || null}
              name="noOfFloorsAllowed"
              onChange={(e) =>
                handleChange("noOfFloorsAllowed", +e.target.value)
              }
              errorMsg={error.noOfFloorsAllowed}
            />
          </div>
        </div>
      ) : (
        <p
          className="md:text-[12px] text-[10px] font-medium text-[#3586FF] cursor-pointer"
          onClick={() => setOptional(true)}
        >
          + Show optional fields
        </p>
      )}
    </div>
  );
};

export default PlotAndAgricultureDetails;
