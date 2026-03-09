import Button from "@/common/Button";
import CustomInput from "@/common/FormElements/CustomInput";
import SingleSelect from "@/common/FormElements/SingleSelect";
import React, { useState } from "react";
import apiClient from "@/utils/apiClient";
import { MdSupportAgent } from "react-icons/md";
import toast from "react-hot-toast";
import { serviceOptions } from "@/utils/solar/solar-data";
import Modal from "@/common/Modal";

const ContactForm = ({
  selectedId,
}: {
  selectedId: { id: number; service: string };
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phonenumber: "",
    description: "",
    services: selectedId?.service || "",
  });
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        phonenumber: formData.phonenumber,
        description: formData.description,
        serviceType: formData.services,
      };
      const res = await apiClient.post(apiClient.URLS.servicecustomlead, payload);

      if (res.status === 201) {
        setShowConfirmation(true);
        setFormData({
          name: "",
          phonenumber: "",
          description: "",
          services: selectedId?.service || "",
        });
        toast.success("Details submitted successfully");
      } else {
        console.error("Failed to create lead", res);
        toast.error("Failed to submit your request.");
      }
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast.error("Something went wrong!");
    }
  };

  const validateInput = (name: string, value: string) => {
    switch (name) {
      case "name":
        return /^[A-Za-z\s]*$/.test(value);
      case "phonenumber":
        return /^[0-9]{10}$/.test(value);
      default:
        return true;
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (!validateInput(name, value)) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (selectedOption: { id: number; service: string }) => {
    setFormData({
      ...formData,
      services: selectedOption.service,
    });
  };

  const isServiceFixed = selectedId?.service === "Interiors";

  return (
    <div className="rounded-[10px] shadow-custom-card bg-white min-h-[inherit] h-full p-6">
      <p className="font-medium text-[#3586FF] flex items-center gap-2 md:text-[14px] text-[12px] mb-4">
        Talk to a {selectedId?.service || "Service"} Expert
        <MdSupportAgent className="text-[#3586FF]" size={22} />
      </p>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <CustomInput
            name="name"
            label="Enter  Name"
            labelCls="font-medium md:text-[14px] text-[12px] text-black"
            type="text"
            value={formData.name}
            placeholder="Enter  Name"
            onChange={handleInputChange}
            required
          />
          <CustomInput
            name="phonenumber"
            label="Enter Phone Number"
            labelCls="font-medium md:text-[14px] text-[12px] text-black"
            type="number"
            value={formData.phonenumber}
            placeholder="Enter Phone Number"
            onChange={handleInputChange}
            required
          />
          <CustomInput
            name="description"
            label="Enter Your Requirements"
            labelCls="font-medium md:text-[14px] text-[12px] text-black"
            type="textarea"
            value={formData.description}
            placeholder="Enter Requirements"
            onChange={handleInputChange}
            required
          />

          <div className="hidden">
            <SingleSelect
              type="single-select"
              name="services"
              optionCls="text-[12px] font-medium"
              options={serviceOptions}
              selectedOption={selectedId}
              optionsInterface={{ isObj: true, displayKey: "service" }}
              handleChange={(name, value) => {
                if (!isServiceFixed) handleSelectChange(value);
              }}
              buttonCls={
                isServiceFixed ? "opacity-60 pointer-events-none" : ""
              }
              openButtonCls={isServiceFixed ? "pointer-events-none" : ""}
            />
          </div>

          <Button
            type="submit"
            className="bg-[#3586FF] md:text-[16px] text-[14px] text-white font-medium py-2 rounded-[6px] mt-4"
          >
            Get Free Quote
          </Button>
        </div>
      </form>
      <>
        {showConfirmation && (
          <Modal
            isOpen={showConfirmation}
            closeModal={() => setShowConfirmation(false)}
            className="md:max-w-[500px] max-w-[370px] z-[1000] bg-white rounded-[12px] p-6 text-center"
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 bg-gray-100 text-[#3586FF] rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold md:text-[24px] text-[#3586FF]">Thank You!</h3>
              <p className="text-[14px] md:text-[18px] font-medium text-center text-gray-600">
                Your details have been submitted successfully.
              </p>
              <p className="text-[16px] md:text-[16px] font-regular  text-gray-600">
                Our expert will reach out to you shortly.
              </p>
              <Button
                onClick={() => setShowConfirmation(false)}
                className="mt-4 px-5 py-2 bg-[#3586FF] hover:bg-[#3586FF]font-medium text-white text-sm rounded-md transition"
              >
                Continue
              </Button>
            </div>
          </Modal>
        )}
      </>
    </div >
  );
};
export default ContactForm;
