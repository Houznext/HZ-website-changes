import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, Marker, Autocomplete, useLoadScript } from "@react-google-maps/api";
import Button from "@/common/Button";

type LatLng = { lat: number; lng: number };

type MapPickerProps = {
    /** Initial center for the map */
    defaultCenter: LatLng;
    /** Called when user confirms the selection */
    onLocationSelect: (coords: LatLng) => void;
    /** Optional: close the modal */
    onClose?: () => void;
    /** Optional: pre-selected marker position */
    initialMarker?: LatLng;
};

const containerStyle: React.CSSProperties = { width: "100%", height: "100%" };
const libraries: ("places")[] = ["places"];

async function reverseGeocode(lat: number, lng: number) {
    // Uses your own API which we already fixed to return flat fields
    const res = await fetch(`/api/current-location?lat=${lat}&lng=${lng}`);
    if (!res.ok) throw new Error("Failed to reverse-geocode");
    return res.json();
}

const MapPicker: React.FC<MapPickerProps> = ({
    defaultCenter,
    onLocationSelect,
    onClose,
    initialMarker,
}) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY as string,
        libraries,
    });

    const [center, setCenter] = useState<LatLng>(initialMarker ?? defaultCenter);
    const [marker, setMarker] = useState<LatLng>(initialMarker ?? defaultCenter);
    const [isResolving, setIsResolving] = useState(false);
    const [resolved, setResolved] = useState<null | {
        city?: string;
        state?: string;
        locality?: string;
        subLocality?: string;
    }>(null);

    const mapRef = useRef<google.maps.Map | null>(null);
    const acRef = useRef<google.maps.places.Autocomplete | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const onMapLoad = (map: google.maps.Map) => {
        mapRef.current = map;
    };

    const updateAddress = useCallback(async (pos: LatLng) => {
        setIsResolving(true);
        try {
            const data = await reverseGeocode(pos.lat, pos.lng);
            setResolved({
                city: data.city ?? data.address?.city,
                state: data.state ?? data.address?.state,
                locality: data.locality ?? data.address?.locality,
                subLocality: data.subLocality ?? data.address?.subLocality,
            });
        } catch {
            setResolved(null);
        } finally {
            setIsResolving(false);
        }
    }, []);

    // Resolve address on first mount
    useEffect(() => {
        updateAddress(marker);
    }, []); // eslint-disable-line

    const onClickMap = (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setMarker(pos);
        setCenter(pos);
        updateAddress(pos);
    };

    const onDragEnd = (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setMarker(pos);
        updateAddress(pos);
    };

    const onPlaceChanged = () => {
        const ac = acRef.current;
        if (!ac) return;
        const place = ac.getPlace();
        if (!place.geometry) return;
        const loc = place.geometry.location!;
        const pos = { lat: loc.lat(), lng: loc.lng() };
        setCenter(pos);
        setMarker(pos);
        updateAddress(pos);
    };

    const mapOptions = useMemo<google.maps.MapOptions>(
        () => ({
            disableDefaultUI: false,
            clickableIcons: false,
            zoomControl: true,
            fullscreenControl: false,
            mapTypeControl: false,
            streetViewControl: false,
        }),
        []
    );

    if (loadError) {
        return (
            <div className="h-[70vh] flex items-center justify-center">
                <p className="text-sm text-red-600">Failed to load the map.</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="h-[70vh] flex items-center justify-center">
                <p className="text-sm text-gray-500">Loading map…</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-3">
            <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div>
                        <h2 className="font-medium text-[16px]">Select property location</h2>
                        <p className="text-[12px] text-gray-500">
                            Drag the pin or search an address, then confirm.
                        </p>
                    </div>
                    {onClose && (
                        <Button onClick={onClose} className="text-sm text-[#3586FF] hover:underline px-2 py-1">
                            Close
                        </Button>
                    )}
                </div>

                {/* Search */}
                <div className="px-4 pt-3">
                    <Autocomplete
                        onLoad={(ac) => (acRef.current = ac)}
                        onPlaceChanged={onPlaceChanged}
                        options={{ componentRestrictions: { country: "in" } }}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search address, landmark, area…"
                            className="w-full border rounded-md px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </Autocomplete>
                </div>

                {/* Map */}
                <div className="h-[56vh] w-full mt-3">
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={15}
                        onLoad={onMapLoad}
                        options={mapOptions}
                        onClick={onClickMap}
                    >
                        <Marker
                            position={marker}
                            draggable
                            onDragEnd={onDragEnd}
                            // optional: nice drop animation on first render
                            animation={google.maps.Animation.DROP}
                        />
                    </GoogleMap>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-gray-500">
                            {isResolving
                                ? "Detecting address…"
                                : resolved
                                    ? <>
                                        <span className="font-medium text-gray-800">
                                            {resolved.locality ? `${resolved.locality}, ` : ""}
                                            {resolved.city}
                                        </span>
                                        {resolved.state ? <span className="text-gray-600">, {resolved.state}</span> : null}
                                    </>
                                    : "Pin a spot to detect the address."}
                        </p>
                    </div>

                    <Button
                        onClick={() => onLocationSelect(marker)}
                        className="bg-[#3586FF] hover:bg-[#3586FF] text-white font-medium px-4 py-2 rounded-md"
                    >
                        Confirm this location
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MapPicker;
