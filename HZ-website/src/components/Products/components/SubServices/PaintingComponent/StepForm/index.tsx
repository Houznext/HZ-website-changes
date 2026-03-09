import React, { useState } from "react";
import CustomInput from "@/common/FormElements/CustomInput";
import SingleSelect from "@/common/FormElements/SingleSelect";
import Button from "@/common/Button";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import CustomDate from "@/common/FormElements/CustomDate";
import { FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
import { ServiceCategory } from "@/utils/solar/solar-data";
import { HiClipboardCheck, HiCheck } from "react-icons/hi";

const StepForm = () => {
  const [step, setStep] = useState(1);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [FormData, setFormData] = useState({
    Fullname: "",
    Phonenumber: "",
    city: "",
    houseNo: "",
    apartmentName: "",
    areaName: "",
    pincode: "",
    propertytype: "",
    visitScheduledAt: "",
  });
  const propertytypedata = [
    { id: 1, propertytype: "Flat" },
    { id: 2, propertytype: "Villa" },
    { id: 3, propertytype: "Independent House" },
    { id: 4, propertytype: "Independent Floor" },
  ];
  const cityOptions = [
    { id: 1, city: "Bangalore" },
    { id: 2, city: "Hyderabad" },
    { id: 3, city: "Chennai" },
    { id: 4, city: "Andhra Pradesh" },
  ];
  const handleSelectChange = (field: string, selectedOption: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: selectedOption[field] || selectedOption.value,
    }));
  };


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleNextStep = async () => {
    if (step === 1) {
      const { Fullname, Phonenumber, city } = FormData;
      if (!Fullname || !Phonenumber || !city) {
        toast.error("Please fill all Step 1 fields");
        return;
      }

      setStep(2);
    } else if (step === 2) {
      const {
        houseNo,
        apartmentName,
        areaName,
        pincode,
        visitScheduledAt,
        propertytype,
        city,
      } = FormData;

      if (
        !houseNo ||
        !apartmentName ||
        !areaName ||
        !pincode ||
        !visitScheduledAt
      ) {
        toast.error("Please fill all Step 2 fields");
        return;
      }

      try {
        setIsLoading(true);


        const payload = {
          Fullname: FormData.Fullname,
          Phonenumber: FormData.Phonenumber,
          city: FormData.city || "Bangalore",
          serviceType: ServiceCategory.Painting,
          propertytype: FormData.propertytype || "Flat",
          visitScheduledAt: FormData.visitScheduledAt,
          houseNo: FormData.houseNo,
          apartmentName: FormData.apartmentName,
          areaName: FormData.areaName,
          pincode: FormData.pincode,
          leadstatus: "Visit Scheduled",
        };

        await apiClient.post(apiClient.URLS.crmlead, payload, true);
        toast.success("Site inspection booked successfully!");
        setIsSubmitted(true);


        setFormData({
          Fullname: "",
          Phonenumber: "",
          city: "",
          houseNo: "",
          apartmentName: "",
          areaName: "",
          pincode: "",
          propertytype: "",
          visitScheduledAt: "",
        });
        setStep(1);
      } catch (error) {
        console.error(error);
        toast.error("Failed to submit form");
      } finally {
        setIsLoading(false);
      }
    }
  };




  if (isSubmitted) {
    setTimeout(() => {
      setIsSubmitted(false);
      setStep(1);
    }, 4000);

    return (
      <div className="rounded-[10px] shadow-custom-card bg-white min-h-[inherit] h-full md:p-6 p-4 flex flex-col items-center justify-center text-center md:space-y-4 space-y-2 animate-fade-in">
        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-green-100 animate-bounce-slow">
          <HiCheck className="text-green-600 w-10 h-10" />
        </div>

        <h2 className="font-medium text-[#3586FF] md:text-[20px] text-[16px] uppercase animate-fade-in-delayed">
          Thank You!
        </h2>

        <p className="font-regular text-gray-600 label-text max-w-[300px] animate-fade-in-delayed">
          Thank you for booking your site inspection. Our team will contact you
          shortly to confirm the visit.
        </p>

        <div className="w-40 h-[4px] bg-blue-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#3586FF] rounded-full animate-progress-bar"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-[10px] shadow-custom-card z-[9999] bg-white min-h-[inherit] h-full ${step === 1 ? "p-6" : "p-3"
        } w-full h-auto`}
    >
      <form className="flex flex-col md:gap-4 gap-2 w-full">
        <div
          className={`flex flex-col ${step === 1 ? "md:gap-3" : "md:gap-1"
            } gap-1 items-center text-center`}
        >
          {step === 1 ? (
            <>
              <div className="flex items-center gap-1">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <HiClipboardCheck className="w-5 h-5 text-[#3586FF]" />
                </div>

                <h2 className="font-medium md:text-[18px] text-[14px] text-[#3586FF] uppercase">
                  Book Your Site Visit
                </h2>
              </div>
              <p className="font-medium text-gray-600 label-text ">
                Get a detailed site inspection and expert colour consultation
                from our professionals.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <HiClipboardCheck className="w-5 h-5 text-[#3586FF]" />
                </div>

                <h2 className="font-medium md:text-[18px] text-[14px] text-[#3586FF]  uppercase">
                  Schedule Your Visit Details
                </h2>
              </div>
              <p className="font-medium text-gray-600 label-text ">
                Tell us where and when you’d like our experts to visit your
                property.
              </p>
            </>
          )}

        </div>

        <div className="flex items-center gap-2 bg-blue-100 justify-center py-1 md:rounded-[10px] rounded-[4px]">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step === 1
              ? "bg-white text-[#3586FF] border-white"
              : "bg-[#3586FF] border-white text-white"
              }`}
          >
            <span className="text-sm font-medium">1</span>
          </div>
          <div className="w-12 h-1 bg-[#3586FF] rounded-full"></div>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step === 2
              ? "bg-white text-[#3586FF] border-white"
              : "bg-[#3586FF] border-white text-white"
              }`}
          >
            <span className="text-sm font-medium">2</span>
          </div>
        </div>

        {step === 1 && (
          <div
            className="flex flex-col gap-2  shadow md:px-3 md:py-3 
        px-2 py-1 rounded-md "
          >
            <CustomInput
              label="Full Name"
              type="text"
              name="Fullname"
              labelCls="font-medium label-text text-black"
              value={FormData.Fullname}
              required
              placeholder="Enter Full Name"
              className="md:py-1 py-0.5"
              onChange={handleInputChange}
            />
            <CustomInput
              label="Phone"
              type="number"
              name="Phonenumber"
              labelCls="font-medium label-text text-black"
              value={FormData.Phonenumber}
              required
              placeholder="Enter Phone"
               className="md:py-1 py-0.5"
              onChange={handleInputChange}
            />
            <div className="flex flex-col mb-2 md:gap-y-[8px] gap-y-[4px] w-full md:max-w-[100%] max-w-[280px]  ">
              <SingleSelect
                type="single-select"
                name="city"
                label="City"
                   labelCls="font-medium label-text text-black"
                options={cityOptions}
                rootCls="border-b-[1px]  md:px-1 px-1 md:py-1 py-0 w-full  border border-[#CFCFCF] rounded-[4px]"
                buttonCls="border-none"
                selectedOption={
                  cityOptions.find((item) => item.city === FormData.city) ||
                  cityOptions[0]
                }
                optionsInterface={{
                  isObj: true,
                  displayKey: "city",
                }}
                handleChange={(name, value) =>
                  handleSelectChange("city", value)
                }
              />
            </div>

            <Button
              onClick={handleNextStep}
              className="bg-[#3586FF] font-medium md:rounded-[6px] rounded-[4px] shadow-custom md:text-[14px] text-[12px]  md:py-[6px] py-1   text-white"
            >
              Next Step →
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-2  md:px-1 md:py-0.5 px-2 py-1 rounded-md">
            <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
              <CustomInput
                label="House No"
                type="text"
                name="houseNo"
                value={FormData.houseNo}
                labelCls="font-medium label-text text-black"
                placeholder="Enter House No"
                onChange={handleInputChange}
              />
              <CustomInput
                label="Apartment / Street"
                type="text"
                name="apartmentName"
                value={FormData.apartmentName}
                labelCls="font-medium label-text text-black"
                placeholder="Enter Apartment"
                onChange={handleInputChange}
              />
            </div>
            <CustomInput
              label="Area Name"
              type="text"
              name="areaName"
              value={FormData.areaName}
              labelCls="font-medium label-text text-black"
              placeholder="Enter Area Name"
              onChange={handleInputChange}
            />
            <div className="flex md:flex-row flex-col items-center gap-2">
              <CustomInput
                label="Pincode"
                type="text"
                name="pincode"
                value={FormData.pincode}
                labelCls="font-medium label-text text-black"
                placeholder="Enter Pincode"
                onChange={handleInputChange}
              />
              <div className="flex flex-col md:gap-y-[8px] gap-y-[4px] w-full md:max-w-[540px] max-w-[280px] mb-1">
                <p className="font-medium label-text text-black">
                  City
                </p>
                <SingleSelect
                  type="single-select"
                  name="city"
                  options={cityOptions}
                  rootCls="border-b-[1px]  px-1 md:py-1 py-0 w-full  border border-[#CFCFCF] rounded-[4px]"
                  buttonCls="border-none"
                  selectedOption={
                    cityOptions.find((item) => item.city === FormData.city) ||
                    cityOptions[0]
                  }
                  optionsInterface={{
                    isObj: true,
                    displayKey: "city",
                  }}
                  handleChange={(name, value) =>
                    handleSelectChange("city", value)
                  }
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
              <div className="flex flex-col md:gap-y-[8px] gap-y-[4px] w-full md:max-w-[520px] max-w-[280px]">
                <p className="font-medium label-text text-black">
                  Property Type
                </p>
                <SingleSelect
                  type="single-select"
                  name="propertytype"
                  options={propertytypedata}
                  rootCls="border-b-[1px]   px-1 md:py-1 py-0 w-full border  border-[#CFCFCF]  rounded-[4px] "
                  buttonCls="border-none"
                  selectedOption={
                    propertytypedata.find(
                      (item) => item.propertytype === FormData.propertytype
                    ) || { id: 1, propertytype: "Flat" }
                  }
                  optionsInterface={{
                    isObj: true,
                    displayKey: "propertytype",
                  }}
                  handleChange={(name, value) =>
                    handleSelectChange("propertytype", value)
                  }
                />
              </div>
              <CustomDate
                label="Visit Date"
                labelCls="font-medium label-text text-black"
                name="visitScheduledAt"
                value={FormData.visitScheduledAt}
                onChange={handleInputChange}
                className="py-0 h-[10px]"
                rootCls="max-w-[360px] w-full h-[0px]"
                required
                rightIcon={<FaCalendarAlt />}
              />
            </div>

            <div className="flex gap-2 w-full justify-between mt-1  md:mt-3 items-center">
              <Button
                type="button"
                onClick={() => setStep(1)}
                className="bg-gray-500 text-white md:px-6 px-3 md:rounded-[10px] rounded-[4px] font-medium md:text-[16px] text-[12px] md:py-2 py-2"
              >
                Back
              </Button>
              <Button
                onClick={handleNextStep}
                className="bg-[#3586FF]   md:px-6 px-3 md:rounded-[10px] rounded-[4px] font-medium md:text-[16px] text-[12px] md:py-2 py-2   text-white"
              >
                Submit
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default StepForm;
