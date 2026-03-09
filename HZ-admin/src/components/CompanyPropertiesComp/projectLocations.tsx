import React, { useState } from "react";
import CustomInput from "@/src/common/FormElements/CustomInput";
import { useCompanyPropertyStore } from "@/src/stores/companyproperty";
import { useDebounceCallback } from "usehooks-ts";
import Button from "@/src/common/Button";
import { MapPin } from "lucide-react";
import {
  fetchCity,
  fetchLocalities,
  fetchSublocalities,
  getCurrentAddress,
  // ⬇️ import the shared types so state & responses use the SAME symbols
  type CitySuggestion,
  type LocalitySuggestion,
  type SubLocalitySuggestion,
} from "@/src/utils/locationDetails/datafetchingFunctions";

type LatLngStr = { lat: string; lng: string };
const toStrLatLng = (loc?: { lat: number | string; lng: number | string } | null): LatLngStr =>
  !loc ? { lat: "", lng: "" } : ({ lat: String((loc as any).lat ?? ""), lng: String((loc as any).lng ?? "") });

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
    selectedProjectIndex !== null ? projects[selectedProjectIndex] : projectDetails;

  const [suggestions, setSuggestions] = useState<{
    city: CitySuggestion[];
    locality: LocalitySuggestion[];
    subLocality: SubLocalitySuggestion[];
  }>({ city: [], locality: [], subLocality: [] });

  const [showSuggestions, setShowSuggestions] = useState({
    city: false,
    locality: false,
    subLocality: false,
  });

  const [cityPlaceId, setCityPlaceId] = useState<string>("");
  const [localityPlaceId, setLocalityPlaceId] = useState<string>("");

  const [cityLocation, setCityLocation] = useState<LatLngStr>({ lat: "", lng: "" });
  const [localityLocation, setLocalityLocation] = useState<LatLngStr>({ lat: "", lng: "" });

  const [loading, setLoading] = useState(false);

  const writeLocation = (partial: any) => {
    const current = project?.location || {};
    const updated = { ...current, ...partial };
    if (selectedProjectIndex !== null) {
      updateProject(selectedProjectIndex, {
        ...projects[selectedProjectIndex],
        location: updated,
      });
    } else {
      setProjectDetails({ ...project, location: updated });
    }
  };

  const debouncedFetchcity = useDebounceCallback((input: string) => {
    const q = input.trim();
    if (!q) return;
    fetchCity(q).then((response) => {
      setSuggestions((prev) => ({ ...prev, city: (response ?? []) as CitySuggestion[] }));
    });
  }, 150);

  const debouncedFetchLocality = useDebounceCallback((query: string) => {
    const q = query.trim();
    if (!q) return;
    fetchLocalities({
      query: q,
      cityPlaceId,
      city: project?.location?.city || "",
    }).then((response) => {
      setSuggestions((prev) => ({ ...prev, locality: (response ?? []) as LocalitySuggestion[] }));
    });
  }, 150);

  const debouncedFetchSubLocality = useDebounceCallback((query: string) => {
    const q = query.trim();
    if (!q || !localityPlaceId) return;
    fetchSublocalities({
      query: q,
      localityPlaceId,
      locality: project?.location?.locality || "",
    }).then((response) => {
      setSuggestions((prev) => ({
        ...prev,
        subLocality: (response ?? []) as SubLocalitySuggestion[],
      }));
    });
  }, 150);

  const handleLocationChange = (
    name: string,
    value: string,
    geoData?: { lat: string; lng: string; placeId: string }
  ) => {
    if (name === "city") {
      setShowSuggestions((prev) => ({ ...prev, city: !!value }));
      setCityPlaceId("");
      setLocalityPlaceId("");
      setCityLocation({ lat: "", lng: "" });
      setLocalityLocation({ lat: "", lng: "" });
      writeLocation({ city: value, locality: "", subLocality: "" });
      if (value) debouncedFetchcity(value);
      return;
    }

    if (name === "locality") {
      setShowSuggestions((prev) => ({ ...prev, locality: !!value }));
      setLocalityPlaceId("");
      writeLocation({ locality: value, subLocality: "" });
      if (value && (cityPlaceId || project?.location?.city)) debouncedFetchLocality(value);

      if (geoData?.lat && geoData?.lng && geoData?.placeId) {
        writeLocation({
          latitude: String(geoData.lat),
          longitude: String(geoData.lng),
          place_id: geoData.placeId,
        });
      }
      return;
    }

    if (name === "subLocality") {
      setShowSuggestions((prev) => ({ ...prev, subLocality: !!value }));
      writeLocation({ subLocality: value });
      if (value && localityPlaceId) debouncedFetchSubLocality(value);
      return;
    }

    writeLocation({ [name]: value });
  };

  const handleCitySelect = (item: CitySuggestion) => {
    writeLocation({ city: item.city, state: item.state || project?.location?.state || "" });
    setCityPlaceId(item.place_id);
    setCityLocation(toStrLatLng(item.location as any));
    setShowSuggestions((prev) => ({ ...prev, city: false }));
  };

  const handleLocalitySelect = (item: LocalitySuggestion) => {
    const asStr = toStrLatLng(item.location as any);
    setLocalityPlaceId(item.place_id);
    setLocalityLocation(asStr);
    writeLocation({
      locality: item.locality,
      latitude: asStr.lat,
      longitude: asStr.lng,
      place_id: item.place_id || cityPlaceId || "",
    });
    setShowSuggestions((prev) => ({ ...prev, locality: false }));
  };

  const handleSubLocalitySelect = (item: SubLocalitySuggestion) => {
    writeLocation({ subLocality: item.subLocality });
    setShowSuggestions((prev) => ({ ...prev, subLocality: false }));
  };

  const getCurrentPosition = () => {
    setLoading(true);
    try {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const { latitude, longitude } = coords;
          const address = await getCurrentAddress(latitude, longitude);
          if (address) {
            const cityPid = address.city_place_id || "";
            const locPid = address.locality_place_id || "";
            const cityLoc = address.city_location ? toStrLatLng(address.city_location) : { lat: "", lng: "" };
            const locLoc = address.locality_location ? toStrLatLng(address.locality_location) : { lat: "", lng: "" };

            setCityPlaceId(cityPid);
            setLocalityPlaceId(locPid);
            setCityLocation(cityLoc);
            setLocalityLocation(locLoc);

            writeLocation({
              city: address.city || "",
              state: address.state || "",
              locality: address.locality || "",
              subLocality: address.subLocality || "",
              country: "India",
              latitude: String(latitude),
              longitude: String(longitude),
              place_id: locPid || cityPid || "",
            });
          }
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

  return (
    <div className="bg-blue-50 shadow-custom rounded-md md:p-5 p-3">
      <p className="md:text-[18px] text-[16px] font-medium text-[#3586FF]  mb-3">Project Location</p>

      <div className="grid md:grid-cols-2 grid-cols-1 md:gap-4 gap-2 w-full">
        <div className="flex flex-row gap-4">
          <CustomInput
            name="state"
            label="State"
            placeholder="Enter state"
            labelCls="md:text-[14px] text-[12px] font-medium text-black"
            className="w-full px-3 md:py-0.5 py-0 placeholder:text-[12px]"
            type="text"
            onChange={(e) => handleLocationChange("state", e.target.value)}
            value={project?.location?.state || ""}
            errorMsg={errors?.state}
            required
          />
        </div>

        <div className="relative w-full">
          <CustomInput
            name="city"
            label="City"
            placeholder="Enter city"
            labelCls="md:text-[14px] text-[12px] font-medium text-black"
            className="w-full px-3 md:py-0.5 py-0 placeholder:text-[12px]"
            type="text"
             required
            onChange={(e) => handleLocationChange("city", e.target.value)}
            value={project?.location?.city || ""}
            errorMsg={errors?.city}
          />
          {showSuggestions.city && (
            <ul className="absolute z-50 max-w-[600px] md:text-[14px] text-[12px] bg-white border-b-[1px] border-gray-300 rounded shadow-md max-h-60 overflow-auto">
              {suggestions.city.map((c) => (
                <li
                  key={c.place_id}
                  className="p-2 cursor-pointer text-[12px] border-b-[2px] hover:bg-gray-200"
                  onClick={() => handleCitySelect(c)}
                >
                  {c.description || `${c.city}${c.state ? `, ${c.state}` : ""}`}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative">
          <CustomInput
            name="locality"
            label="Locality"
            placeholder="Enter locality"
            labelCls="md:text-[14px] text-[12px] font-medium text-black"
            className="w-full px-3 md:py-0.5 py-0 placeholder:text-[12px]"
            type="text"
             required
            onChange={(e) => handleLocationChange("locality", e.target.value)}
            value={project?.location?.locality || ""}
            errorMsg={errors?.locality}
          />
          {showSuggestions.locality && (
            <ul className="absolute z-[100] max-w-[400px] border-b-[1px] md:text-[14px] text-[12px] bg-white border-gray-300 rounded shadow-md max-h-60 overflow-auto">
              {suggestions.locality.map((item) => (
                <li
                  key={item.place_id}
                  className="p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleLocalitySelect(item)}
                >
                  {item.description || item.locality}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative">
          <CustomInput
            name="subLocality"
            label="Sub-Locality (Optional)"
            placeholder="Enter sub-locality"
            labelCls="md:text-[14px] text-[12px] font-medium text-black"
            className="w-full px-3 md:py-0.5 py-0 placeholder:text-[12px]"
            type="text"
            onChange={(e) => handleLocationChange("subLocality", e.target.value)}
            value={project?.location?.subLocality || ""}
            errorMsg={errors?.subLocality}
          />
          {showSuggestions.subLocality && (
            <ul className="absolute z-50 max-w-[600px] md:text-[14px] text-[12px] bg-white border-b-[1px] border-gray-300 rounded shadow-md max-h-60 overflow-auto">
              {suggestions.subLocality.map((item) => (
                <li
                  key={item.place_id ?? item.subLocality}
                  className="p-2 cursor-pointer text-[12px] hover:bg-gray-200"
                  onClick={() => handleSubLocalitySelect(item)}
                >
                  {item.description || item.subLocality}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-row gap-4">
          <CustomInput
            name="landmark"
            label="Landmark "
            placeholder="Enter landmark"
            labelCls="md:text-[14px] text-[12px] font-medium text-black"
            className="w-full px-3 md:py-0.5 py-0 placeholder:text-[12px]"
            type="text"
            onChange={(e) => handleLocationChange("landmark", e.target.value)}
            value={project?.location?.landmark || ""}
            errorMsg={errors?.landmark}
             required
          />
        </div>

        <div className="flex flex-row gap-4">
          <CustomInput
            name="street"
            label="Street"
            placeholder="Enter street"
            labelCls="md:text-[14px] text-[12px] font-medium text-black"
            className="w-full px-3 md:py-0.5 py-0 placeholder:text-[12px]"
            type="text"
            onChange={(e) => handleLocationChange("street", e.target.value)}
            value={project?.location?.street || ""}
            errorMsg={errors?.street}
          />
        </div>

        <div className="flex flex-row gap-4">
          <CustomInput
            name="zipCode"
            label="Zip Code"
            placeholder="Enter zip code"
            labelCls="md:text-[14px] text-[12px] font-medium text-black"
            className="w-full px-3 md:py-0.5 py-0 placeholder:text-[12px] text-[12px]"
            type="text"
            onChange={(e) => handleLocationChange("zipCode", e.target.value)}
            value={(project?.location?.zipCode as any) || ""}
            errorMsg={errors?.zipCode}
          />
        </div>
      </div>

      <div className="w-full flex justify-center my-3">
        <p className="md:text-[14px] text-[10px] font-regular">OR</p>
      </div>

      <div className="w-full flex justify-center">
        <Button
          onClick={getCurrentPosition}
          disabled={loading}
          className="bg-[#5297ff] flex justify-center items-center gap-2 w-full max-w-[350px] hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#5297ff] focus:ring-opacity-50"
        >
          <MapPin className="w-5 h-5 mr-2" />
          {loading ? "Getting location..." : "Use my current location"}
        </Button>
      </div>
    </div>
  );
};

export default ProjectLocation;
