import React, { useState, useEffect, useCallback } from "react";
import Button from "@/common/Button";
import CheckboxInput from "@/common/FormElements/CheckBoxInput";
import CustomInput from "@/common/FormElements/CustomInput";
import { MdAccessTime } from "react-icons/md";
import apiClient from "@/utils/apiClient";
import usePostPropertyStore, { PropertyStore } from "@/store/postproperty";
import toast from "react-hot-toast";
import Image from "next/image";
interface ContactSellerFormProps {
  propertyId: string;
  project?: boolean;
}

export default function ContactSellerForm({
  propertyId,
  project = false,
}: ContactSellerFormProps) {
  const [projects, setProjects] = useState<any>([]);
  const [contactdata, setcontactdata] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    agreeToContact: false,
    interestedInLoan: false,
  });
  const [property, setProperty] = useState<any>({});

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    setcontactdata((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };
  const handleTextInputChange = (e: any) => {
    const { name, value } = e.target;

    setcontactdata({
      ...contactdata,
      [name]: value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const payload = {
        name: contactdata.name,
        phoneNumber: String(contactdata.phoneNumber),
        email: contactdata.email,
        agreeToContact: contactdata.agreeToContact,
        interestedInLoan: contactdata.interestedInLoan,
        propertyId: propertyId,
        isProject: project,
      };
      const res = await apiClient.post(apiClient.URLS.property_leads, {
        ...payload,
      });
      if (res.status === 201) {
        setcontactdata({
          name: "",
          phoneNumber: "",
          email: "",
          agreeToContact: false,
          interestedInLoan: false,
        });
        toast.success("form submitted successfully");
      }
    } catch (error) {
      console.error("error is", error);
    }
  };
  const fetchProjects = useCallback(async (propertyId: string) => {
    if (!propertyId) {
      return;
    }

    try {
      const res = await apiClient.get(
        `${apiClient.URLS.companyonboarding}/${propertyId}`
      );
      if (res?.status === 200 && res?.body) {
        setProjects(res.body);
      }
    } catch (error) {
      console.error("error is", error);
      toast.error("Something went wrong while fetching Project details");
    }
  }, []);
  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return;

      try {
        const response = await apiClient.get(
          `${apiClient.URLS.property}/${propertyId}`
        );
        setProperty(response.body);
      } catch (error) {
        console.error("Error fetching property:", error);
      }
    };

    fetchProperty();
  }, [propertyId]);
  useEffect(() => {
    if (propertyId && project) {
      fetchProjects(propertyId.toString());
    }
  }, [propertyId, fetchProjects]);

  const maskPhone = (phone: string | undefined) => {
    if (!phone) return "-";
    return phone.slice(0, 4) + "****" + phone.slice(-2);
  };

  return (
    <>
      <div className=" mt-6 lg:mt-0">
        <div className="bg-gray-100 max-w-[520px] w-full  rounded-[5px] shadow-md flex flex-col  gap-2 border border-gray-200 p-3">
          <div className="bg-blue-100  flex gap-3 items-center font-medium p-2 text-wrap border-[1px] border-[#3586FF] rounded-[6px] ">
            <MdAccessTime className="text-[#3586FF] md:text-[20px] text-[20px]" />{" "}
            <h1 className="md:text-[12px] text-[12px] ">
              Great choice! Better priced property in this area
            </h1>
          </div>
          <div className="flex flex-col gap-2 bg-white rounded-[6px]  p-2">
            <h2 className="md:text-[16px] text-[14px] font-bold md:mb-2 mb-1  ">
              Contact Seller
            </h2>

            <div>
              <div className="flex gap-2 items-center md:mb-2 mb-1 ">
                <div className="relative md:w-[60px] w-[35px] md:h-[60px] h-[35px]">
                  <Image
                    src="/profileview/Avatar.png"
                    alt="seller"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col  md:text-[14px] text-[10px]">
                  {property?.owner ? (
                    <h1 className="font-medium">
                      {property.owner.name}
                    </h1>
                  ) : (
                    <h1 className="font-medium">
                      {projects?.companyName}
                    </h1>
                  )}
                  <h1 className="text-gray-400">Housing Expert Pro</h1>
                  {!project ? (
                    <h1 className="font-medium">
                      {maskPhone(property?.owner?.phone)}
                    </h1>
                  ) : (
                    <h1 className="font-medium">
                      {maskPhone(projects?.developerInformation?.phone)}
                    </h1>
                  )}
                </div>
              </div>
              <p className="text-gray-600 text-[12px] md:text-[14px] md:mb-2 mb-1">
                Please share your contact details
              </p>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-y-[20px] ">
                  <div className="grid grid-cols-1 md:gap-1 gap-1 ">
                    <div className="w-full">
                      <CustomInput
                        label="Name "
                        type="text"
                        name="name"
                        labelCls=" font-medium md:text-[12px] text-[10px] leading-[22.8px] "
                        placeholder="enter your name"
                        className=" px-2 md:py-0 py-0  md:max-w-[368px] max-w-[297px] w-full  rounded-[4px] "
                        rootCls="px-2"
                        required
                        onChange={handleTextInputChange}
                      />
                    </div>
                    <div className="w-full">
                      <CustomInput
                        label="Phone Number"
                        type="number"
                        name="phoneNumber"
                        labelCls=" font-medium md:text-[12px] text-[10px] leading-[22.8px] "
                        placeholder="enter your phone number"
                        className="  md:px-2 px-0 md:py-0 py-0  md:max-w-[368px] max-w-[297px] w-full  rounded-[4px] "
                        rootCls="px-2"
                        required
                        onChange={handleTextInputChange}
                      />
                    </div>
                    <div className="w-full">
                      <CustomInput
                        label="Email"
                        type="email"
                        name="email"
                        labelCls=" font-medium md:text-[12px] text-[10px] leading-[22.8px] "
                        placeholder="enter your email"
                        className=" md:px-2 px-0 md:py-0 py-0  md:max-w-[368px] max-w-[297px] w-full  rounded-[4px] "
                        rootCls="px-2"
                        required
                        onChange={handleTextInputChange}
                      />
                    </div>
                    <CheckboxInput
                      type="checkbox"
                      label="I agree to be contacted by OneCasa and agents via WhatsApp, SMS, phone, email etc"
                      labelCls="text-black md:text-[12px] !text-gray-500 text-[10px] font-regular "
                      name="agreeToContact"
                      checked={contactdata.agreeToContact}
                      className="md:w-3 w-2 md:h-[15px] !h-3 px-2 text-center"
                      onChange={handleCheckboxChange}
                    />
                    <CheckboxInput
                      type="checkbox"
                      label="I am interested in Home Loans"
                      labelCls="text-black md:text-[12px] !text-gray-500 text-[10px] font-regular "
                      name="interestedInLoan"
                      className="md:w-3 w-2 md:h-[15px] !h-3 px-2 text-center"
                      onChange={handleCheckboxChange}
                    />
                  </div>

                  <div>
                    <Button
                      className="w-full bg-[#3586FF] hover:bg-[#3586FF] text-white md:py-[6px] py-1 rounded-[6px] transition-all md:text-[16px] text-[12px] font-medium  "
                      type="submit"
                    >
                      Get Contact Details
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
