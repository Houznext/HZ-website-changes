import FloatingDatePicker from "@/common/FormElements/FloatingDateInput";
import SelectBtnGrp from "@/common/SelectBtnGrp";
import React from "react";
import {
  ConstructionStatusEnum,
  ConstructionStatusOptions,
} from "../Property/PropertyDetails/PropertyHelpers";
import { useCompanyPropertyStore } from "@/store/companyproperty";
import { FaCalendarAlt } from "react-icons/fa";
import CustomInput from "@/common/FormElements/CustomInput";
import YearSelect from "@/common/YearSelect";
import CustomDate from "@/common/FormElements/CustomDate";

const ConstructionStatus = () => {
  const {
    projects,
    errors,
    projectDetails,
    selectedProjectIndex,
    originalProjectDetails,
    updateProject,
    setProjectDetails,
  } = useCompanyPropertyStore();
  const project =
    selectedProjectIndex !== null
      ? projects[selectedProjectIndex]
      : projectDetails || originalProjectDetails;

  const handleChange = (key: string, value: string | number | Date | null) => {
    if (!project) return;
    const existingStatus = project.constructionStatus?.status ?? "";

    let updatedConstructionStatus = {
      status: existingStatus,
      ...project.constructionStatus,
      [key]: value,
    };

    if (key === "status") {
      if (value === ConstructionStatusEnum.UnderConstruction) {
        updatedConstructionStatus = {
          status: value,
          possessionBy: null,
        };
      } else {
        updatedConstructionStatus = {
          status: value as string,
          ageOfProperty: undefined,
          possessionYears: undefined,
        };
      }
    }

    if (selectedProjectIndex !== null) {
      updateProject(selectedProjectIndex, {
        ...projects[selectedProjectIndex],
        constructionStatus: updatedConstructionStatus,
      });
    } else {
      setProjectDetails({
        ...project,
        constructionStatus: updatedConstructionStatus,
      });
    }
  };

  return (
    <div className="px-5 py-5 shadow-custom rounded-md">
      <p className="md:text-[20px] text-[16px] font-medium text-[#3586FF] mb-5">
        Construction Status
      </p>
      <div>
        <SelectBtnGrp
          options={ConstructionStatusOptions}
          label="Construction Status"
          labelCls="md:text-[14px] text-[12px] font-medium text-black mb-3"
          className="gap-2 mb-4 overflow-auto"
          btnClass="md:text-[14px] text-[12px] font-medium rounded-md px-[21px] shadow-custom py-[10px] border-[1px] border-gray-200 text-nowrap"
          onSelectChange={(value: any) => handleChange("status", value)}
          slant={false}
          defaultValue={project?.constructionStatus?.status}
          error={errors?.status}
        />

        {project?.constructionStatus?.status ===
          ConstructionStatusEnum.UnderConstruction ? (
          <CustomDate
            label="Possession By"
            labelCls="md:text-[14px] text-[12px] font-medium"
            name="possessionBy"
            rootCls="max-w-[300px]"
            value={project?.constructionStatus?.possessionBy || ""}
            onChange={(e) => handleChange("possessionBy", e.target.value)}
            required
            rightIcon={<FaCalendarAlt />}
            errorMsg={errors?.possessionBy}
          />
        ) : (
          <div className="flex flex-col gap-2 max-w-[400px]">
            <YearSelect
              label="Age of Property (years)"
              type="number"
              labelCls="md:text-[14px] text-[12px] font-medium text-black"
              value={project?.constructionStatus?.ageOfProperty || ""}
              name="ageOfProperty"
              placeholder="Enter age of property"
              className="py-1"
              onChange={(value: any) => handleChange("ageOfProperty", value)}
              required
              errorMsg={errors?.ageOfProperty}
            />
            <YearSelect
              label="Possession Years"
              type="number"
              labelCls="md:text-[14px] text-[12px] font-medium text-black"
              value={project?.constructionStatus?.possessionYears || ""}
              name="possessionYears"
              placeholder="Enter possession years"
              className="py-1"
              onChange={(value: any) => handleChange("possessionYears", +value)}
              required
              errorMsg={errors?.possessionYears}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConstructionStatus;
