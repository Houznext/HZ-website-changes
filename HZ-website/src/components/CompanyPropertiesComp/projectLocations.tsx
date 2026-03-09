import React, { useState } from "react";
import CustomInput from "@/common/FormElements/CustomInput";
import { useCompanyPropertyStore } from "@/store/companyproperty";
import { useDebounceCallback } from "usehooks-ts";
import {
  fetchCity,
  fetchLocalities,
  fetchSublocalities,
  getCurrentAddress,
} from "@/utils/locationDetails/datafetchingFunctions";
import Button from "@/common/Button";
import { MapPin } from "lucide-react";

const ProjectLocation = () => {
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

  // ---- helpers to update store in one place ----
  const writeLocation = (partial: any) => {
    const next = {
      ...(project || {}),
      location: {
        id: project?.location?.id ?? null,
        street: project?.location?.street ?? "",
        landmark: project?.location?.landmark ?? "",
        zipCode: project?.location?.zipCode ?? "",
        city: project?.location?.city ?? "",
        state: project?.location?.state ?? "",
        locality: project?.location?.locality ?? "",
        subLocality: project?.location?.subLocality ?? "",
        country: project?.location?.country ?? "India",
        latitude: project?.location?.latitude ?? "",
        longitude: project?.location?.longitude ?? "",
        place_id: project?.location?.place_id ?? "",
        ...partial,
      },
    } as any;

    if (selectedProjectIndex !== null) {
      updateProject(selectedProjectIndex, next);
    } else {
      setProjectDetails(next);
    }
  };

  // ---- place-id + map-friendly centers ----
  const [cityPlaceId, setCityPlaceId] = useState<string>("");
  const [localityPlaceId, setLocalityPlaceId] = useState<string>("");

  const [cityLocation, setCityLocation] = useState<{ lat: string; lng: string }>({ lat: "", lng: "" });
  const [localityLocation, setLocalityLocation] = useState<{ lat: string; lng: string }>({ lat: "", lng: "" });

  // ---- suggestions & UI ----
  const [suggestions, setSuggestions] = useState({
    city: [] as any[],
    locality: [] as any[],
    subLocality: [] as any[],
  });

  const [showSuggestions, setShowSuggestions] = useState({
    city: false,
    locality: false,
    subLocality: false,
  });

  const [loading, setLoading] = useState(false);

  // ---- debounced fetchers (new signatures) ----
  const debouncedFetchCity = useDebounceCallback((input: string) => {
    if (!input) return;
    fetchCity(input).then((resp) =>
      setSuggestions((p) => ({ ...p, city: resp || [] }))
    );
  }, 150);

  const debouncedFetchLocality = useDebounceCallback((query: string) => {
    if (!query) return;
    fetchLocalities({
      query,
      cityPlaceId,                                // helper will fallback to name if empty
      city: project?.location?.city || "",
    }).then((resp) => setSuggestions((p) => ({ ...p, locality: resp || [] })));
  }, 150);

  const debouncedFetchSubLocality = useDebounceCallback((query: string) => {
    if (!query) return;
    fetchSublocalities({
      query,
      localityPlaceId,
      locality: project?.location?.locality || "",
    }).then((resp) => setSuggestions((p) => ({ ...p, subLocality: resp || [] })));
  }, 150);

  // ---- onChange wiring ----
  const handleLocationChange = (name: string, value: string) => {
    if (name === "city") {
      const onlyLetters = value.replace(/[^a-zA-Z\s]/g, "");
      writeLocation({
        city: onlyLetters,
        locality: "",
        subLocality: "",
        place_id: "",
      });
      setCityPlaceId("");
      setCityLocation({ lat: "", lng: "" });
      setLocalityPlaceId("");
      setLocalityLocation({ lat: "", lng: "" });

      setShowSuggestions((p) => ({ ...p, city: !!onlyLetters }));
      if (onlyLetters) debouncedFetchCity(onlyLetters);
      else setSuggestions((p) => ({ ...p, city: [] }));
    } else if (name === "locality") {
      const onlyLetters = value.replace(/[^a-zA-Z\s]/g, "");
      writeLocation({
        locality: onlyLetters,
        subLocality: "",
      });
      setLocalityPlaceId("");
      setShowSuggestions((p) => ({ ...p, locality: !!onlyLetters }));
      if (onlyLetters) debouncedFetchLocality(onlyLetters);
      else setSuggestions((p) => ({ ...p, locality: [] }));
    } else if (name === "subLocality") {
      writeLocation({ subLocality: value });
      setShowSuggestions((p) => ({ ...p, subLocality: !!value }));
      if (value) debouncedFetchSubLocality(value);
      else setSuggestions((p) => ({ ...p, subLocality: [] }));
    } else if (name === "state") {
      writeLocation({ state: value });
    } else if (name === "street") {
      writeLocation({ street: value });
    } else if (name === "landmark") {
      writeLocation({ landmark: value });
    } else if (name === "zipCode") {
      writeLocation({ zipCode: value });
    }
  };

  // ---- selects ----
  const handleCitySelect = (item: any) => {
    writeLocation({
      city: item.city,
      state: item.state || project?.location?.state || "",
    });
    setCityPlaceId(item.place_id || "");
    setCityLocation(item.location || { lat: "", lng: "" });
    setShowSuggestions((p) => ({ ...p, city: false }));
  };

  const handleLocalitySelect = (item: any) => {
    writeLocation({
      locality: item.locality,
      latitude: item.location?.lat ? String(item.location.lat) : project?.location?.latitude || "",
      longitude: item.location?.lng ? String(item.location.lng) : project?.location?.longitude || "",
      place_id: item.place_id || project?.location?.place_id || "",
    });
    setLocalityPlaceId(item.place_id || "");
    setLocalityLocation(item.location || { lat: "", lng: "" });
    setShowSuggestions((p) => ({ ...p, locality: false }));
  };

  const handleSubLocalitySelect = (item: any) => {
    writeLocation({ subLocality: item.subLocality });
    setShowSuggestions((p) => ({ ...p, subLocality: false }));
  };

  // ---- current location (reverse geocode) ----
  const getCurrentPosition = () => {
    setLoading(true);
    try {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const addr = await getCurrentAddress(latitude, longitude);

          // supports both old {address:{...}} and new flat shape
          const a = addr?.address || addr || {};
          writeLocation({
            city: a.city || "",
            state: a.state || "",
            locality: a.locality || "",
            subLocality: a.subLocality || "",
            latitude: String(latitude),
            longitude: String(longitude),
            place_id: a.locality_place_id || a.city_place_id || "",
          });

          setCityPlaceId(a.city_place_id || "");
          setLocalityPlaceId(a.locality_place_id || "");
          if (a.city_location) setCityLocation(a.city_location);
          if (a.locality_location) setLocalityLocation(a.locality_location);

          setShowSuggestions({ city: false, locality: false, subLocality: false });
          setLoading(false);
        },
        () => setLoading(false),
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-md mb-5">
      <p className="md:text-[18px] text-[16px] font-medium text-[#3586FF] mb-3">
        Project Location
      </p>

      <div className="grid md:grid-cols-2 grid-cols-1 md:gap-6 gap-4 w-full">
        {/* State */}
        <div className="flex flex-row gap-4">
          <CustomInput
            name="state"
            label="State"
            placeholder="Enter state"
            labelCls="md:text-[14px] text-[12px] font-medium text-black"
            className="w-full px-3 py-1 placeholder:text-[12px]"
            type="text"
            onChange={(e) => handleLocationChange("state", e.target.value)}
            value={project?.location?.state || ""}
            errorMsg={errors?.state}
          />
        </div>

        {/* City */}
        <div className="relative w-full">
          <CustomInput
            name="city"
            label="City"
            placeholder="Enter city"
            labelCls="md:text-[14px] text-[12px] font-medium text-black"
            className="w-full px-3 py-1 placeholder:text-[12px]"
            type="text"
            onChange={(e) => handleLocationChange("city", e.target.value)}
            value={project?.location?.city || ""}
            errorMsg={errors?.city}
          />
          {showSuggestions.city && (
            <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded shadow-md max-h-60 overflow-auto md:text-[14px] text-[12px]">
              {suggestions.city.length === 0 && (
                <li className="p-2 text-gray-500">No Indian cities found</li>
              )}
              {suggestions.city.map((c: any) => (
                <li
                  key={c.place_id}
                  className="p-2 cursor-pointer border-b hover:bg-gray-100"
                  onClick={() => handleCitySelect(c)}
                >
                  {c.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Locality */}
        <div className="relative">
          <CustomInput
            name="locality"
            label="Locality"
            placeholder="Enter locality"
            labelCls="md:text-[14px] text-[12px] font-medium text-black"
            className="w-full px-3 py-1 placeholder:text-[12px]"
            type="text"
            onChange={(e) => handleLocationChange("locality", e.target.value)}
            value={project?.location?.locality || ""}
            errorMsg={errors?.locality}
          />
          {showSuggestions.locality && (
            <ul className="absolute z-[100] w-full bg-white border border-gray-300 rounded shadow-md max-h-60 overflow-auto md:text-[14px] text-[12px]">
              {suggestions.locality.length === 0 && (
                <li className="p-2 text-gray-500">No localities found</li>
              )}
              {suggestions.locality.map((item: any) => (
                <li
                  key={item.place_id}
                  className="p-2 cursor-pointer border-b hover:bg-gray-100"
                  onClick={() => handleLocalitySelect(item)}
                >
                  {item.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Sub-locality */}
        <div className="relative">
          <CustomInput
            name="subLocality"
            label="Sub-Locality (Optional)"
            placeholder="Enter sub-locality"
            labelCls="md:text-[14px] text-[12px] font-medium text-black"
            className="w-full px-3 py-1 placeholder:text-[12px]"
            type="text"
            onChange={(e) => handleLocationChange("subLocality", e.target.value)}
            value={project?.location?.subLocality || ""}
            errorMsg={errors?.subLocality}
          />
          {showSuggestions.subLocality && (
            <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded shadow-md max-h-60 overflow-auto md:text-[14px] text-[12px]">
              {suggestions.subLocality.length === 0 && (
                <li className="p-2 text-gray-500">No sub-localities found</li>
              )}
              {suggestions.subLocality.map((item: any) => (
                <li
                  key={item.place_id}
                  className="p-2 cursor-pointer border-b hover:bg-gray-100"
                  onClick={() => handleSubLocalitySelect(item)}
                >
                  {item.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Landmark */}
        <div className="flex flex-row gap-4">
          <CustomInput
            name="landmark"
            label="Landmark (Optional)"
            placeholder="Enter landmark"
            labelCls="md:text-[14px] text-[12px] font-medium text-black"
            className="w-full px-3 py-1 placeholder:text-[12px]"
            type="text"
            onChange={(e) => handleLocationChange("landmark", e.target.value)}
            value={project?.location?.landmark || ""}
            errorMsg={errors?.landmark}
          />
        </div>

        {/* Street */}
        <div className="flex flex-row gap-4">
          <CustomInput
            name="street"
            label="Street"
            placeholder="Enter street"
            labelCls="md:text-[14px] text-[12px] font-medium text-black"
            className="w-full px-3 py-1 placeholder:text-[12px]"
            type="text"
            onChange={(e) => handleLocationChange("street", e.target.value)}
            value={project?.location?.street || ""}
            errorMsg={errors?.street}
          />
        </div>

        {/* Zip Code */}
        <div className="flex flex-row gap-4">
          <CustomInput
            name="zipCode"
            label="Zip Code"
            placeholder="Enter zip code"
            labelCls="md:text-[14px] text-[12px] font-medium text-black"
            className="w-full px-3 py-1 placeholder:text-[12px]"
            type="text"
            onChange={(e) => handleLocationChange("zipCode", e.target.value)}
            value={project?.location?.zipCode ?? ""}
            errorMsg={errors?.zipCode}
          />
        </div>
      </div>

      <div className="w-full flex justify-center my-3">
        <p className="md:text-[14px] text-[10px] font-Gordita-regular">OR</p>
      </div>

      <div className="w-full flex justify-center">
        <Button
          onClick={getCurrentPosition}
          disabled={loading}
          className="bg-[#3586FF] flex justify-center items-center gap-2 w-full max-w-[350px] hover:bg-[#3586FF]text-white font-bold py-2 px-4 rounded-full shadow-md transition"
        >
          <MapPin className="w-5 h-5 mr-2" />
          {loading ? "Getting location..." : "Use my current location"}
        </Button>
      </div>
    </div>
  );
};

export default ProjectLocation;
