import CustomInput from "@/src/common/FormElements/CustomInput";
import RichTextEditor from "@/src/common/FormElements/RichTextEditor";
import { useCompanyPropertyStore } from "@/src/stores/companyproperty";
import React, { useState } from "react";

const AboutProjectDetails = () => {
  const {
    projects,
    errors,
    projectDetails,
    selectedProjectIndex,
    updateProject,
    setProjectDetails,
  } = useCompanyPropertyStore();

  const project =
    selectedProjectIndex !== null
      ? projects[selectedProjectIndex]
      : projectDetails;
  const handleProjectChange = (name: string, value: string | number) => {
    if (selectedProjectIndex !== null) {
      updateProject(selectedProjectIndex, {
        ...projects[selectedProjectIndex],
        [name]: value,
      });
    } else {
      // Creating a new project
      setProjectDetails({
        ...projectDetails,
        [name]: value,
      });
    }
  };
  return (
   <div className="md:px-5 px-3 md:py-5 py-3 shadow-custom rounded-md">
      <p className="md:text-[18px] text-[16px] font-medium text-[#3586FF] ">
        About Project Details and specifications
      </p>
      <div className="flex flex-col md:gap-5 gap-3">
        <div className="mt-4">
          <RichTextEditor
            type={"richtext"}
            label="Enter Project Highlights"
            labelCls="label-text font-medium text-black"
            value={project?.Highlights}
            onChange={(value) => handleProjectChange("Highlights", value)}
            className="w-full h-[250px] overflow-auto  py-2 placeholder:text-[12px] mb-3"
            required
              errorMsg={errors?.Highlights}
          />
        </div>
        <div>
          <RichTextEditor
            type={"richtext"}
            label="Enter Project Specifications"
            rootCls="w-full h-[300px] overflow-auto"
            labelCls="label-text text-[#3586FF] font-medium text-black"
            value={project?.Specifications}
            onChange={(value) => handleProjectChange("Specifications", value)}
            className="w-full h-[250px] overflow-auto px-3 py-2 placeholder:text-[12px] mb-3"
            required
              errorMsg={errors?.Specifications}
          />
        </div>

        <div>
          <CustomInput
            name={"AboutProject"}
            label="Enter About Project"
            labelCls="label-text font-medium text-black"
            className="px-3 py-3 md:h-[300px] text-[14px] placeholder:text-[12px]"
            type={"textarea"}
            placeholder="Enter About Project..."
            onChange={(e) =>
              handleProjectChange("AboutProject", e.target.value)
            }
            errorMsg={errors?.AboutProject}
            value={project?.AboutProject}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default AboutProjectDetails;
