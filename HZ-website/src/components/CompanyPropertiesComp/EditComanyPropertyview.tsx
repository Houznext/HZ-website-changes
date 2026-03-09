import Button from "@/common/Button";
import CustomInput from "@/common/FormElements/CustomInput";
import { useCompanyPropertyStore } from "@/store/companyproperty";
import React, { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import CompanyAddress from "@/components/CompanyPropertiesComp/companyAddress";
import CompanyAward from "@/components/CompanyPropertiesComp/companyAward";
import CompanyProjects from "@/components/CompanyPropertiesComp/company-project";
import { FaEdit, FaTrash } from "react-icons/fa";
import { validateCompanyForm, validateForm } from "./projecthelper";
import ProjectList from "./projectList";
import ImageFileUploader from "@/common/ImageFileUploader";
import Loader from "@/components/Loader";

import { MdBackHand } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";

const EditComanyPropertyview = () => {
  const {
    companyDetails,
    companyId,
    modalState,
    errors,
    resetCompanyDetails,
    setProjects,
    setCompanyId,
    setCompanyDetails,
    setDeveloperInformation,
    setModalState,
    selectProjectForEditing,
  } = useCompanyPropertyStore();

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const fetchCompanyDetails = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.companyonboarding}/${companyId}`
      );
      if (response.status === 200) {
        setCompanyDetails({
          companyName: response.body.companyName,
          estdYear: response.body.estdYear,
          RERAId: response.body.RERAId,
          Logo: response.body.Logo || [],
          about: response.body.about,
          developerInformation: {
            Name: response.body.developerInformation.fullName,
            PhoneNumber: response.body.developerInformation.phone,
            whatsappNumber: response.body.developerInformation.whatsappNumber,
            officialEmail: response.body.developerInformation.email,
          },
          locatedIn: response.body.locatedIn,
          awards: response.body.awards,
        });
        setProjects(response?.body?.projects || []);
        setLoading(false);
        toast.success("Company fetched successfully");
      }
    } catch (error) {
      console.log("error occured in company fetching", error);
      toast.error("Error occured in company fetching");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.query.propertyId) {
      setCompanyId(Number(router?.query?.propertyId));
      fetchCompanyDetails();
    }
  }, [router?.isReady, companyId]);

  // ----handle input changes----
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    developer?: boolean
  ) => {
    const { name, value, type } = e.target;

    const formattedValue =
      type === "number" ? parseInt(value, 10) || "" : value;

    if (developer) {
      setDeveloperInformation({ [name]: formattedValue });
    } else {
      setCompanyDetails({ [name]: formattedValue });
    }
  };

  const handleCompanySubmit = async () => {
    console.log("companyDetails", errors);
    if (!validateCompanyForm()) {
      toast.error("Validation Failed. Please check the form.");
      return;
    }

    if (!validateForm()) {
      toast.error("Validation Failed. Please check the form.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        companyName: companyDetails.companyName,
        estdYear: parseInt(companyDetails.estdYear),
        RERAId: companyDetails.RERAId,
        Logo: companyDetails.Logo || "",
        about: companyDetails.about,
        developerInformation: {
          Name: companyDetails.developerInformation.Name,
          PhoneNumber: companyDetails.developerInformation.PhoneNumber,
          whatsappNumber: companyDetails.developerInformation.whatsappNumber,
          officialEmail: companyDetails.developerInformation.officialEmail,
        },
      };

      const res = await apiClient.patch(
        `${apiClient.URLS.companyonboarding}/${companyId}`,
        payload
      );

      if (res.status === 200) {
        toast.success("Successfully updated company details");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error occurred while submitting", error);
      toast.error("Error while creating company");
      setLoading(false);
    }
  };
  const handleBack = () => {
    resetCompanyDetails();
    router.push("/user/company-property");
  };

  const handleEditProject = (projectId: number) => {
    selectProjectForEditing(projectId);
    setModalState({ ...modalState, property: true });
  };

  const handleFileChange = async (url: string[]) => {
    setCompanyDetails({
      Logo: url,
    });
  };

  if (loading) {
    return (
      <div className="w-full">
        <Loader />
      </div>
    );
  }

  // ---common input components
  const renderInput = (
    name: string,
    label: string,
    type: "text" | "number" | "email" | "password" | "textarea",
    placeholder?: string
  ) => (
    <CustomInput
      name={name}
      label={label}
      labelCls={"md:text-[16px] text-[12px] font-medium"}
      className={`px-3 md:py-[6px] py-[3px] text-[12px] md:text-[14px] placeholder:md:text-[14px]  ${type == "textarea" ? "h-[150px]" : ""
        }`}
      type={type}
      placeholder={placeholder}
      onChange={handleInputChange}
      errorMsg={errors[name as keyof typeof errors]}
      value={companyDetails[name as keyof typeof companyDetails] || ("" as any)}
    />
  );

  const renderDeveloperInput = (
    name: string,
    label: string,
    type: "text" | "number" | "email" | "password",
    placeholder = ""
  ) => (
    <CustomInput
      name={name}
      label={label}
      labelCls={"md:text-[16px] text-[12px] font-medium"}
      className="px-3 md:py-[6px] py-[3px] text-[14px] placeholder:text-[12px]"
      type={type}
      placeholder={placeholder}
      value={
        companyDetails.developerInformation[
        name as keyof typeof companyDetails.developerInformation
        ] || ""
      }
      onChange={(e) => handleInputChange(e, true)}
      errorMsg={
        errors[`developerInformation${name[0].toUpperCase()}${name.slice(1)}`]
      }
      disabled={name === "officialEmail"}
      required
    />
  );
  return (
    <div className="relative flex flex-col gap-3 md:px-10 px-4 py-5 w-full ">
      <div
        className="flex flex-row justify-start items-center gap-2 cursor-pointer"
        onClick={handleBack}
      >
        <IoArrowBack />
        <p className="md:text-[16px] text-[14px] font-medium">Back</p>
      </div>
      <h1 className="md:text-[24px] text-[18px] font-medium">
        Company Properties OnBoarding
      </h1>
      <div className="w-full  justify-end  md:px-0 px-2 py-4">
        <div className="flex fle-col justify-end">
          <Button
            onClick={() => setModalState({ ...modalState, property: true })}
            className="mt-5 md:px-10 md:py-[10px] px-4 py-2 text-[12px] md:text-[14px] bg-[#3586FF] text-white rounded-md font-medium"
          >
            + Add Project
          </Button>
        </div>
        <div>
          <CompanyProjects />
        </div>
        <div className="w-full">
          <ProjectList />
        </div>
      </div>

      <section>
        <div className="flex flex-col rounded-md  w-full md:px-7 px-4 py-4 shadow-custom mb-5 bg-white">
          <p className="md:text-[24px] text-[16px] font-medium mb-3 text-[#3586FF]">
            Company Basic Details
          </p>
          <div className="flex flex-col gap-3 mt-5 ">
            <div className=" grid md:grid-cols-2 grid-cols-1 md:gap-6 gap-3">
              <div>
                {renderInput(
                  "companyName",
                  "Enter Company Name",
                  "text",
                  "Enter Company Name"
                )}
              </div>
              <div>
                {renderInput(
                  "estdYear",
                  "Enter Established Year",
                  "number",
                  "Enter Established Year"
                )}
              </div>
              <div>
                {renderInput(
                  "RERAId",
                  "Enter RERA Number",
                  "text",
                  "Enter RERA Number eg:P91343423233"
                )}
              </div>

            </div>
            <div className=" grid md:grid-cols-2 grid-cols-1 md:gap-6 gap-3">
              <div className="mb-5">
                <ImageFileUploader
                  type={"file"}
                  label="Upload Company Logo"
                  labelCls="md:text-[16px] text-[12px] tetx-[#3B82F6] font-medium"
                  onFileChange={(data) => {
                    handleFileChange(data);
                  }}
                  folderName="companyLogo"
                  initialFileUrl={
                    companyDetails?.Logo?.length > 0
                      ? [companyDetails.Logo[0]]
                      : []
                  }
                />
              </div>

              <div className="flex flex-row gap-5 justify-between mt-4">
                {renderInput(
                  "about",
                  "Enter About Company...",
                  "textarea",
                  "About Company ..."
                )}
              </div>
            </div>

            <div className=" rounded-md  ">
              <p className="md:text-[20px] text-[16px] font-medium text-[#3586FF]">
                Developer Information :
              </p>
              <div className="flex md:flex-row flex-col gap-4 mt-4 shadow-custom px-5 py-4 rounded-md">
                <div className="w-full  flex flex-col md:gap-5 gap-4">
                  {renderDeveloperInput(
                    "Name",
                    "Developer Name",
                    "text",
                    "Enter Developer Name"
                  )}
                  {renderDeveloperInput(
                    "PhoneNumber",
                    "Phone Number",
                    "number",
                    "Enter Phone Number "
                  )}
                </div>
                <div className="w-full flex flex-col gap-5">
                  {renderDeveloperInput(
                    "whatsappNumber",
                    "WhatsApp Number",
                    "number",
                    "Enter whatsapp number .."
                  )}
                  {renderDeveloperInput(
                    "officialEmail",
                    "Official Email",
                    "text",
                    "Enter official email..."
                  )}
                </div>
              </div>
            </div>
            <div className="flex w-full justify-end">
              <Button
                onClick={handleCompanySubmit}
                className="mt-5 md:px-10 md:py-[10px] px-4 py-2 text-[12px] md:text-[16px] bg-[#3586FF] text-white rounded-md font-medium"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </section>
      <div className="mt-4 flex flex-col gap-4 w-full relative">
        <div>
          <CompanyAddress />
        </div>
        <div>
          <CompanyAward />
        </div>
      </div>
    </div>
  );
};

export default EditComanyPropertyview;
