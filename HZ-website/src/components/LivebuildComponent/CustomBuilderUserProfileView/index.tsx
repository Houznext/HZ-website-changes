import React, { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { FaHome } from "react-icons/fa";
import { MdArrowBack, MdEdit } from "react-icons/md";
import { useRouter } from "next/router";
import Loader from "@/components/Loader";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import Drawer from "@/common/Drawer";
import { CautionIcon } from "@/components/Products/icons";
import CustomInput from "@/common/FormElements/CustomInput";
import Button from "@/common/Button";

const getRouteId = (query: { id?: string | string[] }): string | undefined =>
  typeof query?.id === "string" ? query.id : Array.isArray(query?.id) ? query.id[0] : undefined;

const CustomBuilderUserProfileView = () => {
  const router = useRouter();
  const custom_builder_id = getRouteId(router?.query ?? {});
  const [loading, setLoading] = useState(false);
  const [customBuilder, setCustomBuilder] = useState<any>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [contactErrors, setContactErrors] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [contactDetails, setContactDetails] = useState({
    phone: "",
    email: "",
    firstName: "",
    lastName: "",
  });

  const location = customBuilder?.user.locations?.find(
    (loc: any) => loc?.customBuilderId === customBuilder?.id
  );

  const user = customBuilder?.user;
  const propertyInformation = customBuilder?.propertyInformation;

  const fetchDetails = async () => {
    if (!custom_builder_id) return;
    setLoading(true);
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.customBuilder}/${String(custom_builder_id)}`
      );
      if (response.status === 200) {
        setCustomBuilder(response?.body);
        const userData = response?.body?.user;
        setContactDetails({
          firstName: userData?.firstName,
          lastName: userData?.lastName,
          phone: userData?.phone,
          email: userData?.email,
        });

        toast.success("Details fetched successfully");
      }
    } catch (error) {
      console.log("error occured while fetching details", error);
      toast.error("Error occured while fetching details");
    } finally {
      setLoading(false);
    }
  };

  const validateContactFields = () => {
    const newErrors: { [key: string]: string } = {};
    if (!contactDetails.firstName.trim())
      newErrors.firstName = "First name is required.";

    if (!contactDetails.lastName.trim())
      newErrors.lastName = "Last name is required.";

    setContactErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setContactDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error message when user starts typing
    setContactErrors((prev: any) => ({
      ...prev,
      [field]: "",
    }));
  };

  const submitDetails = async () => {
    if (!validateContactFields()) {
      return;
    }

    try {
      setIsSaving(true);
      const payloads = {
        firstName: contactDetails.firstName,
        lastName: contactDetails.lastName,
        email: contactDetails.email,
      };
      await apiClient.patch(
        `${apiClient.URLS.customer}/update-customer-details`,
        {
          ...payloads,
        }
      );
      fetchDetails();
      toast.success("Contact details saved successfully");
      setOpenDrawer(false);
      setIsSaving(false);
    } catch (err) {
      console.log("error occured while saving contact details", err);
      toast.error("Error occured while saving contact details");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (custom_builder_id) {
      fetchDetails();
    }
  }, [custom_builder_id]);

  if (loading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="w-full p-[29px] space-y-6">
        {/* Personal Information */}
        <div className="flex flex-row items-center gap-2 cursor-pointer" onClick={() => router.back()} >
          <MdArrowBack />
          <p className="md:text-[16px] text-[14px] font-medium">
            Back
          </p>
        </div>
        <section className=" bg-white rounded-[8px] md:p-[24px] p-3">
          <div className="flex items-center justify-between mb-[39px]">
            <h2 className=" font-bold md:text-[16px] text-[14px] text-[#3586FF] flex items-center gap-2">
              <FaUser />
              Personal Information
            </h2>
            <button
              className=" text-sm md:px-4 md:py-2 px-2 py-1 md:text-[14px] text-[10px] font-medium border-[1px] text-[#3586FF] border-[#3586FF] flex items-center justify-center rounded-[8px] gap-2"
              onClick={() => setOpenDrawer(true)}
            >
              <MdEdit /> Edit
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <p className=" text-[#6A6767] md:text-[14px] text-[12px] font-regular mb-[8px]">
                First name
              </p>
              <p className=" text-black md:text-[14px] text-[12px] font-medium">
                {user?.firstName}
              </p>
            </div>
            <div>
              <p className=" text-[#6A6767] md:text-[14px] text-[12px] font-regular mb-[8px]">
                Last name
              </p>
              <p className=" text-black md:text-[14px] text-[12px] font-medium">
                {user?.lastName}
              </p>
            </div>
            <div>
              <p className=" text-[#6A6767] md:text-[14px] text-[12px] font-regular mb-[8px]">
                Email Address
              </p>
              <p className=" text-black md:text-[14px] text-wrap  text-[12px] font-medium">
                {user?.email.slice(0, 10)}...@gmail.com
              </p>
            </div>
            <div>
              <p className=" text-[#6A6767] md:text-[14px] text-[12px] font-regular mb-[8px]">
                Phone number
              </p>
              <p className=" text-black md:text-[14px] text-[12px] font-medium">
                {user?.phone}
              </p>
            </div>
            <div>
              <p className=" text-[#6A6767] md:text-[14px] text-[12px] font-regular mb-[8px]">
                Service
              </p>
              <p className=" text-black md:text-[14px] text-[12px] font-medium">
                Owner
              </p>
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="bg-white rounded-[8px] md:p-[24px] p-3">
          <div className="flex items-center justify-between mb-[39px]">
            <h2 className=" font-bold md:text-[16px] text-[14px] text-[#3586FF] flex items-center gap-2">
              <FaLocationDot />
              Address
            </h2>
            <div className="flex gap-[22px] items-center">
              {/* <button className="text-[#3586FF] text-sm px-4 py-2 text-[16px] font-medium border-[1px] border-[#3586FF] flex items-center justify-center rounded-[8px] gap-2">
              <FiPlus /> Add
            </button> */}
              <button
                className=" text-sm md:px-4 md:py-2 px-2 py-1 md:text-[14px] text-[12px] font-medium border-[1px] text-[#3586FF] border-[#3586FF] flex items-center justify-center rounded-[8px] gap-2"
              >
                <MdEdit /> Edit
              </button>
            </div>
          </div>
          <div className="grid  grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <p className="text-[#6A6767] md:text-[14px] text-[12px] font-regular ">
                Country
              </p>
              <p className="text-black md:text-[14px] text-[12px] font-medium">
                {location?.country || 'India'}
              </p>
            </div>
            <div>
              <p className="text-[#6A6767] md:text-[14px] text-[12px] font-regular ">
                State
              </p>
              <p className="text-black md:text-[14px] text-[12px] font-medium">
                {location?.state || 'NA'}
              </p>
            </div>
            <div>
              <p className="text-[#6A6767] md:text-[14px] text-[12px] font-regular ">
                City
              </p>
              <p className="text-black md:text-[14px] text-[12px] font-medium">
                {location?.city || 'NA'}
              </p>
            </div>
            <div>
              <p className="text-[#6A6767] md:text-[14px] text-[12px] font-regular ">
                Pin Code
              </p>
              <p className="text-black md:text-[14px] text-[12px] font-medium">
                {location?.pincode || 'NA'}
              </p>
            </div>
            <div>
              <p className="text-[#6A6767] md:text-[14px] text-[12px] font-regular ">
                Area
              </p>
              <p className="text-black md:text-[14px] text-[12px] font-medium">
                {location?.locality}
              </p>
            </div>
          </div>
        </section>

        {/* Property Details */}
        <section className="bg-white rounded-[8px] md:p-[24px] p-3">
          <div className="flex items-center justify-between mb-[20px]">
            <h2 className=" font-bold md:text-[16px] text-[14px] text-[#3586FF] flex items-center gap-2">
              <FaHome />
              Property Details
            </h2>
          </div>
          <div className="grid  grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <p className="text-[#6A6767] md:text-[14px] text-[12px] font-regular mb-[8px]">
                Construction Type
              </p>
              <p className="text-black md:text-[14px] text-[12px] font-medium">
                {propertyInformation?.construction_type}
              </p>
            </div>
            <div>
              <p className="text-[#6A6767] md:text-[14px] text-[12px] font-regular mb-[8px]">
                Construction scope
              </p>
              <p className="text-black md:text-[14px] text-[12px] font-medium">
                {propertyInformation?.construction_scope}
              </p>
            </div>
            <div>
              <p className="text-[#6A6767] md:text-[14px] text-[12px] font-regular mb-[8px]">
                Property Type
              </p>
              <p className="text-black md:text-[14px] text-[12px] font-medium">
                {propertyInformation?.property_type}
              </p>
            </div>
            <div>
              <p className="text-[#6A6767] md:text-[14px] text-[12px] font-regular mb-[8px]">
                Total area
              </p>
              <p className="text-black md:text-[14px] text-[12px] font-medium">
                {propertyInformation?.house_construction_info?.total_area?.size ||
                  propertyInformation?.interior_info?.total_area?.size ||
                  "NA"}{" "}
                {propertyInformation?.house_construction_info?.total_area?.unit ||
                  propertyInformation?.interior_info?.total_area?.unit ||
                  "NA"}
              </p>
            </div>
            <div>
              <p className="text-[#6A6767] md:text-[14px] text-[12px] font-regular mb-[8px]">
                Floors
              </p>
              <p className="text-black md:text-[14px] text-[12px] font-medium">
                {propertyInformation?.house_construction_info?.floors?.length ||
                  propertyInformation?.interior_info?.floors?.length ||
                  "NA"}
              </p>
            </div>
            {propertyInformation?.construction_scope === "house" && (
              <>
                <div>
                  <p className="text-[#6A6767] md:text-[14px] text-[12px] font-regular mb-[8px]">
                    Land facing
                  </p>
                  <p className="text-black md:text-[14px] text-[12px] font-medium">
                    {propertyInformation?.house_construction_info?.land_facing
                      ?.charAt(0)
                      .toUpperCase() +
                      propertyInformation?.house_construction_info?.land_facing?.slice(
                        1
                      ) || "NA"}
                  </p>
                </div>
                <div>
                  <p className="text-[#6A6767] md:text-[14px] text-[12px] font-regular mb-[8px]">
                    Prior Gate side
                  </p>
                  <p className="text-black md:text-[14px] text-[12px] font-medium">
                    {propertyInformation?.house_construction_info?.gate_side
                      ?.charAt(0)
                      .toUpperCase() +
                      propertyInformation?.house_construction_info?.gate_side?.slice(
                        1
                      ) || "NA"}
                  </p>
                </div>
                <div>
                  <p className="text-[#6A6767] md:text-[14px] text-[12px] font-regular mb-[8px]">
                    Prior staircase side
                  </p>
                  <p className="text-black md:text-[14px] text-[12px] font-medium">
                    {propertyInformation?.house_construction_info?.staircase_gate
                      ?.charAt(0)
                      .toUpperCase() +
                      propertyInformation?.house_construction_info?.staircase_gate?.slice(
                        1
                      )}
                  </p>
                </div>
                <div>
                  <p className="text-[#6A6767] md:text-[14px] text-[12px] font-regular mb-[8px]">
                    Adjacent roads
                  </p>
                  <p className="text-black md:text-[14px] text-[12px] font-medium">
                    {
                      propertyInformation?.house_construction_info
                        ?.adjacent_roads
                    }
                  </p>
                </div>
              </>
            )}
            {propertyInformation?.construction_scope === "interior" && (
              <>
                <div>
                  <p className="text-[#6A6767] md:text-[14px] text-[12px] font-regular mb-[8px]">
                    Project scope
                  </p>
                  <p className="text-black md:text-[14px] text-[12px] font-medium">
                    {propertyInformation?.interior_info?.project_scope || "NA"}
                  </p>
                </div>
                <div>
                  <p className="text-[#6A6767] md:text-[14px] text-[12px] font-regular mb-[8px]">
                    Style preference
                  </p>
                  <p className="text-black md:text-[14px] text-[12px] font-medium">
                    {propertyInformation?.interior_info?.style_preference ||
                      "NA"}
                  </p>
                </div>
                <div>
                  <p className="text-[#6A6767] md:text-[14px] text-[12px] font-regular mb-[8px]">
                    Budget
                  </p>
                  <p className="text-black md:text-[14px] text-[12px] font-medium">
                    {propertyInformation?.interior_info?.budget || "NA"}
                  </p>
                </div>
                <div>
                  <p className="text-[#6A6767] md:text-[14px] text-[12px] font-regular mb-[8px]">
                    Special requirements
                  </p>
                  <p className="text-black md:text-[14px] text-[12px] font-medium">
                    {propertyInformation?.interior_info?.special_requirements ||
                      "NA"}
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
      <Drawer
        open={openDrawer}
        handleDrawerToggle={() => setOpenDrawer(false)}
        closeIconCls="text-black"
        openVariant="right"
        panelCls=" w-[90%] sm:w-[95%] lg:w-[calc(100%-190px)] shadow-xl"
        overLayCls="bg-gray-700 bg-opacity-40"
      >
        <>
          {isSaving ? (
            <div className="w-full h-full flex justify-center items-center">
              <Loader />
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              <div className=" rounded-md px-3 py-5">
                <div className="font-bold text-[18px] flex items-center gap-2 mb-4">
                  <CautionIcon />
                  <p>Contact details</p>
                </div>
                <div className="w-full flex flex-col gap-3 px-3 py-3">
                  <div className="flex md:flex-row flex-col gap-3">
                    <CustomInput
                      label="Mobile Number"
                      labelCls="text-[#636B70] text-[14px] font-medium"
                      name="phone"
                      value={contactDetails?.phone}
                      type="text"
                      className="w-full p-[6px]"
                      disabled
                    />
                    <CustomInput
                      label="Email address"
                      labelCls="text-[#636B70] text-[14px] font-medium"
                      name="email"
                      value={contactDetails?.email}
                      type="email"
                      className="w-full p-[6px]"
                      disabled
                    />
                  </div>

                  <div className="flex md:flex-row flex-col gap-x-5 my-3">
                    <CustomInput
                      label="First Name"
                      labelCls="text-[#636B70] text-[14px] font-medium"
                      name="firstName"
                      className="w-full p-[6px]"
                      value={contactDetails?.firstName}
                      errorMsg={contactErrors?.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      type="text"
                    />
                    <CustomInput
                      label="Last Name"
                      name="lastName"
                      className="w-full p-[6px]"
                      value={contactDetails?.lastName}
                      errorMsg={contactErrors?.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      type="text"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <Button
                      className="py-3 px-[28px] rounded-[6px] border-2 border-[#3B82F6]"
                      onClick={() => setOpenDrawer(false)}
                    >
                      Close
                    </Button>
                    <Button
                      className="px-5 py-3 bg-[#3B82F6] text-white rounded-[8px]"
                      onClick={submitDetails}
                    >
                      Save details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      </Drawer>
    </>
  );
};

export default CustomBuilderUserProfileView;
