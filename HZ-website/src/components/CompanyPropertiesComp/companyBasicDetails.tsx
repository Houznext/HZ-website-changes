import CustomInput from "@/common/FormElements/CustomInput";
import SelectBtnGrp from "@/common/SelectBtnGrp";
import { useCompanyPropertyStore } from "@/store/companyproperty";
import React, { useState, useEffect } from "react";
import { rentPropertyType } from "../Property/PropertyDetails/PropertyHelpers";
import { companyPropertyType } from "./projecthelper";
import Modal from "@/common/Modal";
import Button from "@/common/Button";

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
      const current = (project as any)[name] || { size: null, unit: "" };

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
          typeName: project.propertyType?.typeName ?? "",
          description: value,
          additionalAttributes:
            project.propertyType?.additionalAttributes ?? null,
          units: project.propertyType?.units ?? [],
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
      <section className="px-5 py-5 rounded-md shadow-custom bg-white mb-10">
        <div className="flex flex-col gap-4 mb-5 md:px-3 px-1">
          <p className="md:text-[18px] max-w-[400px] text-[16px] font-medium text-[#3586FF] mb-3">
            Basic Project Details
          </p>

          <div className="max-w-[400px]">
            <CustomInput
              name="Name"
              className="w-full px-2 md:py-1 py-0.5 placeholder:text-[12px] "
              label="Enter Project Name"
              labelCls="md:text-[14px] text-[12px] font-medium text-black"
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
            labelCls="md:text-[14px] text-[12px] font-medium text-black mb-3"
            options={companyPropertyType}
            className="gap-2 flex-wrap"
            btnClass="md:text-[14px]  text-[12px]  font-medium rounded-md md:px-[21px] px-[10px] shadow-custom md:py-[10px] py-[5px] border-[1px] border-gray-200"
            onSelectChange={(value: any) => handlePropertyType(value)}
            defaultValue={project?.propertyType?.typeName}
            slant={false}
            error={errors?.propertyType}
          />

          <div className="flex md:flex-row flex-col w-full justify-between md:gap-10 gap-3">
            <CustomInput
              name="ProjectArea"
              className="w-full px-3 md:py-[6px] py-[2px] placeholder:text-[12px]"
              placeholder="Enter Project Area "
              label="Enter Project Area "
              labelCls="md:text-[14px] text-[12px] font-medium"
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
              errorMsg={errors?.ProjectArea}
              value={project?.ProjectArea?.size || null}
            />

            <CustomInput
              name="ProjectSize"
              className="w-full px-3 md:py-[6px] py-[2px] placeholder:text-[12px]"
              placeholder="Enter Project Size"
              label="Enter Project Size"
              labelCls="md:text-[14px] text-[12px] font-medium"
              type="number"
              onChange={(e) =>
                handleProjectChange("ProjectSize", +e.target.value, "size")
              }
              unitsDropdown={{
                value: project?.ProjectSize?.unit,
                options: ["unit"],
                onChange: (val: any) =>
                  handleProjectChange("ProjectSize", val, "unit"),
              }}
              errorMsg={errors?.ProjectSize}
              value={project?.ProjectSize?.size || null}
            />
          </div>

          <div className="flex md:flex-row flex-col w-full justify-between md:gap-10 gap-3">
            <CustomInput
              name="MinSize"
              className="w-full px-3 md:py-[6px] py-[2px] placeholder:text-[12px]"
              placeholder="Min Size (e.g., 5475 sq. ft.)"
              label="Min Size"
              labelCls="md:text-[14px] text-[12px] font-medium"
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
              errorMsg={errors?.MinSize}
              value={project?.MinSize?.size}
            />

            <CustomInput
              name="MaxSize"
              className="w-full px-3 md:py-[6px] py-[2px] placeholder:text-[12px]"
              placeholder="Max Size (e.g., 10910 sq. ft.)"
              label="Max Size"
              labelCls="md:text-[14px] text-[12px] font-medium"
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
              errorMsg={errors?.MaxSize}
              value={project?.MaxSize?.size}
            />
          </div>

          <div>
            <p className="md:text-[18px] font-medium text-[16px] text-[#3586FF] mb-5">
              Price Details: <span className="text-red-600">*</span>
            </p>
            <div className="md:px-4 px-2 py-2 shadow-custom rounded-md flex md:flex-row flex-col md:gap-10 gap-4 items-center justify-between">
              <CustomInput
                label="Enter Min Price (in Rs.)"
                name="minPrice"
                labelCls="md:text-[14px] text-[12px] font-medium"
                className="w-full px-3 md:py-[6px] py-[2px] placeholder:text-[12px]"
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
                className="w-full px-3 md:py-[6px] py-[2px] placeholder:text-[12px]"
                type="number"
                labelCls="md:text-[14px] text-[12px] font-medium"
                value={project?.maxPrice}
                onChange={(e) =>
                  handleProjectChange("maxPrice", +e.target.value)
                }
                errorMsg={errors.maxPrice}
              />
            </div>
          </div>

          <CustomInput
            name="Description"
            className="w-full px-4 py-4 placeholder:text-[12px] text-[12px]"
            placeholder="Enter Project Description"
            label="Enter Property Description"
            labelCls="md:text-[14px] text-[12px] font-medium"
            type="textarea"
            onChange={(e) => handleProjectChange("Description", e.target.value)}
            errorMsg={errors?.Description}
            value={project?.Description}
          />
        </div>
      </section>
      <Modal
        isOpen={typeModal}
        closeModal={() => {
          setTypeModal(false);
        }}
        className="md:max-w-[400px] max-w-[300px] md:ml-[0px] ml-[15px] py-10 rounded-md"
        isCloseRequired={false}
      >
        <div className="max-w-[310px] mx-auto flex flex-col gap-5">
          <p className="md:text-[14px] text-[12px] text-center font-medium">
            Changing the property type may affect project-specific
            configurations. Are you sure you want to continue?
          </p>
          <div className="flex flex-row gap-5 mx-auto">
            <Button
              className="md:px-[34px] px-[14px] md:py-[8px] py-[4px] md:text-[14px] text-[12px] border-2 border-[#3B82F6] rounded-md"
              onClick={() => {
                setTypeModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="md:px-[34px] px-[14px] md:py-[8px] py-[4px] md:text-[14px] text-[12px] bg-[#3B82F6] text-white rounded-md"
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
