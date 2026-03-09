"use client";

import React, { useState } from "react";
import Modal from "@/src/common/Modal";
import { useCompanyPropertyStore } from "@/src/stores/companyproperty";
import Button from "@/src/common/Button";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import { useDebounceCallback } from "usehooks-ts";
import {
  fetchCity,
  fetchLocalities,
  fetchSublocalities,
  getCurrentAddress,
} from "@/src/utils/locationDetails/datafetchingFunctions";
import { MapPin } from "lucide-react";
import { FaEdit } from "react-icons/fa";
import { LuTrash2 } from "react-icons/lu";
import CustomInput from "@/src/common/FormElements/CustomInput";

type LatLngStr = { lat: string; lng: string };

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

  const [newAddress, setNewAddress] = useState<{
    id: number | null;
    street: string;
    city: string;
    state: string;
    locality: string;
    subLocality: string;
    landmark: string;
    country: string;
    zipCode: string | null;
  }>({
    id: null,
    street: "",
    city: "",
    state: "",
    locality: "",
    subLocality: "",
    landmark: "",
    country: "India",
    zipCode: null,
  });

  const [editaddIndex, setAddEditIndex] = useState<number | null>(null);
  const [addressIndex, setAddressIndex] = useState<number | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // NEW: place ids for biasing/finality
  const [cityPlaceId, setCityPlaceId] = useState<string>("");
  const [localityPlaceId, setLocalityPlaceId] = useState<string>("");

  // geo center hints (strings for safety)
  const [cityLocation, setCityLocation] = useState<LatLngStr>({ lat: "", lng: "" });
  const [localityLocation, setLocalityLocation] = useState<LatLngStr>({ lat: "", lng: "" });

  const [latLang, setLatLang] = useState({ latitude: "", longitude: "" });

  const [showSuggestions, setShowSuggestions] = useState({
    city: false,
    locality: false,
    subLocality: false,
  });

  const [suggestions, setSuggestions] = useState<{
    city: any[];
    locality: any[];
    subLocality: any[];
  }>({
    city: [],
    locality: [],
    subLocality: [],
  });

  const validateCompanyForm = (): boolean => {
    const newErrors: Record<string, string> = {};
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

  // --------------- Debounced data fetching (new signatures) -----------------

  const debouncedFetchCity = useDebounceCallback((q: string) => {
    const v = q.trim();
    if (!v) return;
    fetchCity(v).then((response) => {
      setSuggestions((prev) => ({ ...prev, city: response || [] }));
    });
  }, 300);

  const debouncedFetchLocality = useDebounceCallback((q: string) => {
    const v = q.trim();
    if (!v) return;
    fetchLocalities(
      {
        query: v,
        cityPlaceId,
        city: newAddress.city,
      }
    ).then((response) => {
      setSuggestions((prev) => ({ ...prev, locality: response || [] }));
    });
  }, 300);

  const debouncedFetchSubLocality = useDebounceCallback((q: string) => {
    const v = q.trim();
    if (!v || !localityPlaceId) return;
    fetchSublocalities(
      {
        query: v,
        localityPlaceId,
        locality: newAddress.locality,
      }
    ).then((response) => {
      setSuggestions((prev) => ({ ...prev, subLocality: response || [] }));
    });
  }, 300);

  // ---------------- onChange ----------------

  const handleAddressChange = (name: string, value: string) => {
    // if (name === "city") {
    //   setNewAddress((prev) => ({ ...prev, city: value, locality: "", subLocality: "" }));
    //   setShowSuggestions((prev) => ({ ...prev, city: !!value }));
    //   setCityPlaceId("");
    //   setLocalityPlaceId("");
    //   setCityLocation({ lat: "", lng: "" });
    //   setLocalityLocation({ lat: "", lng: "" });
    //   if (value) debouncedFetchCity(value);
    //   else setSuggestions((p) => ({ ...p, city: [] }));
    //   return;
    // }
    if (name === "city") {
  setNewAddress((prev) => ({ ...prev, city: value })); // don't clear here
  setShowSuggestions((prev) => ({ ...prev, city: !!value }));

  setCityPlaceId("");
  setLocalityPlaceId("");
  setCityLocation({ lat: "", lng: "" });
  setLocalityLocation({ lat: "", lng: "" });

  if (value) debouncedFetchCity(value);
  else setSuggestions((p) => ({ ...p, city: [] }));

  return;
}


    // if (name === "locality") {
    //   setNewAddress((prev) => ({ ...prev, locality: value, subLocality: "" }));
    //   setShowSuggestions((prev) => ({ ...prev, locality: !!value }));
    //   setLocalityPlaceId("");
    //   if (value && (cityPlaceId || newAddress.city)) debouncedFetchLocality(value);
    //   else setSuggestions((p) => ({ ...p, locality: [] }));
    //   return;
    // }

    if (name === "locality") {
  setNewAddress((prev) => ({ ...prev, locality: value })); // don't clear here
  setShowSuggestions((prev) => ({ ...prev, locality: !!value }));

  setLocalityPlaceId("");
  setLocalityLocation({ lat: "", lng: "" });
  setLatLang({ latitude: "", longitude: "" });

  if (value && (cityPlaceId || newAddress.city)) debouncedFetchLocality(value);
  else setSuggestions((p) => ({ ...p, locality: [] }));

  return;
}

    if (name === "subLocality") {
      setNewAddress((prev) => ({ ...prev, subLocality: value }));
      setShowSuggestions((prev) => ({ ...prev, subLocality: !!value }));
      if (value && localityPlaceId) debouncedFetchSubLocality(value);
      else setSuggestions((p) => ({ ...p, subLocality: [] }));
      return;
    }

    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  // ------------------ Selection -------------------

  // const handleCitySelect = (item: any) => {
  //   setShowSuggestions((prev) => ({ ...prev, city: false }));
  //   setCityLocation(item.location ? { lat: String(item.location.lat), lng: String(item.location.lng) } : { lat: "", lng: "" });
  //   setCityPlaceId(item.place_id || "");
  //   setNewAddress((prev) => ({ ...prev, city: item.city, state: item.state || prev.state }));
  // };
  const handleCitySelect = (item: any) => {
  setShowSuggestions((prev) => ({ ...prev, city: false }));

  setCityLocation(
    item.location
      ? { lat: String(item.location.lat), lng: String(item.location.lng) }
      : { lat: "", lng: "" }
  );

  setCityPlaceId(item.place_id || "");

  setNewAddress((prev) => ({
    ...prev,
    city: item.city,
    state: item.state || prev.state,
    locality: "",
    subLocality: "",
  }));

  setLocalityPlaceId("");
  setLocalityLocation({ lat: "", lng: "" });
  setLatLang({ latitude: "", longitude: "" });
};


  // const handleLocalitySelect = (item: any) => {
  //   const lat = item.location?.lat ? String(item.location.lat) : "";
  //   const lng = item.location?.lng ? String(item.location.lng) : "";
  //   setNewAddress((prev) => ({ ...prev, locality: item.locality }));
  //   setShowSuggestions((prev) => ({ ...prev, locality: false }));
  //   setLocalityLocation(item.location ? { lat, lng } : { lat: "", lng: "" });
  //   setLocalityPlaceId(item.place_id || "");
  //   setLatLang({ latitude: lat, longitude: lng });
  // };
const handleLocalitySelect = (item: any) => {
  const lat = item.location?.lat ? String(item.location.lat) : "";
  const lng = item.location?.lng ? String(item.location.lng) : "";

  setNewAddress((prev) => ({
    ...prev,
    locality: item.locality,
    subLocality: "", // clear ONLY on select
  }));

  setShowSuggestions((prev) => ({ ...prev, locality: false }));

  setLocalityLocation(item.location ? { lat, lng } : { lat: "", lng: "" });
  setLocalityPlaceId(item.place_id || "");
  setLatLang({ latitude: lat, longitude: lng });
};

  const handleSubLocalitySelect = (item: any) => {
    setNewAddress((prev) => ({ ...prev, subLocality: item.subLocality }));
    setShowSuggestions((prev) => ({ ...prev, subLocality: false }));
  };

  // ------------------ Edit / Delete -------------------

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
      zipCode: selectedAddress?.zipCode ?? null,
    });
    setLatLang({
      latitude: selectedAddress?.latitude || "",
      longitude: selectedAddress?.longitude || "",
    });
    // if an existing place_id is stored, treat it as locality id (best-effort)
    setLocalityPlaceId(selectedAddress?.place_id || "");
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
        newAddress,
        true
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

  // ------------------ Current location -------------------

  const getCurrentPosition = () => {
    setLoading(true);
    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLatLang({ latitude: String(latitude), longitude: String(longitude) });

          const address = await getCurrentAddress(latitude, longitude);
          if (address) {
            setNewAddress((prev) => ({
              ...prev,
              city: address.city || prev.city,
              state: address.state || prev.state,
              locality: address.locality || prev.locality,
              subLocality: address.subLocality || prev.subLocality,
              street:
                (address as any).street ??
                (address as any).road ??
                (address as any).route ??
                prev.street,
              country: "India",
              zipCode:
                (address as any).zipCode ??
                (address as any).postalCode ??
                (address as any).pincode ??
                (address as any).postal_code ??
                prev.zipCode,
            }));
            setCityPlaceId(address.city_place_id || "");
            setLocalityPlaceId(address.locality_place_id || "");
            setCityLocation(
              address.city_location
                ? { lat: String(address.city_location.lat), lng: String(address.city_location.lng) }
                : { lat: "", lng: "" }
            );
            setLocalityLocation(
              address.locality_location
                ? { lat: String(address.locality_location.lat), lng: String(address.locality_location.lng) }
                : { lat: "", lng: "" }
            );
          }
          setLoading(false);
        },
        (err) => {
          console.error("Geolocation error:", err);
          toast.error("Failed to get your current location.");
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    } catch (error) {
      console.error("Error getting current position:", error);
      setLoading(false);
    }
  };

  // ------------------ Submit -------------------

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
          payLoad,
          true
        );
        if (res.status === 200) {
          // updatedAddresses[editaddIndex] = res.data;
          const updated = res.body ?? res.data ?? res; // safe fallback
updatedAddresses[editaddIndex] = updated;

          toast.success("Address updated successfully!");
        }
      } else {
        const res = await apiClient.post(
          `${apiClient.URLS.company_address}/${companyId}`,
          payLoad,
          true
        );
        if (res.status === 201) {
          // updatedAddresses.push(res.data);
          updatedAddresses.push(res.body ?? res.data ?? res);

          toast.success("Address added successfully!");
        }
      }

      setCompanyDetails({ ...companyDetails, 
        // locatedIn: updatedAddresses 
         locatedIn: [...updatedAddresses],
      });

      setNewAddress({
        id: null,
        street: "",
        city: "",
        locality: "",
        subLocality: "",
        landmark: "",
        state: "",
        country: "India",
        zipCode: null,
      });
      setCityPlaceId("");
      setLocalityPlaceId("");
      setLatLang({ latitude: "", longitude: "" });
      setAddEditIndex(null);
      setModalState({ address: false });
    } catch (error) {
      console.error("Error occurred in address submission", error);
      toast.error("Error saving address. Please try again.");
    }
  };

  // ------------------ Modal UI -------------------

  const renderAddressModal = () => (
    <Modal
      isOpen={modalState.address}
      closeModal={() => {
        setModalState({ address: false });
        setAddEditIndex(null);
        setNewAddress({
          id: null,
          street: "",
          city: "",
          locality: "",
          subLocality: "",
          landmark: "",
          state: "",
          country: "India",
          zipCode: null,
        });
        setCityPlaceId("");
        setLocalityPlaceId("");
        setLatLang({ latitude: "", longitude: "" });
      }}
      title={`${editaddIndex !== null ? "Edit" : "Add"} Address`}
      titleCls="sub-heading font-semibold text-[#3586FF] text-center mb-4"
      isCloseRequired={false}
      rootCls="z-[9999]"
      className="md:max-w-[600px] max-w-[340px] overflow-y-auto md:mt-0 mt-5 rounded-xl"
    >
      <div className="flex flex-col gap-4 justify-center items-center md:max-w-[520px] mx-auto px-2">
        <CustomInput
          name="state"
          label="State"
          placeholder="Enter State"
          type="text"
          className="w-full px-3 rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text"
          labelCls="label-text text-gray-700 font-medium"
          value={newAddress.state}
          onChange={(e) => handleAddressChange("state", e.target.value)}
          errorMsg={errors.state}
          required
        />

        <div className="relative w-full">
          <CustomInput
            name="city"
            label="City"
            placeholder="Enter City"
            labelCls="label-text text-gray-700 font-medium"
            type="text"
            className="w-full px-3 rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text"
            value={newAddress.city}
            onChange={(e) => handleAddressChange("city", e.target.value)}
            errorMsg={errors.city}
          />
          {showSuggestions.city && (
            <ul className="absolute z-30 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto mt-1">
              {suggestions.city.map((c: any) => (
                <li
                  key={c?.place_id}
                  className="px-3 py-2.5 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-blue-50 sublabel-text text-gray-700 transition-colors"
                  onClick={() => handleCitySelect(c)}
                >
                  {c.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative w-full">
          <CustomInput
            name="locality"
            label="Locality"
            placeholder="Enter Locality"
            type="text"
            className="w-full px-3  rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text"
            labelCls="label-text text-gray-700 font-medium"
            value={newAddress.locality}
            errorMsg={errors.locality}
            onChange={(e) => handleAddressChange("locality", e.target.value)}
            required
          />
          {showSuggestions.locality && (
            <ul className="absolute z-[100] w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto mt-1">
              {suggestions.locality.map((item: any) => (
                <li
                  key={item?.place_id}
                  className="px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-blue-50 sublabel-text text-gray-700 transition-colors"
                  onClick={() => handleLocalitySelect(item)}
                >
                  {item.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative w-full">
          <CustomInput
            name="subLocality"
            label="Sub locality"
            placeholder="Enter Sub locality"
            type="text"
            className="w-full px-3  rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text"
            labelCls="label-text text-gray-700 font-medium"
            value={newAddress.subLocality}
            onChange={(e) => handleAddressChange("subLocality", e.target.value)}
            errorMsg={errors.subLocality}
            required
          />
          {showSuggestions.subLocality && (
            <ul className="absolute z-30 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto mt-1">
              {suggestions.subLocality.map((item: any) => (
                <li
                  key={item?.place_id ?? item?.subLocality}
                  className="px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-blue-50 sublabel-text text-gray-700 transition-colors"
                  onClick={() => handleSubLocalitySelect(item)}
                >
                  {item.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        <CustomInput
          name="street"
          label="Street"
          placeholder="Enter Street"
          type="text"
          labelCls="label-text text-gray-700 font-medium"
          className="w-full px-3 rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text"
          value={newAddress.street}
          onChange={(e) => handleAddressChange("street", e.target.value)}
          errorMsg={errors.street}
           required
        />

        <CustomInput
          name="landmark"
          label="Landmark"
          placeholder="Enter Landmark"
          type="text"
          className="w-full px-3 rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text"
          labelCls="label-text text-gray-700 font-medium"
          value={newAddress.landmark}
          onChange={(e) => handleAddressChange("landmark", e.target.value)}
          errorMsg={errors.landmark}
           required
        />

        <CustomInput
          name="zipCode"
          label="Postal/ZIP Code"
          labelCls="label-text text-gray-700 font-medium"
          type="text"
          className="w-full px-3 rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text"
          placeholder="Enter Postal/ZIP Code"
          value={newAddress.zipCode ?? ""}
          onChange={(e) => handleAddressChange("zipCode", e.target.value)}
          errorMsg={errors.zipCode}
           required
        />

        <div className="w-full flex items-center gap-4 my-1">
          <div className="flex-1 h-px bg-gray-200"></div>
          <p className="sublabel-text font-medium text-gray-400">OR</p>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <div className="w-full flex justify-center">
          <Button
            onClick={getCurrentPosition}
            disabled={loading}
            className="w-full max-w-[360px] flex justify-center items-center gap-2 bg-[#3586FF]/10 hover:bg-[#3586FF]/20 text-[#3586FF] btn-text font-semibold py-2.5 px-4 rounded-lg border border-[#3586FF]/20 transition-all"
          >
            <MapPin className="w-4.5 h-4.5" />
            {loading ? "Getting location..." : "Use my current location"}
          </Button>
        </div>

        <div className="flex justify-end gap-3 mt-4 w-full">
          <Button
            onClick={() => {
              setModalState({ address: false });
              setAddEditIndex(null);
              setNewAddress({
                id: null,
                street: "",
                city: "",
                locality: "",
                subLocality: "",
                landmark: "",
                state: "",
                country: "India",
                zipCode: null,
              });
              setCityPlaceId("");
              setLocalityPlaceId("");
              setLatLang({ latitude: "", longitude: "" });
            }}
            className="px-5 py-2.5 btn-text bg-gray-100 hover:bg-gray-200 font-semibold text-gray-700 rounded-lg transition-all"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddressSubmit}
            className="px-6 py-2.5 bg-[#3586FF] hover:bg-[#2563eb] btn-text font-semibold text-white rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            {editaddIndex !== null ? "Update" : "Add"} Address
          </Button>
        </div>
      </div>
    </Modal>
  );

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 bg-gradient-to-r from-[#3586FF]/5 to-transparent border-b border-gray-100">
        <div className="hidden md:block">
          <h3 className="sub-heading font-semibold text-[#3586FF]">
            Addresses
          </h3>
          <p className="sublabel-text text-gray-500 mt-0.5">
            Manage your company locations used across listings & invoices.
          </p>
        </div>
        <Button
          className="bg-[#3586FF] hover:bg-[#2563eb] text-white btn-text font-semibold px-5 md:py-2 py-1 rounded-lg shadow-sm hover:shadow-md transition-all"
          onClick={() => setModalState({ address: true })}
        >
          + Add Company Address
        </Button>
        {renderAddressModal()}
      </div>

      {/* Table */}
      <div className="p-5">
        <div className="overflow-auto rounded-lg border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 sticky top-0 z-10">
              <tr>
                {["Street", "City", "Locality", "Sublocality", "State", "Country", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="label-text text-center font-semibold text-gray-600 px-4 py-3"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {companyDetails?.locatedIn?.map((address: any, index: number) => (
                <tr
                  key={index}
                  className="odd:bg-white even:bg-gray-50/50 hover:bg-blue-50/40 transition-colors"
                >
                  {[address?.street, address?.city, address?.locality, address?.subLocality, address?.state, "India"].map(
                    (val, i) => (
                      <td
                        key={i}
                        className="px-4 py-3 sublabel-text font-medium text-center text-gray-700 max-w-[200px]"
                        title={val || ""}
                      >
                        <span className="block truncate">{val || "—"}</span>
                      </td>
                    )
                  )}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        onClick={() => handleEditAddress(index)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#3586FF] sublabel-text font-medium transition-all"
                      >
                        <FaEdit className="w-3.5 h-3.5" /> Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteAddress(index)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 sublabel-text font-medium transition-all"
                      >
                        <LuTrash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!companyDetails?.locatedIn || companyDetails.locatedIn.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <MapPin className="w-8 h-8 text-gray-300" />
                      <p className="sublabel-text text-gray-500">No addresses added yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={openDeleteModal}
        closeModal={() => setOpenDeleteModal(false)}
        title=""
        className="md:max-w-[450px] max-w-[340px] rounded-xl"
        rootCls="flex items-center justify-center z-[9999]"
        isCloseRequired={false}
      >
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="bg-red-50 text-red-500 rounded-full p-4">
            <LuTrash2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center">
            Confirm Deletion
          </h3>
          <p className="sublabel-text text-gray-500 text-center leading-relaxed">
            Are you sure you want to delete this address? This action cannot be
            undone.
          </p>
          <div className="flex gap-3 mt-2 w-full">
            <Button
              className="flex-1 py-2.5 btn-text font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
              onClick={() => setOpenDeleteModal(false)}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 py-2.5 btn-text font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all"
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
