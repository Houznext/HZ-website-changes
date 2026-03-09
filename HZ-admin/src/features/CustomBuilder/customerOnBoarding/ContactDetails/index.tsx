import React, { useRef, useState,useEffect } from "react";
import Button from "@/src/common/Button";
import { CautionIcon, ResendIcon } from "../../Icons";
import CustomInput from "@/src/common/FormElements/CustomInput";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import Loader from "@/src/common/Loader";
import { MdLocationOn, MdContactPhone } from "react-icons/md";
import {
  fetchCity,
  fetchLocalities,
  fetchSublocalities,
  getCurrentAddress,
  type CitySuggestion,
  type LocalitySuggestion,
  type SubLocalitySuggestion,
} from "@/src/utils/locationDetails/datafetchingFunctions";
import { MapPin } from "lucide-react";
const isUUID = (val: any) => {
  const s = String(val ?? "").trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s
  );
};


const ContactDetails = () => {
  const {
    customerOnboarding,
    custom_builder_id,
    // updateContactDetails,
    updateaddressDetails,
    contactErrors,
    updateContactErrors,
    clearContactErrors,
    setCustomBuilderID,
  } = useCustomBuilderStore();
  const { contactDetails, addressDetails } = customerOnboarding;
  const [otp, setOtp] = useState(Array(4).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(addressDetails?.id);
  const { updateContactDetails } = useCustomBuilderStore.getState();

  const fetchCustomBuilder = async (id: any) => {
    try {
      const res = await apiClient.get(`${apiClient.URLS.custom_builder}/${id}`,{},true);

      const customer = res.body?.customer;
      console.log(res.body)

      if (!customer) {
        console.error("Customer object missing in API response");
        return;
      }

      updateContactDetails({
        first_name: customer.firstName || "",
        last_name: customer.lastName || "",
        mobile: customer.phone || "",
        email: customer.email || "",
      });
    } catch (error) {
      console.error("Error fetching CustomBuilder:", error);
    }
  };
  // useEffect(() => {
  //   if (custom_builder_id) {
  //     fetchCustomBuilder(String(custom_builder_id));
  //   }
  // }, [custom_builder_id]);
  useEffect(() => {
  const id = String(custom_builder_id ?? "").trim();
  if (!id) return;

  if (!isUUID(id)) {
    
    console.warn("Skipping fetchCustomBuilder. Not a UUID:", id);
    return;
  }
  console.log(id)

  fetchCustomBuilder(id);
}, [custom_builder_id]);


  const validateAddressFields = () => {
    const newErrors: { [key: string]: string } = {};
    if (!addressDetails.city) newErrors.city = "City is required.";
    if (!addressDetails.state) newErrors.state = "State is required.";
    if (!addressDetails.locality) newErrors.locality = "Locality is required.";
    if (!addressDetails.zipCode || addressDetails.zipCode.length !== 6)
      newErrors.zipCode = "Valid zipCode is required.";
    if (!addressDetails.address_line_1)
      newErrors.address_line_1 = "Address line 1 is required.";
    updateContactErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateContactFields = () => {
    const newErrors: { [key: string]: string } = {};
    if (!contactDetails.first_name.trim())
      newErrors.first_name = "First name is required.";

    if (!contactDetails.last_name.trim())
      newErrors.last_name = "Last name is required.";

    if (!contactDetails.mobile || contactDetails.mobile.length !== 10)
      newErrors.mobile = "Valid mobile number is required.";

    if (!contactDetails.email || !/\S+@\S+\.\S+/.test(contactDetails.email))
      newErrors.email = "Valid email address is required.";

    updateContactErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOtpChange = (value, index) => {
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleInputChange = (name: string, value: string) => {
    updateContactDetails({ [name]: value });
    clearErrors(name);
  };
  const clearErrors = (name) => {
    if (contactErrors[name]) {
      const updatedErrors = { ...contactErrors };
      contactErrors[name] = null;
      delete updatedErrors[name];
      updateContactErrors(updatedErrors);
    }
  };

  const submitDetails = async () => {
    if (!validateContactFields()) {
      return;
    }
    setIsLoading(true);
    try {
      const payloads = {
        firstName: contactDetails.first_name,
        lastName: contactDetails.last_name,
        email: contactDetails.email,
      };
      const respone = await apiClient.patch(
        `${apiClient.URLS.cb_customer}/update-customer-details`,
        {
          ...payloads,
        },
        true
      );
      if (respone.status === 201) {
        {
          setIsLoading(false);
          toast.success("Contact details saved successfully");
          clearContactErrors();
        }
      }
    } catch (err) {
      setIsLoading(false);
      console.log("error occured while saving contact details", err);
      toast.error("Error occured while saving contact details");
    }
  };

  const handleAddressChange = (name: string, value: string) => {
    updateaddressDetails({ [name]: value });
    clearErrors(name);
  };

  const onSaveAddress = async () => {
    if (!validateAddressFields()) {
      return;
    }
    setIsLoading(true);

    try {
      if (isEditing) {
        const payload = {
          city: addressDetails.city,
          state: addressDetails.state,
          locality: addressDetails.locality,
          zipCode: addressDetails.zipCode.toString(),
          address_line_1: addressDetails.address_line_1,
          address_line_2: addressDetails.address_line_2,
        };
        const response = await apiClient.patch(
          `${apiClient.URLS.cb_location}/${addressDetails.id}`,
          {
            ...payload,
          },
          true
        );
        if (response.status === 200) {
          setIsLoading(false);
          toast.success("Address updated successfully");
        }
      } else {
        const payload = {
          city: addressDetails.city,
          state: addressDetails.state,
          locality: addressDetails.locality,
          zipCode: addressDetails.zipCode.toString(),
          address_line_1: addressDetails.address_line_1,
          address_line_2: addressDetails.address_line_2,
        };
        const response = await apiClient.post(
          `${apiClient.URLS.cb_location}/${custom_builder_id}`,
          {
            ...payload,
          },
          true
        );
        if (response.status === 201) {
          setCustomBuilderID(response.body.customBuilderId);
          setIsLoading(false);
          toast.success("Address saved successfully");
        }
      }
    } catch (err) {
      setIsLoading(false);
      console.log("error occured while saving address", err);
      toast.error("Error occured while saving address");
    }
  };
  const getCurrentPosition = () => {
    setLoading(true);

    const normalizeAddress = (raw: any) => {
      const a = raw?.address ?? raw ?? {};
      const street = a.street ?? a.road ?? a.route ?? a.streetName ?? "";
      const pin = String(
        a.zipCode ?? a.postalCode ?? a.pincode ?? a.postal_code ?? ""
      )
        .replace(/\D/g, "")
        .slice(0, 6);

      return {
        city: a.city ?? "",
        state: a.state ?? "",
        locality: a.locality ?? "",
        street,
        zipCode: pin,
        formattedAddress: a.formattedAddress ?? a.formatted_address ?? "",
        city_place_id: a.city_place_id ?? a.cityPlaceId ?? "",
        locality_place_id: a.locality_place_id ?? a.localityPlaceId ?? "",
      };
    };

    try {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const { latitude, longitude } = coords;

          const raw = await getCurrentAddress(latitude, longitude);
          const addr = normalizeAddress(raw);

          updateaddressDetails({
            city: addr.city,
            state: addr.state,
            locality: addr.locality,
            zipCode: addr.zipCode,
            address_line_1: addr.street || "",
            address_line_2: "",
          });

          setLoading(false);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    } catch (e) {
      console.error("Unexpected geolocation error:", e);
      setLoading(false);
    }
  };

  if (isLoading) return <Loader />;
  return (
    <div className="flex flex-col md:gap-10 gap-5">
      <div className="shadow-custom rounded-md border md:px-3 px-2 md:py-5 py-3">
        <div className="font-bold md:text-[18px] text-[16px] flex flex-row gap-2 mb-4">
          <MdContactPhone className=" text-[#3586FF] " />
          <p className="font-medium md:text-[16px] text-[14px] text-[#3586FF] ">
            Contact details
          </p>
        </div>
        <div className="w-full flex flex-col md:gap-3 gap-1 md:px-3 px-2 md:py-[6px] py-1">
          <div className="flex md:flex-row flex-col gap-3 max-w-[900px]">
            <CustomInput
              label="Mobile Number"
              labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
              name="mobile"
              required={true}
              value={contactDetails.mobile}
              placeholder="Enter mobile number"
              onChange={(e) => handleInputChange("mobile", e.target.value)}
              errorMsg={contactErrors?.mobile}
              type="text"
              className="w-full  px-2 py-[2px]"
              disabled
            />
            <CustomInput
              label="Email Address"
              labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
              name="email"
              required={true}
              placeholder="Enter email address"
              value={contactDetails?.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              errorMsg={contactErrors?.email}
              type="email"
              className="w-full  px-2 py-[2px]"
              disabled
              rootCls=""
            />
          </div>
          {
            <div className="flex md:flex-row flex-col gap-x-5 my-3 max-w-[900px]">
              <CustomInput
                label="First Name"
                required={true}
                placeholder="Enter first name"
                labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
                name="first_name"
                className="w-full  px-2 py-[2px]"
                value={contactDetails?.first_name}
                errorMsg={contactErrors?.first_name}
                onChange={(e) =>
                  handleInputChange("first_name", e.target.value)
                }
                type="text"
              />
              <CustomInput
                label="Last Name"
                name="last_name"
                required={true}
                placeholder="Enter last name"
                labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
                className="w-full  px-2 py-[2px]"
                value={contactDetails?.last_name}
                errorMsg={contactErrors?.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                type="text"
              />
            </div>
          }
          <div className="flex justify-end">
            <Button
              className="md:px-5 px-3 md:py-[6px] py-1 text-[12px] md:text-[14px] bg-[#3B82F6] text-white font-medium  md:rounded-[8px] rounded-[6px]"
              onClick={submitDetails}
            >
              Save details
            </Button>
          </div>
        </div>
      </div>

      <div className="shadow-custom rounded-md border md:px-3 px-2 md:py-5 py-3">
        <div className="font-bold md:text-[18px] text-[16px] flex flex-row gap-2 mb-4">
          <MdLocationOn className=" text-[#3586FF] " />
          <p className="font-medium md:text-[16px] text-[14px] text-[#3586FF] ">
            {" "}
            Address Details
          </p>
        </div>
        <div>
          <div className="flex flex-col md:flex-row md:gap-4 gap-1 gap-x-5 my-3">
            <CustomInput
              label="City"
              labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
              name="city"
              placeholder="Enter city"
              value={addressDetails?.city}
              errorMsg={contactErrors?.city}
              required={true}
              onChange={(e) => handleAddressChange("city", e.target.value)}
              type="text"
              className="w-full  px-2 py-[2px]"
            />
            <CustomInput
              label="Locality"
              labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
              name="locality"
              placeholder="Enter locality"
              value={addressDetails?.locality}
              errorMsg={contactErrors?.locality}
              onChange={(e) => handleAddressChange("locality", e.target.value)}
              type="text"
              className="w-full  px-2 py-[2px]"
              required
            />
            <CustomInput
              label="State"
              name="state"
              placeholder="Enter state"
              errorMsg={contactErrors?.state}
              required={true}
              labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
              value={addressDetails?.state}
              onChange={(e) => handleAddressChange("state", e.target.value)}
              type="text"
              className="w-full  px-2 py-[2px]"
            />
          </div>

          <div className="flex flex-col md:flex-row md:gap-5 gap-1 gap-x-5  my-3">
            <CustomInput
              label="Zip Code"
              labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
              name="zipCode"
              placeholder="Enter zip code"
              value={addressDetails?.zipCode}
              errorMsg={contactErrors?.zipCode}
              required={true}
              onChange={(e) => handleAddressChange("zipCode", e.target.value)}
              type="number"
              className="w-full  px-2 py-[2px]"
            />
            <CustomInput
              label="Address Details 1"
              labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
              name="address_line_1"
              placeholder="Enter address line 1"
              value={addressDetails?.address_line_1}
              errorMsg={contactErrors?.address_line_1}
              onChange={(e) =>
                handleAddressChange("address_line_1", e.target.value)
              }
              type="text"
              className="w-full  p-[2px]"
              required
            />
            <CustomInput
              label="Address Details 2"
              labelCls="text-[#636B70] md:text-[14px] text-[12px] font-medium"
              name="address_line_2"
              placeholder="Enter address line 2 (optional)"
              value={addressDetails?.address_line_2}
              onChange={(e) =>
                handleAddressChange("address_line_2", e.target.value)
              }
              className="w-full  p-[2px]"
              type="text"
            />
          </div>
          <div className="w-full text-center md:flex md:justify-center md:items-center md:gap-1">
            <hr className="flex-grow border-t border-gray-300 md:block  hidden" />
            <span className="md:text-sm text-[14px] font-medium mx-auto">
              OR
            </span>
            <hr className="flex-grow border-t border-gray-300 md:block hidden" />
          </div>
          <div className="w-full flex justify-start mb-3">
            <Button
              onClick={getCurrentPosition}
              disabled={loading}
              className="bg-[#5297ff] flex justify-center items-center gap-2 w-full md:max-w-[350px] max-w-[200px] hover:bg-blue-600 text-white font-bold py-2 md:px-4 px-2 rounded-[8px] shadow-md md:text-[16px] text-[12px]"
            >
              <MapPin className="md:w-5 md:h-5 h-3 w-3 mr-2" />
              {loading ? "Getting location..." : "Use my current location"}
            </Button>
          </div>

          <div className="flex justify-end mb-5">
            <Button
              onClick={onSaveAddress}
              className="md:px-5 px-3 md:py-[6px] py-1 text-[12px] md:text-[14px] bg-[#3B82F6] text-white font-medium  md:rounded-[8px] rounded-[6px]"
            >
              Save Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetails;
