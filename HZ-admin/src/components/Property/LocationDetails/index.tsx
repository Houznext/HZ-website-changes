"use client";

import React, { useState } from "react";
import usePostPropertyStore, {
  ILocationDetails,
} from "@/src/stores/postproperty";
import Button from "@/src/common/Button";
import {
  fetchCity,
  fetchLocalities,
  fetchSublocalities,
  getCurrentAddress,
  type CitySuggestion,
  type LocalitySuggestion,
  type SubLocalitySuggestion,
} from "@/src/utils/locationDetails/datafetchingFunctions";
import { useDebounceCallback } from "usehooks-ts";
import { MapPin } from "lucide-react";
import CustomInput from "@/src/common/FormElements/CustomInput";

const LocationDetails = ({ errors }: any) => {
  const locationDetails = usePostPropertyStore((s) => s.locationDetails);
  const setProperty = usePostPropertyStore((s) => s.setProperty);
  const property = usePostPropertyStore((s) => s.getProperty());

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [latLang, setLatLang] = useState({ latitude: "", longitude: "" });
  const [cityPlaceId, setCityPlaceId] = useState<string>(
    locationDetails?.place_id || ""
  );
  const [localityPlaceId, setLocalityPlaceId] = useState<string>("");

  const [street, setStreet] = useState(locationDetails?.street || "");
  const [zipCode, setZipCode] = useState(locationDetails?.zipCode || "");
  const [formattedAddress, setFormattedAddress] = useState(
    locationDetails?.formattedAddress || ""
  );

  const [showSuggestions, setShowSuggestions] = useState({
    city: false,
    locality: false,
    subLocality: false,
  });

  const [suggestions, setSuggestions] = useState<{
    city: CitySuggestion[];
    locality: LocalitySuggestion[];
    subLocality: SubLocalitySuggestion[];
  }>({ city: [], locality: [], subLocality: [] });

  const [error, setError] = useState({ city: "", locality: "" });

  const writeLocation = (partial: Partial<ILocationDetails>) => {
    const next: ILocationDetails = {
      city: locationDetails?.city || "",
      state: locationDetails?.state ?? "",
      locality: locationDetails?.locality || "",
      subLocality: locationDetails?.subLocality || "",
      landmark: locationDetails?.landmark || "",
      latitude: locationDetails?.latitude ?? "",
      longitude: locationDetails?.longitude ?? "",
      place_id: locationDetails?.place_id || "",
      street: locationDetails?.street || "",
      zipCode: locationDetails?.zipCode || "",
      formattedAddress: locationDetails?.formattedAddress || "",
      ...partial,
    };
    setProperty({ ...property, locationDetails: next });
  };

  const debouncedFetchCity = useDebounceCallback((input: string) => {
    const q = input.trim();
    if (!q) return;
    fetchCity(q).then((data) =>
      setSuggestions((p) => ({ ...p, city: data || [] }))
    );
  }, 150);

  const debouncedFetchLocality = useDebounceCallback((input: string) => {
    const q = input.trim();
    if (!q) return;
    fetchLocalities({
      query: q,
      cityPlaceId,
      city: locationDetails?.city || "",
    }).then((data) => setSuggestions((p) => ({ ...p, locality: data || [] })));
  }, 150);

  const debouncedFetchSubLocality = useDebounceCallback((input: string) => {
    const q = input.trim();
    if (!q || !localityPlaceId) return;
    fetchSublocalities({
      query: q,
      localityPlaceId,
      locality: locationDetails?.locality || "",
    }).then((data) =>
      setSuggestions((p) => ({ ...p, subLocality: data || [] }))
    );
  }, 150);

  const handleChange = (
    field: keyof ILocationDetails | "zipCode" | "street",
    value: string
  ) => {
    if (field === "city") {
      setError((p) => ({ ...p, city: "" }));
      writeLocation({ city: value, locality: "", subLocality: "" });
      setCityPlaceId("");
      setLocalityPlaceId("");
      setShowSuggestions((p) => ({ ...p, city: !!value }));
      value
        ? debouncedFetchCity(value)
        : setSuggestions((p) => ({ ...p, city: [] }));
      return;
    }

    if (field === "locality") {
      setError((p) => ({ ...p, locality: "" }));
      writeLocation({ locality: value, subLocality: "" });
      setLocalityPlaceId("");
      setShowSuggestions((p) => ({ ...p, locality: !!value }));
      value && (cityPlaceId || locationDetails?.city)
        ? debouncedFetchLocality(value)
        : setSuggestions((p) => ({ ...p, locality: [] }));
      return;
    }

    if (field === "subLocality") {
      writeLocation({ subLocality: value });
      setShowSuggestions((p) => ({ ...p, subLocality: !!value }));
      value && localityPlaceId
        ? debouncedFetchSubLocality(value)
        : setSuggestions((p) => ({ ...p, subLocality: [] }));
      return;
    }

    if (field === "landmark") {
      writeLocation({ landmark: value });
      return;
    }

    if (field === "street") {
      setStreet(value);
      writeLocation({ street: value });
      return;
    }

    if (field === "zipCode") {
      const pin = value.replace(/\D/g, "").slice(0, 6);
      setZipCode(pin);
      writeLocation({ zipCode: pin });
      return;
    }
  };

  const handleCitySelect = (item: CitySuggestion) => {
    writeLocation({
      city: item.city,
      state: item.state || locationDetails?.state || "",
    });
    setCityPlaceId(item.place_id);
    setShowSuggestions((p) => ({ ...p, city: false }));
  };

  const handleLocalitySelect = (item: LocalitySuggestion) => {
    const lat = item.location?.lat != null ? String(item.location.lat) : "";
    const lng = item.location?.lng != null ? String(item.location.lng) : "";
    writeLocation({
      locality: item.locality,
      latitude: lat,
      longitude: lng,
      place_id: item.place_id || cityPlaceId || "",
    });
    setLocalityPlaceId(item.place_id);
    setLatLang({ latitude: lat, longitude: lng });
    setShowSuggestions((p) => ({ ...p, locality: false }));
  };

  const handleSubLocalitySelect = (item: SubLocalitySuggestion) => {
    writeLocation({ subLocality: item.subLocality });
    setShowSuggestions((p) => ({ ...p, subLocality: false }));
  };

  // Fill EVERYTHING from current coordinates
  const getCurrentPosition = () => {
    setLoading(true);
    setApiError("");

    // helper to normalize the /current-location response shape
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
        subLocality: a.subLocality ?? "",
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
          setLatLang({
            latitude: String(latitude),
            longitude: String(longitude),
          });

          const raw = await getCurrentAddress(latitude, longitude);
          const addr = normalizeAddress(raw);

          setCityPlaceId(addr.city_place_id || "");
          setLocalityPlaceId(addr.locality_place_id || "");
          setStreet(addr.street);
          setZipCode(addr.zipCode);
          setFormattedAddress(addr.formattedAddress);

          writeLocation({
            city: addr.city,
            state: addr.state,
            locality: addr.locality,
            subLocality: addr.subLocality,
            latitude: String(latitude),
            longitude: String(longitude),
            place_id: addr.locality_place_id || addr.city_place_id || "",
            street: addr.street,
            zipCode: addr.zipCode,
            formattedAddress: addr.formattedAddress,
          });

          setShowSuggestions({
            city: false,
            locality: false,
            subLocality: false,
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

  return (
    <div className="w-full max-w-[600px] p-2 md:p-4">
      <div className="flex flex-col gap-5">
        {/* City Input */}
        <div className="relative">
          <CustomInput
            type="text"
            label="Enter City"
            labelCls="label-text text-gray-700"
            value={locationDetails?.city}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="Search city (India)"
            errorMsg={error.city}
            className="w-full  rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all"
            required
            name="city"
          />
          {showSuggestions.city && (
            <ul className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {suggestions.city.map((c) => (
                <li
                  key={c.place_id}
                  className="px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors sublabel-text"
                  onClick={() => handleCitySelect(c)}
                >
                  {c.description || `${c.city}${c.state ? `, ${c.state}` : ""}`}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Locality Input */}
        {!!locationDetails?.city && cityPlaceId && (
          <div className="relative">
            <CustomInput
              type="text"
              label="Enter Locality"
              labelCls="label-text text-gray-700"
              value={locationDetails.locality}
              onChange={(e) => handleChange("locality", e.target.value)}
              errorMsg={error.locality}
              placeholder={`Search locality in ${locationDetails?.city}`}
              className="w-full  rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all"
              name="locality"
              required
            />
            {showSuggestions.locality && (
              <ul className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {suggestions.locality.map((item) => (
                  <li
                    key={item.place_id}
                    className="px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors sublabel-text"
                    onClick={() => handleLocalitySelect(item)}
                  >
                    {item.description || item.locality}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Sub Locality Input */}
        <div className="relative">
          <CustomInput
            type="text"
            label="Sub Locality (Optional)"
            labelCls="label-text text-gray-700"
            value={locationDetails?.subLocality}
            onChange={(e) => handleChange("subLocality", e.target.value)}
            placeholder={`Enter sub-locality in ${
              locationDetails?.locality || locationDetails?.city || ""
            }`}
            className="w-full  rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all"
            name="subLocality"
          />
          {showSuggestions.subLocality && (
            <ul className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {suggestions.subLocality.map((item) => (
                <li
                  key={item.place_id ?? item.subLocality}
                  className="px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors sublabel-text"
                  onClick={() => handleSubLocalitySelect(item)}
                >
                  {item.description || item.subLocality}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Street and PIN code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInput
            type="text"
            label="Street / Road"
            labelCls="label-text text-gray-700"
            className="w-full  rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all"
            value={street}
            onChange={(e) => handleChange("street", e.target.value)}
            placeholder="e.g., 5th Cross Rd, MG Road"
            name="street"
          />
          <CustomInput
            type="text"
            label="PIN code"
            labelCls="label-text text-gray-700"
            className="w-full  rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all"
            value={zipCode}
            onChange={(e) => handleChange("zipCode", e.target.value)}
            placeholder="6-digit PIN"
            name="zipCode"
          />
        </div>

        {/* Landmark */}
        <CustomInput
          type="text"
          label="Landmark (Optional)"
          labelCls="label-text text-gray-700"
          value={locationDetails?.landmark}
          onChange={(e) => handleChange("landmark", e.target.value)}
          placeholder="Enter landmark"
          className="w-full  rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all"
          name="landmark"
        />

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="sublabel-text text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Current Location Button */}
        <Button
          onClick={getCurrentPosition}
          disabled={loading}
          className="bg-[#3586FF] hover:bg-[#2563eb] text-white btn-text font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 max-w-[380px]"
        >
          <MapPin className="w-5 h-5" />
          {loading ? "Getting location..." : "Use my current location"}
        </Button>

        {apiError && (
          <p className="text-red-500 sublabel-text mt-1">{apiError}</p>
        )}
      </div>
    </div>
  );
};

export default LocationDetails;
