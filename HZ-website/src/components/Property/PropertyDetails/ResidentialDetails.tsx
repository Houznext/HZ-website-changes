import SelectBtnGrp from "@/common/SelectBtnGrp";
import usePostPropertyStore, {
  ResidentialAttributes,
  SizeWithUnit,
} from "@/store/postproperty";
import {
  bhkArray,
  facingTypes,
  LookingType,
  propertyTypeEnum,
  BHK,
} from "./PropertyHelpers";
import ResidentialFurnishingDetails from "./ResidentialFurnishingDetails";
import SingleSelect from "@/common/FormElements/SingleSelect";
import CustomInput from "@/common/FormElements/CustomInput";

const ResidentialDetails = () => {
  const propertyDetails = usePostPropertyStore(
    (state) => state.getProperty().propertyDetails
  );
  const setPropertyDetails = usePostPropertyStore(
    (state) => state.setPropertyDetails
  );
  const basicDetails = usePostPropertyStore(
    (state) => state.getProperty().basicDetails
  );

  const property = usePostPropertyStore((state) => state.getProperty());
  const { errors } = usePostPropertyStore();

  const handleChange = (
    key: keyof ResidentialAttributes,
    value: any,
    nestedKey?: keyof SizeWithUnit
  ) => {
    const prevAttributes: Partial<ResidentialAttributes> =
      propertyDetails?.residentialAttributes ?? {};

    const updatedResidentialAttributes = {
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
      residentialAttributes: updatedResidentialAttributes,
    };

    setPropertyDetails({
      ...property,
      propertyDetails: updatedPropertyDetails,
    });
  };
  const filteredBhkArray =
    propertyDetails?.propertyType === propertyTypeEnum.Villa ||
      propertyDetails?.propertyType === propertyTypeEnum.IndependentHouse
      ? bhkArray.filter((b) => b !== BHK.RK)
      : bhkArray;

  return (
    <div className="flex flex-col gap-5">
      {/* BHK & Facing */}
      <div className="grid md:grid-cols-2 gap-5">
        <SelectBtnGrp
          options={filteredBhkArray}
          label="No of BHK"
          labelCls="text-sm text-slate-700 font-medium mb-2"
          className="flex flex-wrap gap-2"
          btnClass="text-xs font-medium rounded-lg px-4 py-2 border border-slate-200 hover:border-[#3586FF] transition-colors"
          onSelectChange={(value) => handleChange("bhk", value)}
          slant={false}
          required
          defaultValue={propertyDetails?.residentialAttributes?.bhk}
          error={errors.bhk}
        />

        <SelectBtnGrp
          options={facingTypes}
          label="Facing"
          labelCls="text-sm text-slate-700 font-medium mb-2"
          className="flex flex-wrap gap-2"
          btnClass="text-xs font-medium rounded-lg px-3 py-2 border border-slate-200 hover:border-[#3586FF] transition-colors"
          onSelectChange={(value) => handleChange("facing", value)}
          slant={false}
          defaultValue={propertyDetails?.residentialAttributes?.facing}
          error={errors.facing}
        />
      </div>

      {/* Floor Area & Build Up Area */}
      <div className="grid md:grid-cols-2 gap-4">
        <CustomInput
          label="Floor Area"
          type="number"
          className="md:px-3 px-2 rounded-lg border-slate-200 focus:border-[#3586FF] md:py-1 py-0.5 transition-colors"
          placeholder="Enter floor area"
          labelCls="text-sm text-slate-700 font-medium"
          value={propertyDetails?.residentialAttributes?.floorArea?.size || null}
          name="floorArea"
          rootCls="max-w-[300px]"
          maxLength={9}
          onChange={(e) => handleChange("floorArea", +e.target.value, "size")}
          unitsDropdown={{
            value: propertyDetails?.residentialAttributes?.floorArea?.unit || "sq.ft",
            options: ["sq.ft", "sq.yard", "sq.meter", "acre", "cent", "marla"],
            onChange: (val: any) => handleChange("floorArea", val, "unit"),
          }}
          required
          errorMsg={errors?.floorArea}
        />

        <CustomInput
          label="Build Up Area"
          type="number"
          labelCls="text-sm text-slate-700 font-medium"
          className="md:px-3 px-2 rounded-lg border-slate-200 md:py-1 py-0.5 focus:border-[#3586FF] transition-colors"
          placeholder="Enter build up area"
          value={propertyDetails?.residentialAttributes?.buildupArea?.size || null}
          name="buildupArea"
          rootCls="max-w-[300px]"
          maxLength={9}
          onChange={(e) => handleChange("buildupArea", +e.target.value, "size")}
          required
          unitsDropdown={{
            value: propertyDetails?.residentialAttributes?.buildupArea?.unit || null,
            options: ["sq.ft", "sq.yard", "sq.meter", "acre", "cent", "marla"],
            onChange: (val: any) => handleChange("buildupArea", val, "unit"),
          }}
          errorMsg={errors?.buildUpArea}
        />
      </div>

      {/* Bathrooms & Balcony */}
      <div className="grid md:grid-cols-2 gap-4">
        <CustomInput
          label="No of Bathrooms"
          placeholder="Enter number"
          type="number"
          labelCls="text-sm text-slate-700 font-medium"
          className="md:px-3 px-2 rounded-lg border-slate-200 md:py-1 py-0.5 focus:border-[#3586FF] transition-colors"
          value={propertyDetails?.residentialAttributes?.bathrooms || null}
          name="bathrooms"
          rootCls="max-w-[200px]"
          onChange={(e) => handleChange("bathrooms", +e.target.value)}
          required
          maxLength={2}
          errorMsg={errors?.bathrooms}
        />

        <CustomInput
          label="No of Balcony"
          placeholder="Enter number"
          type="number"
          labelCls="text-sm text-slate-700 font-medium"
          className="md:px-3 px-2 rounded-lg border-slate-200 md:py-1 py-0.5 focus:border-[#3586FF] transition-colors"
          value={propertyDetails?.residentialAttributes?.balcony || null}
          name="balcony"
          rootCls="max-w-[200px]"
          onChange={(e) => handleChange("balcony", +e.target.value)}
          required
          errorMsg={errors?.balcony}
          maxLength={2}
        />
      </div>

      <ResidentialFurnishingDetails />

      {basicDetails?.lookingType === LookingType.Sell ||
        basicDetails?.lookingType === LookingType.Rent ? (
        <>
          {/* Floor Details */}
          <div className="pt-2">
            <p className="text-sm font-semibold text-[#3586FF] mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#3586FF] rounded-full"></span>
              Floor Details
            </p>
            <div className="flex flex-wrap items-start gap-4">
              {propertyDetails?.propertyType &&
                [
                  propertyTypeEnum.Apartment,
                  propertyTypeEnum.IndependentFloor,
                  propertyTypeEnum.IndependentHouse,
                  propertyTypeEnum.Villa,
                ].includes(propertyDetails.propertyType as propertyTypeEnum) && (
                  <CustomInput
                    type="number"
                    label="Total Floors"
                    required
                    placeholder="Enter total floors"
                    labelCls="text-sm text-slate-700 font-medium"
                    value={propertyDetails?.residentialAttributes?.totalFloors || null}
                    name="totalFloors"
                      className="md:px-3 px-2 rounded-lg md:py-1 py-0.5 border-slate-200 focus:border-[#3586FF] transition-colors "
                    onChange={(e) => handleChange("totalFloors", +e.target.value)}
                    errorMsg={errors?.totalFloors}
                  />
                )}
              {propertyDetails?.propertyType &&
                [
                  propertyTypeEnum.Apartment,
                  propertyTypeEnum.IndependentFloor,
                ].includes(propertyDetails.propertyType as propertyTypeEnum) && (
                  <SingleSelect
                    label="Your Floor"
                    labelCls="text-sm text-slate-700 font-medium mb-1"
                    type="single-select"
                    buttonCls="px-4 w-full py-2 border border-slate-200 rounded-lg"
                    name="currentFloor"
                    options={Array.from(
                      {
                        length: propertyDetails?.residentialAttributes?.totalFloors || 4,
                      },
                      (_, index) => ({
                        id: index + 1,
                        floor:
                          index === 0
                            ? "Ground"
                            : index === 1
                              ? "1st"
                              : `${index + 1}th`,
                      })
                    )}
                    handleChange={(name, value) =>
                      handleChange(name as keyof ResidentialAttributes, value.id - 1)
                    }
                    openButtonCls="bg-slate-50 text-slate-800"
                    optionCls="text-sm hover:bg-blue-50 text-slate-700"
                    rootCls="w-[150px]"
                    selectedOption={
                      propertyDetails?.residentialAttributes?.currentFloor === 0
                        ? { floor: "Ground", id: 1 }
                        : {
                          floor: `${propertyDetails?.residentialAttributes?.currentFloor || 0 + 1}th`,
                          id: propertyDetails?.residentialAttributes?.currentFloor || 0 + 1,
                        }
                    }
                    optionsInterface={{ isObj: true, displayKey: "floor" }}
                    errorMsg={errors?.yourFloor}
                  />
                )}
            </div>
          </div>

          {/* Parking */}
          <div className="pt-2">
            <p className="text-sm font-semibold text-[#3586FF] mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#3586FF] rounded-full"></span>
              Parking
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <SelectBtnGrp
                label="Two Wheeler Parking"
                options={["Yes", "No"]}
                btnClass="text-xs font-medium px-4 py-2 rounded-lg border border-slate-200 hover:border-[#3586FF] transition-colors"
                labelCls="text-sm text-slate-700 font-medium mb-2"
                onSelectChange={(value) =>
                  handleChange("parking2w", value === "Yes" ? true : false)
                }
                className="flex gap-2"
                defaultValue={
                  propertyDetails?.residentialAttributes?.parking2w ? "Yes" : "No"
                }
              />
              <SelectBtnGrp
                label="Four Wheeler Parking"
                options={["Yes", "No"]}
                btnClass="text-xs font-medium px-4 py-2 rounded-lg border border-slate-200 hover:border-[#3586FF] transition-colors"
                labelCls="text-sm text-slate-700 font-medium mb-2"
                onSelectChange={(value) =>
                  handleChange("parking4w", value === "Yes" ? true : false)
                }
                className="flex gap-2"
                defaultValue={
                  propertyDetails?.residentialAttributes?.parking4w ? "Yes" : "No"
                }
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ResidentialDetails;
