import FloatingDatePicker from "@/src/common/FloatingDateInput";
import SelectBtnGrp from "@/src/common/SelectBtnGrp";
import React from "react";
import {
  ConstructionStatusEnum,
  ConstructionStatusOptions,
} from "../Property/PropertyDetails/PropertyHelpers";
import { useCompanyPropertyStore } from "@/src/stores/companyproperty";
import { FaCalendarAlt } from "react-icons/fa";
import CustomInput from "@/src/common/FormElements/CustomInput";
import CustomDate from "@/src/common/FormElements/CustomDate";
import YearSelect from "@/src/common/FormElements/YearSelect";

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

    let updatedConstructionStatus = {
      ...project.constructionStatus,
      [key]: value,
    };

    if (key === "status" && typeof value === "string") {
      if (value === ConstructionStatusEnum.UnderConstruction) {
        updatedConstructionStatus = {
          status: value,
          possessionBy: null,
          ageOfProperty: null,
          possessionYears: null,
          launchedDate: null,
        };
      } else if (value === ConstructionStatusEnum.NewLaunched) {
        updatedConstructionStatus = {
          status: value,
          ageOfProperty: null,
          possessionYears: null,
          possessionBy: null,
          launchedDate: null, 
        };
      } else {
        updatedConstructionStatus = {
          status: value,
          ageOfProperty: null,
          possessionYears: null,
          possessionBy: null,
          launchedDate: null, 
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
    <div className="md:px-5 px-3 md:py-5 py-3 shadow-custom rounded-md">
      <p className="md:text-[20px] text-[16px] font-medium text-[#3586FF]  mb-5">
        Construction Status
      </p>
      <div>
        <SelectBtnGrp
          options={ConstructionStatusOptions}
          label="Construction Status"
          labelCls="md:text-[14px] text-[12px] font-medium text-black mb-3"
          className="gap-2 mb-4 overflow-auto"
          btnClass="md:text-[14px] text-[12px] font-medium rounded-md md:px-[18px] px-[10px] shadow-custom md:py-[10px] py-[8px] border-[1px] border-gray-200 text-nowrap"
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
              onChange={(value) => handleChange("ageOfProperty", value)}
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
              onChange={(value) => handleChange("possessionYears", +value)}
              required
              errorMsg={errors?.possessionYears}
            />
            {project?.constructionStatus?.status ===
              ConstructionStatusEnum.NewLaunched && (
                <div className="w-full">
                   
              <CustomDate
                label="Launched Date"
                labelCls="md:text-[14px] text-[12px] font-medium"
                name="launchedDate"
                rootCls="max-w-[300px]"
                value={project?.constructionStatus?.launchedDate || ""}
                onChange={(e) => handleChange("launchedDate", e.target.value)}
                required
                rightIcon={<FaCalendarAlt />}
                errorMsg={errors?.launchedDate}
              />
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConstructionStatus;
