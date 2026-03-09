import React from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import Loader from "@/components/Loader";

interface MapViewProps {
  lat: number;
  lng: number;
}

const containerStyle = {
  width: "90%",
  height: "300px",
};

const MapView = ({ lat, lng }: MapViewProps) => {
  const { isLoaded } = useLoadScript({
    id: "google-map-script",
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
  });

  if (!isLoaded) {
    return <div>
      <Loader />
    </div>;
  }

  return (
    <div className="">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat, lng }}
        zoom={15}
      >
        <Marker position={{ lat, lng }} />
      </GoogleMap>
    </div>
  );
};

export default MapView;
