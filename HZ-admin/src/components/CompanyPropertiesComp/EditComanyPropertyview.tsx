import Button from "@/src/common/Button";
import CustomInput from "@/src/common/FormElements/CustomInput";
import { useCompanyPropertyStore } from "@/src/stores/companyproperty";
import React, { useEffect, useState } from "react";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import CompanyAddress from "./companyAddress";
import CompanyAward from "./companyAward";
import CompanyProjects from "./company-project";
import { validateCompanyForm, validateForm } from "./projecthelper";
import ProjectList from "./projectList";
import ImageFileUploader from "@/src/common/ImageFileUploader";
import Loader from "@/src/common/Loader";
import { IoArrowBack } from "react-icons/io5";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";

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
    setProjectDetails,originalProjectDetails
  } = useCompanyPropertyStore();

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { hasPermission, permissions } = usePermissionStore((state) => state);

  const fetchCompanyDetails = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.company_Onboarding}/${companyId}`,{},true
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
      setCompanyId(router?.query?.propertyId as string);
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
        `${apiClient.URLS.company_Onboarding}/${companyId}`,
        payload,
        true
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
    // resetCompanyDetails();
    router.push("/company-property");
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
      <div className="w-full min-h-[400px] flex items-center justify-center">
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
      labelCls="label-text text-gray-700 font-medium"
      className={`w-full px-3  rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text ${
        type === "textarea" ? "h-[120px]" : ""
      }`}
      type={type}
      required
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
      labelCls="label-text text-gray-700 font-medium"
      className="w-full px-3 rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text"
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
    <div className="relative flex flex-col gap-4 md:px-8 px-4 py-6 w-full">
      {/* Back Button */}
      <div
        className="flex flex-row justify-start items-center gap-2 cursor-pointer hover:text-[#3586FF] transition-colors"
        onClick={handleBack}
      >
        <IoArrowBack className="w-4 h-4" />
        <p className="label-text font-medium">Back</p>
      </div>

      {/* Page Header */}
      <h1 className="heading-text font-bold text-gray-800 border-b border-gray-200 pb-4">
        Company Properties OnBoarding
      </h1>

      {/* Projects Section */}
      <div className="w-full py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="sub-heading font-bold md:text-[16px] text-[14px] text-[#3586FF]">Projects</h2>
          <CustomTooltip
            label="Access Restricted Contact Admin"
            position="bottom"
            tooltipBg="bg-black/60 backdrop-blur-md"
            tooltipTextColor="text-white py-2 px-4 font-medium"
            labelCls="sublabel-text font-medium"
            showTooltip={!hasPermission("project", "create")}
          >
            
            <Button
  onClick={() => {
    setProjectDetails({
      ...originalProjectDetails,
      // Reset basic fields
      id: undefined,
      Name: "",
      Description: "",
      Highlights: null,
      AboutProject: "",
      ProjectAmenities: [],
      faqs: [],
      sellers: [],

      // Reset sizes and prices
      ProjectArea: null,
      ProjectSize: null,
      MinSize: null,
      MaxSize: null,
      minPrice: null,
      maxPrice: null,

      // Reset construction status
      constructionStatus: {
        status: "",
        ageOfProperty: undefined,
        possessionYears: undefined,
        possessionBy: null,
        launchedDate: null,
      },

      // Reset location
      location: {
        id: undefined,
        city: "",
        state: "",
        street: "",
        locality: "",
        subLocality: "",
        landmark: "",
        latitude: "",
        longitude: "",
        place_id: "",
        zipCode: null,
        country: "India",
      },

      // Reset media
      mediaDetails: {
        propertyImages: [],
        propertyVideo: [],
      },

      // Reset propertyType
      propertyType: {
        typeName: "",
        description: "",
        additionalAttributes: null,
        units: [],
      },
    });

    setModalState({ ...modalState, property: true });
  }}
  className="bg-[#3586FF] hover:bg-[#2563eb] text-white btn-text font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5"
>
  <span>+</span> Add Project
</Button>

          </CustomTooltip>
        </div>
        <CompanyProjects />
        <div className="w-full bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <ProjectList />
        </div>
      </div>

      {/* Company Details Section */}
      <section className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#3586FF]/5 to-transparent border-b border-gray-100">
          <h3 className="sub-heading font-semibold text-[#3586FF]">
            Company Basic Details
          </h3>
        </div>

        <div className="flex flex-col gap-5 p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 w-full gap-4">
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              {renderInput(
                "companyName",
                "Company Name",
                "text",
                "Enter Company Name"
              )}
            </div>
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              {renderInput(
                "estdYear",
                "Established Year",
                "number",
                "Enter Established Year"
              )}
            </div>
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              {renderInput(
                "RERAId",
                "RERA Number",
                "text",
                "Enter RERA Number eg:P91343423233"
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 md:grid-cols-1 grid-cols-1 gap-4">
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <ImageFileUploader
                type={"file"}
                label="Upload Company Logo"
                labelCls="label-text text-gray-700 font-medium"
                onFileChange={(data) => {
                  handleFileChange(data);
                }}
                folderName="companylogo"
                initialFileUrl={
                  companyDetails?.Logo?.length > 0
                    ? [companyDetails.Logo[0]]
                    : []
                }
              />
            </div>
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              {renderInput(
                "about",
                "About Company",
                "textarea",
                "About Company ..."
              )}
            </div>
          </div>

          {/* Developer Information Sub-section */}
          <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-5 mt-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 bg-[#3586FF] rounded-full"></div>
              <h4 className="sub-heading font-semibold text-[#3586FF]">
                Developer Information
              </h4>
            </div>

            <div className="flex md:flex-row flex-col gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="w-full flex flex-col gap-4">
                <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                  {renderDeveloperInput(
                    "Name",
                    "Developer Name",
                    "text",
                    "Enter Developer Name"
                  )}
                </div>
                <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                  {renderDeveloperInput(
                    "PhoneNumber",
                    "Phone Number",
                    "number",
                    "Enter Phone Number"
                  )}
                </div>
              </div>
              <div className="w-full flex flex-col gap-4">
                <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                  {renderDeveloperInput(
                    "whatsappNumber",
                    "WhatsApp Number",
                    "number",
                    "Enter WhatsApp Number"
                  )}
                </div>
                <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                  {renderDeveloperInput(
                    "officialEmail",
                    "Official Email",
                    "text",
                    "Enter official email"
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex w-full justify-end pt-2">
            <Button
              onClick={handleCompanySubmit}
              className="bg-[#3586FF] hover:bg-[#2563eb] text-white btn-text font-semibold md:py-2 py-1 px-8 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </section>

      {/* Address & Awards Sections */}
      <div className="flex flex-col gap-5">
        <CompanyAddress />
        <CompanyAward />
      </div>
    </div>
  );
};

export default EditComanyPropertyview;
