import CustomInput from "@/src/common/FormElements/CustomInput";
import SelectBtnGrp from "@/src/common/SelectBtnGrp";
import { useCompanyPropertyStore } from "@/src/stores/companyproperty";
import React, { useEffect, useState } from "react";
// import { companyPropertyType } from "../Property/PropertyDetails/PropertyHelpers";
import Modal from "@/src/common/Modal";
import Button from "@/src/common/Button";
import { Apartment, MapOutlined, NaturePeopleOutlined } from "@mui/icons-material";
import WbShadeOutlinedIcon from '@mui/icons-material/WbShadeOutlined';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import HolidayVillageOutlinedIcon from '@mui/icons-material/HolidayVillageOutlined';
export enum propertyTypeEnum {
  Apartment = "Apartment",
  IndependentFloor = "IndependentFloor",
  IndependentHouse = "IndependentHouse",
  Villa = "Villa",
  Plot = "Plot",
  AgriculturalLand = "AgriculturalLand",
}

export const companyPropertyType: { name: string; icon: JSX.Element }[] = [
    { name: propertyTypeEnum.Apartment, icon: <Apartment /> },
    { name: propertyTypeEnum.IndependentFloor, icon: <WbShadeOutlinedIcon /> },
    { name: propertyTypeEnum.IndependentHouse, icon: <MapsHomeWorkIcon /> },
    { name: propertyTypeEnum.Villa, icon: <HolidayVillageOutlinedIcon /> },
    { name: propertyTypeEnum.Plot, icon: <MapOutlined /> },
    { name: propertyTypeEnum.AgriculturalLand, icon: <NaturePeopleOutlined /> }
]


const CompanyBasicDetails = () => {
  const {
    projects,
    projectDetails,
    errors,
    selectedProjectIndex,
    originalProjectDetails,
    updateProject,
    setProjectDetails,
  } = useCompanyPropertyStore();
  const [typeModal, setTypeModal] = useState(false);
  const [pendingType, setPendingType] = useState<string | null>(null);

  const project =
    selectedProjectIndex !== null
      ? projects[selectedProjectIndex]
      : projectDetails;

  useEffect(() => {
    if (
      selectedProjectIndex === null &&
      !projectDetails &&
      originalProjectDetails
    ) {
      setProjectDetails(originalProjectDetails);
    }
  }, [selectedProjectIndex, projectDetails, originalProjectDetails]);

  const handleProjectChange = (
    name: string,
    value: any,
    fieldType?: "size" | "unit"
  ) => {
    if (!project) return;

    let updatedProject = { ...project };
    const structuredFields = [
      "ProjectArea",
      "ProjectSize",
      "MinSize",
      "MaxSize",
    ];

    if (structuredFields.includes(name)) {
      const current = project[name] || { size: null, unit: "" };

      updatedProject = {
        ...project,
        [name]: {
          ...current,
          [fieldType === "unit" ? "unit" : "size"]: value,
        },
      };
    } else if (name === "propertyType") {
      updatedProject = {
        ...project,
        propertyType: {
          ...(project.propertyType ?? {
            typeName: "",
            description: "",
            additionalAttributes: null,
            units: [],
          }),
          typeName: value,
        },
      };
    } else if (name === "description") {
      updatedProject = {
        ...project,
        propertyType: {
          ...project.propertyType,
          description: value,
        },
      };
    } else {
      updatedProject = { ...project, [name]: value };
    }

    if (selectedProjectIndex !== null) {
      updateProject(selectedProjectIndex, updatedProject);
    } else {
      console.log("name", updatedProject);
      setProjectDetails(updatedProject);
    }
  };

  const handlePropertyType = (value: any) => {
    const newType = value?.name;
    const currentType = project?.propertyType?.typeName;

    if (currentType && newType !== currentType) {
      setPendingType(newType);
      setTypeModal(true);
    } else {
      handleProjectChange("propertyType", newType);
    }
  };

  const handleConfirmTypeChange = () => {
    if (!originalProjectDetails) return;

    setProjectDetails(originalProjectDetails);
    handleProjectChange("propertyType", pendingType);
    setTypeModal(false);
    setPendingType(null);
  };

  console.log("project", project?.Name);

  return (
    <div>
      <section className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#3586FF]/5 to-transparent border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="sub-heading font-semibold text-[#3586FF]">
              Basic Project Details
            </h3>
            <span className="hidden md:inline-flex items-center gap-1.5 sublabel-text font-medium text-[#3586FF] bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
              Required fields marked with <span className="text-red-500">*</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-6">
          <div className="max-w-[400px]">
            <CustomInput
              name="Name"
              className="w-full px-3 py-2 rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text"
              label="Enter Project Name"
              labelCls="label-text text-gray-700 font-medium"
              placeholder="Enter Project Name"
              required
              type="text"
              onChange={(e) => handleProjectChange("Name", e.target.value)}
              errorMsg={errors?.Name}
              value={project?.Name}
            />
          </div>

          <SelectBtnGrp
            label="Select Property Type"
            labelCls="label-text text-gray-700 font-medium mb-2"
            options={companyPropertyType}
            className="gap-2 flex-wrap"
            btnClass="sublabel-text font-medium rounded-lg px-4 py-2.5 shadow-sm border border-gray-200 hover:border-[#3586FF] transition-all"
            onSelectChange={(value: any) => handlePropertyType(value)}
            defaultValue={project?.propertyType?.typeName}
            slant={false}
            error={errors?.propertyType}
          />

          <div className="flex md:flex-row flex-col w-full justify-between md:gap-6 gap-4">
            <CustomInput
              name="ProjectArea"
              className="w-full px-3 py-2 rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text"
              placeholder="Enter Project Area"
              label="Enter Project Area"
              labelCls="label-text text-gray-700 font-medium"
              type="number"
              onChange={(e) =>
                handleProjectChange("ProjectArea", +e.target.value, "size")
              }
              unitsDropdown={{
                value: project?.ProjectArea?.unit,
                options: [
                  "sq.ft",
                  "sq.yard",
                  "sq.meter",
                  "acre",
                  "cent",
                  "marla",
                ],
                onChange: (val: any) =>
                  handleProjectChange("ProjectArea", val, "unit"),
              }}
              required
              errorMsg={errors?.ProjectArea}
              value={project?.ProjectArea?.size || null}
            />

            <CustomInput
              name="ProjectSize"
              className="w-full px-3 py-2 rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text"
              placeholder="Enter Project Size"
              label="Enter Project Size"
              labelCls="label-text text-gray-700 font-medium"
              type="number"
              onChange={(e) =>
                handleProjectChange("ProjectSize", +e.target.value, "size")
              }
              unitsDropdown={{
                value: project?.ProjectSize?.unit,
                options: [
                  "sq.ft",
                  "sq.yard",
                  "sq.meter",
                  "acre",
                  "cent",
                  "marla",
                ],
                onChange: (val: any) =>
                  handleProjectChange("ProjectSize", val, "unit"),
              }}
              errorMsg={errors?.ProjectSize}
              required
              value={project?.ProjectSize?.size || null}
            />
          </div>

          <div className="flex md:flex-row flex-col w-full justify-between md:gap-6 gap-4">
            <CustomInput
              name="MinSize"
              className="w-full px-3 py-2 rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text"
              placeholder="Min Size (e.g., 5475 sq. ft.)"
              label="Min Size"
              labelCls="label-text text-gray-700 font-medium"
              type="number"
              onChange={(e) =>
                handleProjectChange("MinSize", +e.target.value, "size")
              }
              unitsDropdown={{
                value: project?.MinSize?.unit,
                options: [
                  "sq.ft",
                  "sq.yard",
                  "sq.meter",
                  "acre",
                  "cent",
                  "marla",
                ],
                onChange: (val: any) =>
                  handleProjectChange("MinSize", val, "unit"),
              }}
              required
              errorMsg={errors?.MinSize}
              value={project?.MinSize?.size}
            />

            <CustomInput
              name="MaxSize"
              className="w-full px-3 py-2 rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text"
              placeholder="Max Size (e.g., 10910 sq. ft.)"
              label="Max Size"
              labelCls="label-text text-gray-700 font-medium"
              type="number"
              onChange={(e) =>
                handleProjectChange("MaxSize", +e.target.value, "size")
              }
              unitsDropdown={{
                value: project?.MaxSize?.unit,
                options: [
                  "sq.ft",
                  "sq.yard",
                  "sq.meter",
                  "acre",
                  "cent",
                  "marla",
                ],
                onChange: (val: any) =>
                  handleProjectChange("MaxSize", val, "unit"),
              }}
              required
              errorMsg={errors?.MaxSize}
              value={project?.MaxSize?.size}
            />
          </div>

          {/* Price Details Section */}
          <div className="mt-2">
            <h4 className="sub-heading font-semibold text-[#3586FF] mb-4">
              Price Details <span className="text-red-500">*</span>
            </h4>
            <div className="p-5 rounded-xl bg-gradient-to-r from-blue-50 to-transparent border border-blue-100 flex md:flex-row flex-col md:gap-6 gap-4">
              <CustomInput
                label="Enter Min Price (in Rs.)"
                name="minPrice"
                labelCls="label-text text-gray-700 font-medium"
                className="w-full px-3 py-2 rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text bg-white"
                placeholder="Enter Min Price"
                type="number"
                value={project?.minPrice}
                onChange={(e) =>
                  handleProjectChange("minPrice", +e.target.value)
                }
                errorMsg={errors.minPrice}
              />
              <CustomInput
                name="maxPrice"
                label="Enter Max Price (in Rs.)"
                placeholder="Enter Max Price"
                className="w-full px-3 py-2 rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text bg-white"
                type="number"
                labelCls="label-text text-gray-700 font-medium"
                value={project?.maxPrice}
                onChange={(e) =>
                  handleProjectChange("maxPrice", +e.target.value)
                }
                errorMsg={errors.maxPrice}
              />
            </div>
          </div>

          <div>
            <SelectBtnGrp
              label="Zero Brokerage?"
              options={["Yes", "No"]}
              btnClass="sublabel-text font-medium rounded-lg px-4 py-2 border border-gray-200 hover:border-[#3586FF] transition-all"
              labelCls="label-text text-gray-700 font-medium mb-3"
              onSelectChange={(value) =>
                handleProjectChange(
                  "isBrokerage",
                  value === "Yes" ? false : true
                )
              }
              className="flex gap-3"
              defaultValue={project?.isBrokerage === false ? "Yes" : "No"}
              error={errors?.isBrokerage}
            />
          </div>

          <CustomInput
            name="Description"
            className="w-full px-4 py-3 rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text min-h-[120px]"
            placeholder="Enter Project Description"
            label="Enter Property Description"
            labelCls="label-text text-gray-700 font-medium"
            type="textarea"
            onChange={(e) => handleProjectChange("Description", e.target.value)}
            errorMsg={errors?.Description}
            value={project?.Description}
          />
        </div>
      </section>

      {/* Property Type Change Modal */}
      <Modal
        isOpen={typeModal}
        closeModal={() => {
          setTypeModal(false);
        }}
        className="md:max-w-[420px] max-w-[320px] rounded-xl"
        isCloseRequired={false}
      >
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="bg-amber-50 text-amber-500 rounded-full p-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center">
            Change Property Type?
          </h3>
          <p className="sublabel-text text-gray-500 text-center leading-relaxed">
            Changing the property type may affect project-specific
            configurations. Are you sure you want to continue?
          </p>
          <div className="flex gap-3 mt-2 w-full">
            <Button
              className="flex-1 py-2.5 btn-text font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
              onClick={() => {
                setTypeModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 py-2.5 btn-text font-semibold rounded-lg bg-[#3586FF] hover:bg-[#2563eb] text-white transition-all"
              onClick={handleConfirmTypeChange}
            >
              Continue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CompanyBasicDetails;
