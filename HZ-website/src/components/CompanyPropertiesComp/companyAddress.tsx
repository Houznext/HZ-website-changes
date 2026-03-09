import React, { useState } from "react";
import Table from "./tableComponent";
import Modal from "@/common/Modal";
import { Located, useCompanyPropertyStore } from "@/store/companyproperty";
import Button from "@/common/Button";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import { useDebounceCallback } from "usehooks-ts";
import { MapPin } from "lucide-react";
import { FaEdit } from "react-icons/fa";
import CustomInput from "@/common/FormElements/CustomInput";
import {
  fetchCity,
  fetchLocalities,
  fetchSublocalities,
  getCurrentAddress,
} from "@/utils/locationDetails/datafetchingFunctions";

const CompanyAddress = () => {
  const {
    companyDetails,
    companyId,
    modalState,
    setModalState,
    errors,
    setErrors,
    setCompanyDetails,
  } = useCompanyPropertyStore();

  const [newAddress, setNewAddress] = useState({
    id: null as number | null,
    street: "",
    city: "",
    state: "",
    locality: "",
    subLocality: "",
    landmark: "",
    country: "India",
    zipCode: "" as string | null,
  });

  const [editaddIndex, setAddEditIndex] = useState<number | null>(null);
  const [addressIndex, setAddressIndex] = useState<number | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // ---- Google place ids (separate city/locality) ----
  const [cityPlaceId, setCityPlaceId] = useState("");
  const [localityPlaceId, setLocalityPlaceId] = useState("");

  // ---- Coords for centering/latlng capture ----
  const [latLang, setLatLang] = useState({
    latitude: "",
    longitude: "",
  });

  const [cityLocation, setCityLocation] = useState<{ lat: string; lng: string }>(
    { lat: "", lng: "" }
  );
  const [localityLocation, setLocalityLocation] = useState<{ lat: string; lng: string }>(
    { lat: "", lng: "" }
  );

  // ---- Suggestions ----
  const [showSuggestions, setShowSuggestions] = useState({
    city: false,
    locality: false,
    subLocality: false,
    apartments: false,
  });

  const [suggestions, setSuggestions] = useState({
    city: [] as any[],
    locality: [] as any[],
    subLocality: [] as any[],
    apartments: [] as any[],
  });

  // ---- Validation ----
  const validateCompanyForm = (): boolean => {
    const newErrors: any = {};
    if (!newAddress.state) newErrors.state = "State is required";
    if (!newAddress.city) newErrors.city = "City is required";
    if (!newAddress.locality) newErrors.locality = "locality is required";
    if (!newAddress.country) newErrors.country = "country is required";
    if (!newAddress.street) newErrors.street = "street is required";
    if (!newAddress.landmark) newErrors.landmark = "landmark is required";
    if (!newAddress.subLocality) newErrors.subLocality = "subLocality is required";
    if (!newAddress.zipCode) newErrors.zipCode = "zipCode is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---- Geolocation -> reverse geocode ----
  const getCurrentPosition = () => {
    setLoading(true);
    try {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setLatLang({ latitude: String(latitude), longitude: String(longitude) });

        const address = await getCurrentAddress(latitude, longitude);
        if (address) {
          setNewAddress((prev) => ({
            ...prev,
            street: "",
            city: address.city || "",
            state: address.state || "",
            locality: address.locality || "",
            subLocality: address.subLocality || "",
            country: "India",
          }));

          setCityPlaceId(address.city_place_id || "");
          setLocalityPlaceId(address.locality_place_id || "");
          setCityLocation(address.city_location || { lat: "", lng: "" });
          setLocalityLocation(address.locality_location || { lat: "", lng: "" });
        }
      });
    } catch (error) {
      console.error("Error getting current position:", error);
    } finally {
      setLoading(false);
    }
  };

  // ---- Debounced fetchers (new object params) ----
  const debouncedFetchcity = useDebounceCallback((input: string) => {
    if (!input) return;
    fetchCity(input).then((response) => {
      setSuggestions((prev) => ({ ...prev, city: response || [] }));
    });
  }, 120);

  const debouncedFetchLocality = useDebounceCallback((query: string) => {
    if (!query) return;
    fetchLocalities({
      query,
      cityPlaceId,
      city: newAddress.city,
    }).then((response) => {
      setSuggestions((prev) => ({ ...prev, locality: response || [] }));
    });
  }, 120);

  const debouncedFetchSubLocality = useDebounceCallback((query: string) => {
    if (!query) return;
    fetchSublocalities({
      query,
      localityPlaceId,
      locality: newAddress.locality,
    }).then((response) => {
      setSuggestions((prev) => ({ ...prev, subLocality: response || [] }));
    });
  }, 120);

  // ---- onChange ----
  const handleAddressChange = (name: string, value: string) => {
    if (name === "city") {
      setNewAddress((prev) => ({ ...prev, city: value }));
      setShowSuggestions((prev) => ({ ...prev, city: !!value }));
      // reset downstream
      setCityPlaceId("");
      setCityLocation({ lat: "", lng: "" });
      setNewAddress((prev) => ({ ...prev, locality: "", subLocality: "" }));
      setLocalityPlaceId("");
      setLocalityLocation({ lat: "", lng: "" });
      value ? debouncedFetchcity(value) : setShowSuggestions((p) => ({ ...p, city: false }));
    } else if (name === "locality") {
      setNewAddress((prev) => ({ ...prev, locality: value }));
      setShowSuggestions((prev) => ({ ...prev, locality: !!value }));
      // reset sublocality and locality place id until selected from list
      setNewAddress((prev) => ({ ...prev, subLocality: "" }));
      setLocalityPlaceId("");
      value ? debouncedFetchLocality(value) : setShowSuggestions((p) => ({ ...p, locality: false }));
    } else if (name === "subLocality") {
      setNewAddress((prev) => ({ ...prev, subLocality: value }));
      setShowSuggestions((prev) => ({ ...prev, subLocality: !!value }));
      value ? debouncedFetchSubLocality(value) : setShowSuggestions((p) => ({ ...p, subLocality: false }));
    } else if (name === "landmark") {
      setNewAddress((prev) => ({ ...prev, landmark: value }));
    } else {
      setNewAddress((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ---- selection handlers ----
  const handleCitySelect = (
    cityName: string,
    state: string,
    place_id: string,
    location: { lat: string; lng: string }
  ) => {
    setShowSuggestions((prev) => ({ ...prev, city: false }));
    setNewAddress((prev) => ({ ...prev, city: cityName, state }));
    setCityPlaceId(place_id);
    setCityLocation(location || { lat: "", lng: "" });

    // reset locality/sublocality
    setNewAddress((prev) => ({ ...prev, locality: "", subLocality: "" }));
    setLocalityPlaceId("");
    setLocalityLocation({ lat: "", lng: "" });
  };

  const handleLocalitySelect = (
    localityName: string,
    location: { lat: string; lng: string },
    place_id: string
  ) => {
    setNewAddress((prev) => ({ ...prev, locality: localityName }));
    setShowSuggestions((prev) => ({ ...prev, locality: false }));
    setLocalityPlaceId(place_id);
    setLocalityLocation(location || { lat: "", lng: "" });

    // Use locality pin as address lat/lng
    setLatLang({ latitude: String(location.lat || ""), longitude: String(location.lng || "") });
  };

  const handleSubLocalitySelect = (subLocalityName: string) => {
    setNewAddress((prev) => ({ ...prev, subLocality: subLocalityName }));
    setShowSuggestions((prev) => ({ ...prev, subLocality: false }));
  };

  // ---- edit/delete ----
  const handleEditAddress = (index: number) => {
    setAddEditIndex(index);
    const selectedAddress = companyDetails.locatedIn[index];
    setNewAddress({
      id: selectedAddress?.id ?? null,
      street: selectedAddress?.street || "",
      city: selectedAddress?.city || "",
      state: selectedAddress?.state || "",
      locality: selectedAddress?.locality || "",
      subLocality: selectedAddress?.subLocality || "",
      landmark: selectedAddress?.landmark || "",
      country: "India",
      zipCode: selectedAddress?.zipCode != null ? String(selectedAddress.zipCode) : "",
    });
    setLatLang({
      latitude: selectedAddress?.latitude || "",
      longitude: selectedAddress?.longitude || "",
    });
    // Assume stored place_id refers to locality level if present
    setLocalityPlaceId(selectedAddress?.place_id || "");
    setCityPlaceId("");
    setModalState({ address: true });
  };

  const handleDeleteAddress = (index: number) => {
    setOpenDeleteModal(true);
    setAddressIndex(index);
  };

  const handleDelete = async () => {
    try {
      if (addressIndex === null) return;
      const addressId = companyDetails.locatedIn[addressIndex]?.id;
      const response = await apiClient.delete(
        `${apiClient.URLS.company_address}/${companyId}/${addressId}`,
        newAddress as any
      );
      if (response.status === 200) {
        toast.success("Address deleted successfully");
        setOpenDeleteModal(false);
        const updatedAddresses = companyDetails.locatedIn.filter((_, i) => i !== addressIndex);
        setCompanyDetails({ locatedIn: updatedAddresses });
        setAddressIndex(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ---- submit ----
  const handleAddressSubmit = async () => {
    if (!companyId) {
      toast.error("Please create a company first");
      return;
    }
    if (!validateCompanyForm()) return;

    const payLoad = {
      ...newAddress,
      country: "India",
      latitude: (latLang.latitude || "").toString(),
      longitude: (latLang.longitude || "").toString(),
      place_id: localityPlaceId || cityPlaceId || "",
    };

    try {
      let updatedAddresses = [...companyDetails.locatedIn];
      if (editaddIndex !== null) {
        const res = await apiClient.patch(
          `${apiClient.URLS.company_address}/${companyId}/${newAddress?.id}`,
          payLoad
        );
        if (res.status === 200) {
          updatedAddresses[editaddIndex] = res.data;
          toast.success("Address updated successfully!");
        }
      } else {
        const res = await apiClient.post(
          `${apiClient.URLS.company_address}/${companyId}`,
          payLoad
        );
        if (res.status === 201) {
          updatedAddresses.push(res.data);
          toast.success("Address added successfully!");
        }
      }
      setCompanyDetails({ ...companyDetails, locatedIn: updatedAddresses });
      // reset
      setNewAddress({
        street: "",
        city: "",
        locality: "",
        subLocality: "",
        id: null,
        landmark: "",
        state: "",
        country: "India",
        zipCode: null,
      });
      setCityPlaceId("");
      setLocalityPlaceId("");
      setAddEditIndex(null);
      setModalState({ address: false });
    } catch (error) {
      console.error("Error occurred in address submission", error);
      toast.error("Error saving address. Please try again.");
    }
  };

  // ---- modal ----
  const renderAddressModal = () => {
    return (
      <Modal
        isOpen={modalState.address}
        closeModal={() => {
          setModalState({ address: false });
          setAddEditIndex(null);
          setNewAddress({
            street: "",
            city: "",
            locality: "",
            subLocality: "",
            id: null,
            landmark: "",
            state: "",
            country: "India",
            zipCode: null,
          });
          setCityPlaceId("");
          setLocalityPlaceId("");
        }}
        title={`${editaddIndex !== null ? "Edit" : "Add"} Address`}
        titleCls="md:text-[24px] text-[16px] font-medium text-center mb-10"
        isCloseRequired={false}
        rootCls="z-[9999]"
        className="md:max-w-[700px]  max-w-[300px] overflow-y-auto md:mt-0 mt-5"
      >
        <div className="flex flex-col gap-3 justify-center items-center md:max-w-[500px] mx-auto">
          <CustomInput
            name="state"
            label="State"
            placeholder="Enter State"
            type="text"
            className="px-2 py-1 border border-gray-300 rounded-md w-full"
            labelCls="md:text-[14px] text-[12px] font-medium"
            value={newAddress.state}
            onChange={(e) => handleAddressChange("state", e.target.value)}
            errorMsg={errors.state}
          />

          {/* City */}
          <div className="relative w-full ml-0">
            <CustomInput
              name="city"
              label="City"
              placeholder="Enter City"
              labelCls="md:text-[14px] text-[12px] font-medium"
              type="text"
              className="px-2 py-1 border border-gray-300 rounded-md w-full"
              value={newAddress.city}
              onChange={(e) => handleAddressChange("city", e.target.value)}
              errorMsg={errors.city}
            />
            {showSuggestions.city && (
              <ul className="absolute z-10 w-full bg-white border text-[12px] border-gray-300 rounded shadow-md max-h-60 overflow-auto">
                {suggestions?.city?.map((city: any) => (
                  <li
                    key={city?.place_id}
                    className="p-2 cursor-pointer border-b-[1px] border-gray-300 hover:bg-gray-200"
                    onClick={() =>
                      handleCitySelect(
                        city.city,
                        city.state,
                        city.place_id, // pass city place_id
                        city.location
                      )
                    }
                  >
                    {city.description}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Locality */}
          <div className="relative w-full ml-0">
            <CustomInput
              name="locality"
              label="Locality"
              placeholder="Enter Locality"
              type="text"
              className="px-2 py-1 border border-gray-300 rounded-md w-full"
              labelCls="md:text-[14px] text-[12px] font-medium"
              value={newAddress.locality}
              errorMsg={errors.locality}
              onChange={(e) => handleAddressChange("locality", e.target.value)}
            />
            {showSuggestions.locality && (
              <ul className="absolute z-30 w-full bg-white border border-gray-300 rounded shadow-md max-h-60 overflow-auto">
                {suggestions?.locality?.map((item: any) => (
                  <li
                    key={item?.place_id}
                    className="p-2 cursor-pointer border-b-[1px] border-gray-300 hover:bg-gray-200"
                    onClick={() =>
                      handleLocalitySelect(
                        item.locality,
                        item.location,
                        item?.place_id
                      )
                    }
                  >
                    {item.description}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Sub Locality */}
          <div className="relative w-full ml-0">
            <CustomInput
              name="subLocality"
              label="Sub locality"
              placeholder="Enter Sub locality"
              type="text"
              className="px-2 py-1 border border-gray-300 rounded-md w-full"
              labelCls="md:text-[14px] text-[12px] font-medium"
              value={newAddress.subLocality}
              onChange={(e) => handleAddressChange("subLocality", e.target.value)}
              errorMsg={errors.subLocality}
            />
            {showSuggestions.subLocality && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded shadow-md max-h-60 overflow-auto">
                {suggestions?.subLocality?.map((item: any) => (
                  <li
                    key={item?.place_id}
                    className="p-2 cursor-pointer border-b-[1px] border-gray-300 hover:bg-gray-200"
                    onClick={() => handleSubLocalitySelect(item.subLocality)}
                  >
                    {item.description}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Address lines */}
          <CustomInput
            name="street"
            label="Street"
            placeholder="Enter Street"
            type="text"
            labelCls="md:text-[14px] text-[12px] font-medium"
            className="px-2 py-1 border border-gray-300 rounded-md w-full"
            value={newAddress.street}
            onChange={(e) => handleAddressChange("street", e.target.value)}
            errorMsg={errors.street}
          />

          <CustomInput
            name="landmark"
            label="Landmark"
            placeholder="Enter Landmark"
            type="text"
            className="px-2 py-1 border border-gray-300 rounded-md w-full"
            labelCls="md:text-[14px] text-[12px] font-medium"
            value={newAddress.landmark}
            onChange={(e) => handleAddressChange("landmark", e.target.value)}
            errorMsg={errors.landmark}
          />

          <CustomInput
            name="zipCode"
            label="Postal/ZIP Code"
            labelCls="md:text-[14px] text-[12px] font-medium"
            type="text"
            className="px-2 py-1 border border-gray-300 rounded-md w-full"
            placeholder="Enter Postal/ZIP Code"
            value={newAddress.zipCode}
            onChange={(e) => handleAddressChange("zipCode", e.target.value)}
            errorMsg={errors.zipCode}
          />

          <div className="w-full flex justify-center">
            <p className="md:text-[14px] text-[10px] font-Gordita-regular">OR</p>
          </div>

          <div className="w-full flex justify-center">
            <Button
              onClick={getCurrentPosition}
              disabled={loading}
              className="bg-[#3586FF] flex justify-center items-center gap-2 w-full max-w-[350px] hover:bg-[#3586FF]text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out"
            >
              <MapPin className="w-5 h-5 mr-2" />
              {loading ? "Getting location..." : "Use my current location"}
            </Button>
          </div>

          <div className="flex justify-end gap-3 mt-3">
            <Button
              onClick={() => {
                setModalState({ address: false });
                setAddEditIndex(null);
                setNewAddress({
                  street: "",
                  city: "",
                  locality: "",
                  subLocality: "",
                  id: null,
                  landmark: "",
                  state: "",
                  country: "India",
                  zipCode: null,
                });
                setCityPlaceId("");
                setLocalityPlaceId("");
              }}
              className="md:px-5 px-3 md:py-2 py-1 md:text-[16px] text-[12px] bg-gray-300 font-medium text-black rounded-md"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddressSubmit}
              className="px-6 py-2 bg-[#3586FF] font-medium text-white rounded-md"
            >
              {editaddIndex !== null ? "Update" : "Add"} Address
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="shadow-custom px-5 py-4 rounded-md bg-white">
      <div className="flex justify-end">
        <Button
          className=" bg-[#3B82F6] md:px-10 md:py-[10px] px-4 py-2 text-[12px] md:text-[16px] text-white rounded-md font-medium"
          onClick={() => setModalState({ address: true })}
        >
          + Add Company address
        </Button>
        {renderAddressModal()}
      </div>

      <div className="mt-5 mb-7">
        <h3 className="md:text-lg text-[16px] font-medium mb-3">Addresses List</h3>
        <Table
          headers={[
            "Street",
            "City",
            "Locality",
            "Sublocality",
            "State",
            "Country",
            "Actions",
          ]}
          data={companyDetails.locatedIn}
          renderRow={(address: Located, index: number) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 md:text-[14px] text-[10px] py-2">{address?.street}</td>
              <td className="border border-gray-300 px-4 md:text-[14px] text-[10px] py-2">{address?.city}</td>
              <td className="border border-gray-300 px-4 md:text-[14px] text-[10px] py-2">{address?.locality}</td>
              <td className="border border-gray-300 px-4 md:text-[14px] text-[10px] py-2">{address?.subLocality}</td>
              <td className="border border-gray-300 px-4 md:text-[14px] text-[10px] py-2">{address?.state}</td>
              <td className="border border-gray-300 px-4 md:text-[14px] text-[10px] py-2">India</td>
              <td className="border border-gray-300 px-4 md:text-[14px] text-[10px] py-2 text-center">
                <div className="flex justify-center gap-2">
                  <Button
                    onClick={() => handleEditAddress(index)}
                    className="md:px-3 px-2 md:py-[6px] py-[3px] bg-[#3586FF] gap-[6px] flex items-center justify-center font-medium text-white rounded-md hover:bg-blue-700"
                  >
                    <FaEdit /> Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteAddress(index)}
                    className="md:px-3 px-2 md:py-[6px] py-[3px] bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          )}
        />
      </div>

      {/* Delete confirm modal */}
      <Modal
        isOpen={openDeleteModal}
        closeModal={() => setOpenDeleteModal(false)}
        title=""
        className="md:max-w-[500px] max-w-[330px]"
        rootCls="flex items-center justify-center z-[9999]"
        isCloseRequired={false}
      >
        <div className="p-6 z-20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="md:text-[20px] text-center w-full text-[14px] font-medium text-gray-900">
              Confirm Deletion
            </h3>
          </div>
          <p className="md:text-sm text-center text-[12px] text-gray-500 mb-4">
            Are you sure you want to delete this address? This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              className="md:h-[50px] h-[35px] md:px-[28px] px-[14px] md:text-[16px] text-[12px] rounded-md border-2 bg-gray-100 hover:bg-gray-200 font-medium text-gray-700"
              onClick={() => setOpenDeleteModal(false)}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              className="h-[50px] px-[28px] rounded-md border-2 bg-red-600 text-white"
              onClick={() => handleDelete()}
              size="sm"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CompanyAddress;
