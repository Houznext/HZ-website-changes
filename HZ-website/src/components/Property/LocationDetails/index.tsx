"use client";

import React, { useState, useRef, useEffect } from "react";
import CustomInput from "@/common/FormElements/CustomInput";
import usePostPropertyStore, { ILocationDetails } from "@/store/postproperty";
import Button from "@/common/Button";
import { MapPin } from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchCity,
  fetchLocalities,
  fetchSublocalities,
  getCurrentAddress,
} from "@/utils/locationDetails/datafetchingFunctions";
import { useDebounceCallback } from "usehooks-ts";
import MapPicker from "@/common/MapPicker";

type LatLngStr = { lat: string; lng: string };

const toStrLatLng = (
  loc: { lat?: number; lng?: number } | null | undefined,
): LatLngStr => {
  if (!loc || (loc as any).lat == null) return { lat: "", lng: "" };
  return { lat: String((loc as any).lat), lng: String((loc as any).lng) };
};

const LocationDetails = () => {
  const locationDetails = usePostPropertyStore((s) => s.locationDetails);
  const setProperty = usePostPropertyStore((s) => s.setProperty);
  const property = usePostPropertyStore((s) => s.getProperty());

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [cityPlaceId, setCityPlaceId] = useState<string>(
    locationDetails?.place_id || "",
  );
  const [localityPlaceId, setLocalityPlaceId] = useState<string>("");

  const [cityLocation, setCityLocation] = useState<LatLngStr>({
    lat: "",
    lng: "",
  });
  const [localityLocation, setLocalityLocation] = useState<LatLngStr>({
    lat: "",
    lng: "",
  });

  const [userState, setUserState] = useState<string>(
    locationDetails?.state ?? "",
  );
  const [latLang, setLatLang] = useState({
    latitude: locationDetails?.latitude ?? "",
    longitude: locationDetails?.longitude ?? "",
  });

  const [street, setStreet] = useState<string>("");
  const [zipCode, setZipCode] = useState<string>("");

  const [showSuggestions, setShowSuggestions] = useState({
    city: false,
    locality: false,
    subLocality: false,
  });
  const [suggestions, setSuggestions] = useState({
    city: [] as any[],
    locality: [] as any[],
    subLocality: [] as any[],
  });

  const [error, setError] = useState({ city: "", locality: "" });
  const [pinMap, setPinMap] = useState(false);

  const cacheRef = useRef({
    city: new Map<string, any[]>(),
    locality: new Map<string, any[]>(),
    subLocality: new Map<string, any[]>(),
  });
  const abortRef = useRef<{
    city: AbortController | null;
    locality: AbortController | null;
    subLocality: AbortController | null;
  }>({ city: null, locality: null, subLocality: null });

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
      street: (locationDetails?.street ?? street) || null,
      zipCode: (locationDetails?.zipCode ?? zipCode) || null,
      formattedAddress: locationDetails?.formattedAddress ?? null,
      ...partial,
    };
    setProperty({ ...property, locationDetails: next as any });
  };

  useEffect(() => {
    return () => {
      abortRef.current.city?.abort();
      abortRef.current.locality?.abort();
      abortRef.current.subLocality?.abort();
    };
  }, []);

  const debouncedFetchCity = useDebounceCallback((raw: string) => {
    const q = raw.trim();
    if (!q) return;
    const hit = cacheRef.current.city.get(q);
    if (hit) {
      setSuggestions((p) => ({ ...p, city: hit }));
      return;
    }
    fetchCity(q).then((data) => {
      cacheRef.current.city.set(q, data || []);
      setSuggestions((p) => ({ ...p, city: data || [] }));
    });
  }, 200);

  const debouncedFetchLocality = useDebounceCallback((raw: string) => {
    const q = raw.trim();
    if (!q) return;
    const key = `${cityPlaceId}|${q}`;
    const hit = cacheRef.current.locality.get(key);
    if (hit) {
      setSuggestions((p) => ({ ...p, locality: hit }));
      return;
    }
    fetchLocalities({
      query: q,
      cityPlaceId,
      city: locationDetails?.city || "",
    }).then((data) => {
      cacheRef.current.locality.set(key, data || []);
      setSuggestions((p) => ({ ...p, locality: data || [] }));
    });
  }, 200);

  const debouncedFetchSubLocality = useDebounceCallback((raw: string) => {
    const q = raw.trim();
    if (!q || !localityPlaceId) return;
    const key = `${localityPlaceId}|${q}`;
    const hit = cacheRef.current.subLocality.get(key);
    if (hit) {
      setSuggestions((p) => ({ ...p, subLocality: hit }));
      return;
    }
    fetchSublocalities({
      query: q,
      localityPlaceId,
      locality: locationDetails?.locality || "",
    }).then((data) => {
      cacheRef.current.subLocality.set(key, data || []);
      setSuggestions((p) => ({ ...p, subLocality: data || [] }));
    });
  }, 200);

  const handleChange = (
    field: keyof ILocationDetails | "street" | "zipCode",
    value: string,
  ) => {
    if (field !== "street" && field !== "zipCode") {
      setError((prev) => ({ ...prev, [field]: "" as any }));
    }

    if (field === "city") {
      setShowSuggestions((p) => ({ ...p, city: !!value }));
      setCityPlaceId("");
      setCityLocation({ lat: "", lng: "" });
      setLocalityPlaceId("");
      setLocalityLocation({ lat: "", lng: "" });
      cacheRef.current.locality.clear();
      cacheRef.current.subLocality.clear();
      writeLocation({ city: value, locality: "", subLocality: "" });
      if (value) debouncedFetchCity(value);
      else setSuggestions((p) => ({ ...p, city: [] }));
      return;
    }

    if (field === "locality") {
      setShowSuggestions((p) => ({ ...p, locality: !!value }));
      setLocalityPlaceId("");
      cacheRef.current.subLocality.clear();
      writeLocation({ locality: value, subLocality: "" });
      if (value && (cityPlaceId || locationDetails?.city)) {
        debouncedFetchLocality(value);
      } else {
        setSuggestions((p) => ({ ...p, locality: [] }));
      }
      return;
    }

    if (field === "subLocality") {
      setShowSuggestions((p) => ({ ...p, subLocality: !!value }));
      writeLocation({ subLocality: value });
      if (value && localityPlaceId) debouncedFetchSubLocality(value);
      else setSuggestions((p) => ({ ...p, subLocality: [] }));
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
      const cleanZipCode = value.replace(/\D/g, "").slice(0, 6);
      setZipCode(cleanZipCode);
      writeLocation({ zipCode: cleanZipCode });
      return;
    }
  };

  const change =
    (field: keyof ILocationDetails | "street" | "zipCode") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      handleChange(field, e.target.value);

  const handleCitySelect = (item: any) => {
    writeLocation({ city: item.city, state: item.state ?? userState });
    setUserState(item.state ?? userState);
    setCityPlaceId(item.place_id || "");
    setCityLocation(
      item.location
        ? { lat: String(item.location.lat), lng: String(item.location.lng) }
        : { lat: "", lng: "" },
    );
    setShowSuggestions((p) => ({ ...p, city: false }));
  };

  const handleLocalitySelect = (item: any) => {
    const lat = item.location?.lat ? String(item.location.lat) : "";
    const lng = item.location?.lng ? String(item.location.lng) : "";
    setLocalityPlaceId(item.place_id || "");
    setLocalityLocation(item.location ? { lat, lng } : { lat: "", lng: "" });
    writeLocation({
      locality: item.locality,
      latitude: lat,
      longitude: lng,
      place_id: item.place_id || cityPlaceId || "",
    });
    setLatLang({ latitude: lat, longitude: lng });
    setShowSuggestions((p) => ({ ...p, locality: false }));
  };

  const handleSubLocalitySelect = (item: any) => {
    writeLocation({ subLocality: item.subLocality });
    setShowSuggestions((p) => ({ ...p, subLocality: false }));
  };

  const resolveCityPlaceIdIfMissing = async (
    cityName: string,
  ): Promise<string | undefined> => {
    if (cityPlaceId || !cityName?.trim()) return cityPlaceId || undefined;
    try {
      const cities = (await fetchCity(cityName.trim())) as any[] | null;
      const match =
        cities?.find(
          (c) => c.city?.toLowerCase() === cityName.trim().toLowerCase(),
        ) || cities?.[0];
      if (match) {
        const pid = match.place_id || "";
        setCityPlaceId(pid);
        setCityLocation(toStrLatLng(match.location));
        return pid;
      }
    } catch (e) {
      console.error("Resolve city place_id:", e);
    }
    return undefined;
  };

  const resolveLocalityPlaceIdIfMissing = async (
    locName: string,
    cityName: string,
    cityPlaceIdOverride?: string,
  ) => {
    const cid = cityPlaceIdOverride ?? cityPlaceId;
    if (localityPlaceId || !locName?.trim() || !cityName?.trim()) return;
    if (!cid) return;
    try {
      const list = (await fetchLocalities({
        query: locName.trim(),
        cityPlaceId: cid,
        city: cityName.trim(),
      })) as any[] | null;
      const match =
        list?.find(
          (l) => l.locality?.toLowerCase() === locName.trim().toLowerCase(),
        ) || list?.[0];
      if (match) {
        setLocalityPlaceId(match.place_id || "");
        const asStr = toStrLatLng(match.location);
        setLocalityLocation(asStr);
        setLatLang({ latitude: asStr.lat, longitude: asStr.lng });
        writeLocation({
          locality: match.locality,
          latitude: asStr.lat,
          longitude: asStr.lng,
          place_id: match.place_id || cid || "",
        });
      }
    } catch (e) {
      console.error("Resolve locality place_id:", e);
    }
  };

  const ensurePlaceIds = async () => {
    const city = (locationDetails?.city || "").trim();
    const loc = (locationDetails?.locality || "").trim();
    if (city && !cityPlaceId) await resolveCityPlaceIdIfMissing(city);
    if (loc && (cityPlaceId || city) && !localityPlaceId)
      await resolveLocalityPlaceIdIfMissing(
        loc,
        city || locationDetails?.city || "",
      );
  };

  const validateForm = async () => {
    await ensurePlaceIds();
    if (!locationDetails?.city || !cityPlaceId) {
      setError((p) => ({ ...p, city: "Please select a city from the list" }));
      return false;
    }
    if (!locationDetails?.locality || !localityPlaceId) {
      setError((p) => ({
        ...p,
        locality: "Please select a locality from the list",
      }));
      return false;
    }
    return true;
  };

  const getCurrentPosition = () => {
    setLoading(true);
    setApiError("");
    setPinMap(true);
    try {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const { latitude, longitude, accuracy } = coords;
          if (accuracy && accuracy > 2000) {
            toast.error(
              `Low GPS accuracy (~${Math.round(accuracy)}m). You can fine-tune on the map.`,
            );
          }
          setLatLang({
            latitude: String(latitude),
            longitude: String(longitude),
          });

          const resp = await getCurrentAddress(latitude, longitude);
          const address = resp?.address ?? resp;
          if (!address) {
            toast.error("Could not detect address. Please try again.");
            setLoading(false);
            setPinMap(false);
            return;
          }

          const cityPid = address.city_place_id || "";
          const locPid = address.locality_place_id || "";
          const cityLoc = address.city_location
            ? toStrLatLng(address.city_location)
            : { lat: "", lng: "" };
          const locLoc = address.locality_location
            ? toStrLatLng(address.locality_location)
            : { lat: "", lng: "" };

          setCityPlaceId(cityPid);
          setLocalityPlaceId(locPid);
          setCityLocation(cityLoc);
          setLocalityLocation(locLoc);

          writeLocation({
            city: address.city || "",
            state: address.state || "",
            locality: address.locality || "",
            subLocality: address.subLocality || "",
            latitude: String(latitude),
            longitude: String(longitude),
            place_id: locPid || cityPid || "",
            street:
              address?.street ??
              address?.road ??
              address?.route ??
              address?.streetName ??
              null,
            zipCode:
              (
                address?.zipCode ??
                address?.postalCode ??
                address?.pincode ??
                address?.postal_code ??
                ""
              )
                ?.toString()
                .replace(/\D/g, "")
                .slice(0, 6) || null,
            formattedAddress:
              address?.formattedAddress || address?.formatted_address || null,
          });

          setStreet(
            address?.street ??
              address?.road ??
              address?.route ??
              address?.streetName ??
              "",
          );
          setZipCode(
            (
              address?.zipCode ??
              address?.postalCode ??
              address?.pincode ??
              address?.postal_code ??
              ""
            )
              ?.toString()
              .replace(/\D/g, "")
              .slice(0, 6) || "",
          );

          setShowSuggestions({
            city: false,
            locality: false,
            subLocality: false,
          });

          let resolvedCityPid = cityPid;
          if (!resolvedCityPid && address.city) {
            resolvedCityPid =
              (await resolveCityPlaceIdIfMissing(address.city)) || "";
          }
          if (
            !locPid &&
            address.locality &&
            (address.city || locationDetails?.city)
          ) {
            await resolveLocalityPlaceIdIfMissing(
              address.locality,
              address.city || locationDetails?.city || "",
              resolvedCityPid || undefined,
            );
          }

          setPinMap(false);
          setLoading(false);
        },
        (err) => {
          console.error("Geolocation error:", err);
          toast.error("Failed to get your current location.");
          setLoading(false);
          setPinMap(false);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
      );
    } catch (e) {
      console.error("Unexpected geolocation error:", e);
      toast.error("Something went wrong while getting your location.");
      setLoading(false);
      setPinMap(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <CustomInput
              type="text"
              label="City"
              required
              value={locationDetails?.city}
              onChange={change("city")}
              onBlur={() =>
                resolveCityPlaceIdIfMissing(locationDetails?.city || "")
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  resolveCityPlaceIdIfMissing(locationDetails?.city || "");
                  setShowSuggestions((p) => ({ ...p, city: false }));
                }
              }}
              placeholder="Search city (India)"
              errorMsg={error.city}
              className="w-full md:px-3 px-2 rounded-lg border-slate-200 focus:border-[#3586FF] transition-colors md:py-1 py-0.5"
              labelCls="text-sm text-slate-700 font-medium"
              name="city"
            />
            {showSuggestions.city && (
              <ul className="absolute z-[100] w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto mt-1">
                {suggestions.city.length === 0 && (
                  <li className="p-3 text-sm text-slate-500">
                    No Indian cities found
                  </li>
                )}
                {suggestions.city.map((c: any) => (
                  <li
                    key={c.place_id}
                    className="px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 transition-colors"
                    onClick={() => handleCitySelect(c)}
                  >
                    {c.description ??
                      `${c.city}${c.state ? `, ${c.state}` : ""}`}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!!locationDetails?.city && !!cityPlaceId && (
            <div className="relative">
              <CustomInput
                type="text"
                label="Locality"
                required
                value={locationDetails?.locality}
                onChange={change("locality")}
                onBlur={() =>
                  resolveLocalityPlaceIdIfMissing(
                    locationDetails?.locality || "",
                    locationDetails?.city || "",
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    resolveLocalityPlaceIdIfMissing(
                      locationDetails?.locality || "",
                      locationDetails?.city || "",
                    );
                    setShowSuggestions((p) => ({ ...p, locality: false }));
                  }
                }}
                errorMsg={error.locality}
                placeholder={`Search locality in ${locationDetails?.city}`}
                className="w-full md:px-3 px-2 rounded-lg border-slate-200 focus:border-[#3586FF] transition-colors md:py-1 py-0.5"
                labelCls="text-sm text-slate-700 font-medium"
                name="locality"
              />
              {showSuggestions.locality && (
                <ul className="absolute z-[100] w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto mt-1">
                  {suggestions.locality.length === 0 && (
                    <li className="p-3 text-sm text-slate-500">
                      No localities found
                    </li>
                  )}
                  {suggestions.locality.map((item: any) => (
                    <li
                      key={item.place_id}
                      className="px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 transition-colors"
                      onClick={() => handleLocalitySelect(item)}
                    >
                      {item.description ?? item.locality}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Sub-locality */}
        <div className="relative max-w-md">
          <CustomInput
            type="text"
            label="Sub Locality (Optional)"
            value={locationDetails?.subLocality}
            onChange={change("subLocality")}
            placeholder={`Enter sub-locality in ${locationDetails?.locality || locationDetails?.city || ""}`}
            labelCls="text-sm text-slate-700 font-medium"
            className="w-full md:px-3 px-2 rounded-lg border-slate-200 focus:border-[#3586FF] transition-colors md:py-1 py-0.5"
            name="subLocality"
          />
          {showSuggestions.subLocality && (
            <ul className="absolute z-[100] w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto mt-1">
              {suggestions.subLocality.length === 0 && (
                <li className="p-3 text-sm text-slate-500">
                  No sub-localities found
                </li>
              )}
              {suggestions.subLocality.map((item: any) => (
                <li
                  key={item.place_id ?? `${item.subLocality}-noid`}
                  className="px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 transition-colors"
                  onClick={() => handleSubLocalitySelect(item)}
                >
                  {item.description ?? item.subLocality}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Street & PIN Code */}
        <div className="grid md:grid-cols-2 gap-4">
          <CustomInput
            type="text"
            label="Street / Road"
            value={locationDetails?.street}
            onChange={change("street")}
            placeholder="e.g., 5th Cross Rd, MG Road"
            labelCls="text-sm text-slate-700 font-medium"
            className="w-full md:px-3 px-2  rounded-lg  focus:border-[#3586FF] transition-colors md:py-1 py-0.5"
            name="street"
          />
          <CustomInput
            type="text"
            label="PIN Code"
            value={locationDetails?.zipCode}
            onChange={change("zipCode")}
            placeholder="6-digit PIN"
            labelCls="text-sm text-slate-700 font-medium"
            className="w-full md:px-3 px-2 rounded-lg  focus:border-[#3586FF] transition-colors md:py-1 py-0.5"
            rootCls="max-w-[200px]"
            name="zipCode"
          />
        </div>

        {/* Landmark */}
        <div className="max-w-md">
          <CustomInput
            type="text"
            label="Landmark (Optional)"
            value={locationDetails?.landmark}
            onChange={change("landmark")}
            placeholder="Enter landmark"
            labelCls="text-sm text-slate-700 font-medium"
            className="w-full md:px-3 px-2  rounded-lg  focus:border-[#3586FF] transition-colors md:py-1 py-0.5"
            name="landmark"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-2">
          <hr className="flex-grow border-t border-slate-200" />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            or
          </span>
          <hr className="flex-grow border-t border-slate-200" />
        </div>

        {/* Current Location Button */}
        <div className="flex justify-center">
          <Button
            onClick={getCurrentPosition}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3586FF] hover:bg-[#2d75e6] text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <MapPin className="w-4 h-4" />
            {loading ? "Getting location..." : "Use my current location"}
          </Button>
        </div>

        {apiError && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            {apiError}
          </p>
        )}

        {pinMap && (
          <MapPicker
            defaultCenter={{
              lat: parseFloat(latLang.latitude) || 17.385044,
              lng: parseFloat(latLang.longitude) || 78.486671,
            }}
            initialMarker={
              latLang.latitude && latLang.longitude
                ? {
                    lat: parseFloat(latLang.latitude),
                    lng: parseFloat(latLang.longitude),
                  }
                : undefined
            }
            onClose={() => setPinMap(false)}
            onLocationSelect={async (coords) => {
              setLatLang({
                latitude: String(coords.lat),
                longitude: String(coords.lng),
              });
              const resp = await getCurrentAddress(coords.lat, coords.lng);
              const address = resp?.address ?? resp;
              if (address) {
                setCityPlaceId(address.city_place_id || "");
                setLocalityPlaceId(address.locality_place_id || "");
                setCityLocation(toStrLatLng(address.city_location));
                setLocalityLocation(toStrLatLng(address.locality_location));
                writeLocation({
                  city: address.city || "",
                  state: address.state || "",
                  locality: address.locality || "",
                  subLocality: address.subLocality || "",
                  latitude: String(coords.lat),
                  longitude: String(coords.lng),
                  place_id:
                    address.locality_place_id || address.city_place_id || "",
                  street:
                    address?.street ??
                    address?.road ??
                    address?.route ??
                    address?.streetName ??
                    null,
                  zipCode:
                    (
                      address?.zipCode ??
                      address?.postalCode ??
                      address?.pincode ??
                      address?.postal_code ??
                      ""
                    )
                      ?.toString()
                      .replace(/\D/g, "")
                      .slice(0, 6) || null,
                  formattedAddress:
                    address?.formattedAddress ||
                    address?.formatted_address ||
                    null,
                });
                setStreet(
                  address?.street ??
                    address?.road ??
                    address?.route ??
                    address?.streetName ??
                    "",
                );
                setZipCode(
                  (
                    address?.zipCode ??
                    address?.postalCode ??
                    address?.pincode ??
                    address?.postal_code ??
                    ""
                  )
                    ?.toString()
                    .replace(/\D/g, "")
                    .slice(0, 6) || "",
                );
              }
              setPinMap(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default LocationDetails;
