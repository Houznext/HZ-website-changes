import React, { useState, useRef, useEffect } from "react";
import Button from "@/common/Button";
import usePostPropertyStore from "@/store/postproperty";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import {
  fetchCity,
  fetchLocalities,
  fetchSublocalities,
  getCurrentAddress,
} from "@/utils/locationDetails/datafetchingFunctions";
import { useDebounceCallback } from "usehooks-ts";
import Loader from "@/components/Loader";
import { MapPin } from "lucide-react";
import CustomInput from "@/common/FormElements/CustomInput";
import MapPicker from "@/common/MapPicker";

type LatLngStr = { lat: string; lng: string };
type LatLngNum = { lat: number; lng: number };

type CitySuggestion = {
  city: string;
  state?: string;
  description?: string;
  place_id: string;
  location?: LatLngNum | LatLngStr;
};

type LocalitySuggestion = {
  locality: string;
  description?: string;
  place_id: string;
  location?: LatLngNum | LatLngStr;
};

type SubLocalitySuggestion = {
  subLocality: string;
  description?: string;
  place_id?: string;
};

const toStrLatLng = (loc?: LatLngNum | LatLngStr | null): LatLngStr => {
  if (!loc) return { lat: "", lng: "" };
  return {
    lat: String((loc as any).lat ?? ""),
    lng: String((loc as any).lng ?? ""),
  };
};

const LocationDetails = ({ handleNext }: { handleNext: () => void }) => {
  const {
    locationDetails: savedLocationDetails,
    propertyId,
    setProperty,
  } = usePostPropertyStore();

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [latLang, setLatLang] = useState({
    latitude: savedLocationDetails?.latitude || "",
    longitude: savedLocationDetails?.longitude || "",
  });

  // City / Locality / SubLocality
  const [searchText, setSearchText] = useState(
    savedLocationDetails?.city || ""
  );
  const [cityPlaceId, setCityPlaceId] = useState(
    savedLocationDetails?.place_id || ""
  );
  const [locality, setLocality] = useState(
    savedLocationDetails?.locality || ""
  );
  const [localityPlaceId, setLocalityPlaceId] = useState("");
  const [userState, setUserState] = useState(savedLocationDetails?.state || "");
  const [subLocality, setSubLocality] = useState(
    savedLocationDetails?.subLocality || ""
  );
  const [landmark, setLandmark] = useState(
    savedLocationDetails?.landmark || ""
  );

  const cacheRef = useRef({
    city: new Map<string, any[]>(),
    locality: new Map<string, any[]>(),
    subLocality: new Map<string, any[]>(),
  });

  const abortRef = useRef<{
    city: AbortController | null;
    locality: AbortController | null;
    subLocality: AbortController | null;
  }>({
    city: null,
    locality: null,
    subLocality: null,
  });

  // NEW: user-typed extras
  const [street, setStreet] = useState(savedLocationDetails?.street || "");
  const [zipCode, setZipCode] = useState(
    (savedLocationDetails?.zipCode as string) || ""
  );
  const [formattedAddress, setFormattedAddress] = useState(
    savedLocationDetails?.formattedAddress || ""
  );

  // map-friendly centers (keep as strings for MapPicker parseFloat usage)
  const [cityLocation, setCityLocation] = useState<LatLngStr>({
    lat: "",
    lng: "",
  });
  const [localityLocation, setLocalityLocation] = useState<LatLngStr>({
    lat: "",
    lng: "",
  });

  // suggestions
  const [showSuggestions, setShowSuggestions] = useState({
    city: false,
    locality: false,
    subLocality: false,
  });
  const [suggestions, setSuggestions] = useState<{
    city: CitySuggestion[];
    locality: LocalitySuggestion[];
    subLocality: SubLocalitySuggestion[];
  }>({
    city: [],
    locality: [],
    subLocality: [],
  });

  const [error, setError] = useState({ city: "", locality: "" });
  const [pinMap, setPinMap] = useState(false);

  // --- replace these debounced fetchers ---

  const debouncedFetchCity = useDebounceCallback(async (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed.length < 2) return;

    const cacheKey = trimmed.toLowerCase(); // for cache only
    const hit = cacheRef.current.city.get(cacheKey);
    if (hit) {
      setSuggestions((p) => ({ ...p, city: hit }));
      return;
    }

    abortRef.current.city?.abort();
    abortRef.current.city = new AbortController();

    try {
      const data = await fetchCity(trimmed); // send ORIGINAL (not lowercased)
      cacheRef.current.city.set(cacheKey, data || []);
      setSuggestions((p) => ({ ...p, city: data || [] }));
    } catch (e: any) {
      if (e.name !== "CanceledError" && e.name !== "AbortError")
        console.error(e);
    }
  }, 300);

  const debouncedFetchLocality = useDebounceCallback(async (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed.length < 2 || !cityPlaceId) return;

    const cacheKey = `${cityPlaceId}|${trimmed.toLowerCase()}`;
    const hit = cacheRef.current.locality.get(cacheKey);
    if (hit) {
      setSuggestions((p) => ({ ...p, locality: hit }));
      return;
    }

    abortRef.current.locality?.abort();
    abortRef.current.locality = new AbortController();

    try {
      const data = await fetchLocalities(
        { query: trimmed, cityPlaceId, city: searchText }, // ORIGINAL
        abortRef.current.locality.signal
      );
      cacheRef.current.locality.set(cacheKey, data || []);
      setSuggestions((p) => ({ ...p, locality: data || [] }));
    } catch (e: any) {
      if (e.name !== "CanceledError" && e.name !== "AbortError")
        console.error(e);
    }
  }, 300);

  const debouncedFetchSubLocality = useDebounceCallback(async (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed.length < 2 || !localityPlaceId) return;

    const cacheKey = `${localityPlaceId}|${trimmed.toLowerCase()}`;
    const hit = cacheRef.current.subLocality.get(cacheKey);
    if (hit) {
      setSuggestions((p) => ({ ...p, subLocality: hit }));
      return;
    }

    abortRef.current.subLocality?.abort();
    abortRef.current.subLocality = new AbortController();

    try {
      const data = await fetchSublocalities(
        { query: trimmed, localityPlaceId, locality }, // ORIGINAL
        abortRef.current.subLocality.signal
      );
      cacheRef.current.subLocality.set(cacheKey, data || []);
      setSuggestions((p) => ({ ...p, subLocality: data || [] }));
    } catch (e: any) {
      if (e.name !== "CanceledError" && e.name !== "AbortError")
        console.error(e);
    }
  }, 300);

  // ----- inputs -----
  const handleChange = (field: string, value: string) => {
    setError((prev) => ({ ...prev, [field]: "" }));

    if (field === "city") {
      const cleaned = value.replace(/[^a-zA-Z0-9\s,\-().]/g, ""); // friendlier
      setSearchText(cleaned);
      setShowSuggestions((p) => ({ ...p, city: !!cleaned.trim() }));
      setCityPlaceId("");
      setCityLocation({ lat: "", lng: "" });
      setLocality("");
      setLocalityPlaceId("");
      setLocalityLocation({ lat: "", lng: "" });
      setSubLocality("");
      if (cleaned.trim()) debouncedFetchCity(cleaned);
    } else if (field === "locality") {
      const cleaned = value.replace(/[^a-zA-Z0-9\s,\-().]/g, "");
      setLocality(cleaned);
      setShowSuggestions((p) => ({ ...p, locality: !!cleaned.trim() }));
      setLocalityPlaceId("");
      setSubLocality("");
      if (cleaned.trim() && cityPlaceId) debouncedFetchLocality(cleaned);
    } else if (field === "subLocality") {
      setSubLocality(value);
      setShowSuggestions((p) => ({ ...p, subLocality: !!value }));
      if (value && localityPlaceId) debouncedFetchSubLocality(value);
    } else if (field === "landmark") {
      setLandmark(value);
    } else if (field === "street") {
      setStreet(value);
    } else if (field === "zipCode") {
      setZipCode(value.replace(/\D/g, "").slice(0, 6));
    }
  };

  const handleCitySelect = (item: CitySuggestion) => {
    setSearchText(item.city);
    setUserState(item.state || "");
    setCityPlaceId(item.place_id);
    setCityLocation(toStrLatLng(item.location));
    setShowSuggestions((p) => ({ ...p, city: false }));
  };

  const handleLocalitySelect = (item: LocalitySuggestion) => {
    setLocality(item.locality);
    setLocalityPlaceId(item.place_id);
    const asStr = toStrLatLng(item.location);
    setLocalityLocation(asStr);
    setLatLang({
      latitude: asStr.lat,
      longitude: asStr.lng,
    });
    setShowSuggestions((p) => ({ ...p, locality: false }));
  };

  const handleSubLocalitySelect = (item: SubLocalitySuggestion) => {
    setSubLocality(item.subLocality);
    setShowSuggestions((p) => ({ ...p, subLocality: false }));
  };
  const ensurePlaceIds = async () => {
    if (!cityPlaceId && searchText.trim()) {
      await resolveCityPlaceIdIfMissing(searchText.trim());
    }
    if (
      !localityPlaceId &&
      locality.trim() &&
      (cityPlaceId || searchText.trim())
    ) {
      await resolveLocalityPlaceIdIfMissing(locality.trim(), searchText.trim());
    }
  };

  const resolveCityPlaceIdIfMissing = async (cityName: string) => {
    if (cityPlaceId || !cityName) return;
    const cities = (await fetchCity(cityName)) as CitySuggestion[] | null;
    const match =
      cities?.find((c) => c.city?.toLowerCase() === cityName.toLowerCase()) ||
      cities?.[0];
    if (match) {
      setCityPlaceId(match.place_id);
      setCityLocation(toStrLatLng(match.location));
    }
  };

  const resolveLocalityPlaceIdIfMissing = async (
    locName: string,
    cityName: string
  ) => {
    if (localityPlaceId || !locName || !cityName) return;
    const list = (await fetchLocalities({
      query: locName,
      cityPlaceId,
      city: cityName,
    })) as LocalitySuggestion[] | null;

    const match =
      list?.find((l) => l.locality?.toLowerCase() === locName.toLowerCase()) ||
      list?.[0];
    if (match) {
      setLocalityPlaceId(match.place_id);
      const asStr = toStrLatLng(match.location);
      setLocalityLocation(asStr);
      setLatLang({ latitude: asStr.lat, longitude: asStr.lng });
    }
  };

  // ----- validation -----
  const validateForm = async () => {
    await ensurePlaceIds();
    if (!searchText || !cityPlaceId) {
      setError((prev) => ({ ...prev, city: "Please select a city" }));
      return false;
    }
    if (!locality || !localityPlaceId) {
      setError((prev) => ({ ...prev, locality: "Please select a locality" }));
      return false;
    }
    return true;
  };

  // ----- current location -----
  // keep types above...

  const setAddressFromReverseGeocode = (raw: any) => {
    const address = raw?.address ?? raw;

    setSearchText(address?.city || "");
    setUserState(address?.state || "");
    setLocality(address?.locality || "");
    setSubLocality(address?.subLocality || "");

    setCityPlaceId(address?.city_place_id || "");
    setLocalityPlaceId(address?.locality_place_id || "");

    setCityLocation(
      address?.city_location
        ? toStrLatLng(address.city_location)
        : { lat: "", lng: "" }
    );
    setLocalityLocation(
      address?.locality_location
        ? toStrLatLng(address.locality_location)
        : { lat: "", lng: "" }
    );

    // best-effort street + 6-digit PIN
    setStreet(
      address?.street ??
      address?.road ??
      address?.route ??
      address?.streetName ??
      ""
    );
    setZipCode(
      String(
        address?.zipCode ??
        address?.postalCode ??
        address?.pincode ??
        address?.postal_code ??
        ""
      )
        .replace(/\D/g, "")
        .slice(0, 6)
    );
    setFormattedAddress(
      address?.formattedAddress || address?.formatted_address || ""
    );

    if (address?.locality_location?.lat && address?.locality_location?.lng) {
      setLatLang({
        latitude: String(address.locality_location.lat),
        longitude: String(address.locality_location.lng),
      });
    }
  };

  const getCurrentPosition = () => {
    setLoading(true);
    setPinMap(true);

    try {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const { latitude, longitude, accuracy } = coords;
          if (accuracy && accuracy > 2000) {
            toast.error(
              `Low GPS accuracy (~${Math.round(
                accuracy
              )}m). You can fine-tune on the map.`
            );
          }
          setLatLang({
            latitude: String(latitude),
            longitude: String(longitude),
          });
          const resp = await getCurrentAddress(latitude, longitude);
          const addr = resp?.address ?? resp;

          if (!addr) {
            toast.error(
              "Could not detect address. Please adjust the pin manually."
            );
            setLoading(false);
            setPinMap(false);
            return;
          }

          setAddressFromReverseGeocode(addr);
          setShowSuggestions({
            city: false,
            locality: false,
            subLocality: false,
          });

          if (!addr.city_place_id && addr.city) {
            await resolveCityPlaceIdIfMissing(addr.city);
          }
          if (
            !addr.locality_place_id &&
            addr.locality &&
            (addr.city || searchText)
          ) {
            await resolveLocalityPlaceIdIfMissing(
              addr.locality,
              addr.city || searchText
            );
          }

          setPinMap(false);
          setLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Failed to get your current location.");
          setLoading(false);
          setPinMap(false);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred while detecting location.");
      setLoading(false);
      setPinMap(false);
    }
  };

  // ----- submit -----
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = {
        locationDetails: {
          city: searchText,
          state: userState,
          locality,
          subLocality: subLocality || null,
          street: street || null,
          zipCode: zipCode || null,
          landmark: landmark || null,
          formattedAddress: formattedAddress || null,
          latitude: latLang.latitude,
          longitude: latLang.longitude,
          place_id: localityPlaceId || cityPlaceId,
        },
      };

      const res = await apiClient.patch(
        `${apiClient.URLS.post_property}/location-details/${propertyId}`,
        payload,
        true
      );

      if (res.status === 200) {
        setProperty(res.body);
        toast.success("Location details updated successfully");
        handleNext();
      }
    } catch (err) {
      console.error("Error while posting location details:", err);
      toast.error("Failed to submit data. Please try again.");
      setApiError("Failed to submit data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      abortRef.current.city?.abort();
      abortRef.current.locality?.abort();
      abortRef.current.subLocality?.abort();
    };
  }, []);

  if (loading ) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-[820px]">
      {/* Header */}
      <h1 className="text-lg md:text-xl font-bold text-[#3586FF] mb-1">Location Details</h1>
      <p className="text-sm text-slate-500 mb-5">
        Where is your property located? This helps buyers find it faster.
      </p>

      <div className="max-w-[470px]">
        {/* Use Current Location Button */}
        <div className="mb-4">
          <Button
            onClick={getCurrentPosition}
            disabled={loading}
            className="bg-[#3586FF] text-[13px] flex justify-center items-center gap-2 w-full hover:bg-[#2d75e6] text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
          >
            <MapPin className="w-4 h-4" />
            {loading ? "Getting location…" : "Use my current location"}
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <hr className="flex-grow border-t border-slate-200" />
          <span className="text-xs font-medium text-slate-400 uppercase">or enter manually</span>
          <hr className="flex-grow border-t border-slate-200" />
        </div>

        {/* City */}
        <div className="relative mb-3">
          <CustomInput
            type="text"
            label="City"
            labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium"
            value={searchText}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="Search city (India)"
            errorMsg={error.city}
            className="text-sm"
            name="city"
            required
            onBlur={() => resolveCityPlaceIdIfMissing(searchText.trim())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                resolveCityPlaceIdIfMissing(searchText.trim());
                setShowSuggestions((p) => ({ ...p, city: false }));
              }
            }}
          />
          {showSuggestions.city && suggestions.city.length > 0 && (
            <ul className="absolute z-20 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-[200px] overflow-auto mt-1">
              {suggestions.city.map((c) => (
                <li
                  key={c.place_id}
                  className="px-3 py-2.5 cursor-pointer text-[13px] border-b border-slate-100 hover:bg-blue-50 transition-colors"
                  onClick={() => handleCitySelect(c)}
                >
                  <span className="font-medium text-slate-800">{c.city}</span>
                  {c.state && <span className="text-slate-500">, {c.state}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Locality */}
        {searchText && cityPlaceId && (
          <div className="relative mb-3">
            <CustomInput
              type="text"
              label="Locality"
              labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium"
              value={locality}
              onChange={(e) => handleChange("locality", e.target.value)}
              errorMsg={error.locality}
              placeholder={`Search locality in ${searchText}`}
              className="text-sm"
              name="locality"
              required
              onBlur={() => resolveLocalityPlaceIdIfMissing(locality.trim(), searchText.trim())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  resolveLocalityPlaceIdIfMissing(locality.trim(), searchText.trim());
                  setShowSuggestions((p) => ({ ...p, locality: false }));
                }
              }}
            />
            {showSuggestions.locality && suggestions.locality.length > 0 && (
              <ul className="absolute z-20 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-[200px] overflow-auto mt-1">
                {suggestions.locality.map((item) => (
                  <li
                    key={item.place_id}
                    className="px-3 py-2.5 cursor-pointer text-[13px] border-b border-slate-100 hover:bg-blue-50 transition-colors"
                    onClick={() => handleLocalitySelect(item)}
                  >
                    <span className="font-medium text-slate-800">{item.locality}</span>
                    <span className="text-slate-500 text-xs ml-1">— {item.description}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Sub-Locality */}
        <div className="relative mb-3">
          <CustomInput
            type="text"
            label="Sub Locality (Optional)"
            labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium"
            className="text-sm"
            value={subLocality}
            onChange={(e) => handleChange("subLocality", e.target.value)}
            placeholder={`Enter sub-locality in ${locality || searchText || "your area"}`}
            name="subLocality"
          />
          {showSuggestions.subLocality && suggestions.subLocality.length > 0 && (
            <ul className="absolute z-20 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-[200px] overflow-auto mt-1">
              {suggestions.subLocality.map((item) => (
                <li
                  key={item.place_id ?? item.subLocality}
                  className="px-3 py-2.5 cursor-pointer text-[13px] border-b border-slate-100 hover:bg-blue-50 transition-colors"
                  onClick={() => handleSubLocalitySelect(item)}
                >
                  <span className="font-medium text-slate-800">{item.subLocality}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Street & PIN Code */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <CustomInput
            type="text"
            label="Street / Road"
            labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium"
            className="text-sm"
            value={street}
            onChange={(e) => handleChange("street", e.target.value)}
            placeholder="e.g., MG Road"
            name="street"
          />
          <CustomInput
            type="text"
            label="PIN Code"
            labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium"
            className="text-sm"
            value={zipCode}
            onChange={(e) => handleChange("zipCode", e.target.value)}
            placeholder="6-digit PIN"
            name="zipCode"
          />
        </div>

        {/* Landmark */}
        <div className="mb-4">
          <CustomInput
            type="text"
            label="Landmark (Optional)"
            labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium"
            className="text-sm"
            value={landmark}
            onChange={(e) => handleChange("landmark", e.target.value)}
            placeholder="Nearby landmark"
            name="landmark"
          />
        </div>

        {/* Map Picker */}
        {pinMap && (
          <MapPicker
            defaultCenter={{
              lat: parseFloat(latLang.latitude) || 17.385044,
              lng: parseFloat(latLang.longitude) || 78.486671,
            }}
            initialMarker={
              latLang.latitude && latLang.longitude
                ? { lat: parseFloat(latLang.latitude), lng: parseFloat(latLang.longitude) }
                : undefined
            }
            onClose={() => setPinMap(false)}
            onLocationSelect={async (coords) => {
              setLatLang({ latitude: String(coords.lat), longitude: String(coords.lng) });
              const address = await getCurrentAddress(coords.lat, coords.lng);
              if (address) setAddressFromReverseGeocode(address);
              setPinMap(false);
            }}
          />
        )}

        {/* Error */}
        {apiError && <p className="text-red-500 text-sm mb-3">{apiError}</p>}

        {/* Continue Button */}
        <Button
          onClick={handleSubmit}
          className="w-full py-2.5 bg-[#3586FF] hover:bg-[#2d75e6] text-white font-medium rounded-lg text-[14px] md:text-[15px] transition-colors duration-200"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default LocationDetails;
