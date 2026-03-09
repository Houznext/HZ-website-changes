import Button from "@/common/Button";
import usePostPropertyStore, {
  propertyInitialState,
  PropertyStore,
} from "@/store/postproperty";
import BasicDetails from "./BasicDetails";
import LocationDetails from "./LocationDetails";
import PropertyDetails from "./PropertyDetails/PropertyDetails";
import UploadImage from "./UploadMedia";
import toast from "react-hot-toast";
import apiClient from "@/utils/apiClient";
import { useState } from "react";
import Loader from "../Loader";
import { BackArrow } from "./PropIcons";
import { useRouter } from "next/router";
import BackRoute from "../BackRoute";

const PropertyForm = ({
  isEdit,
  isView,
  user,
  handleDrawerClose,
  setProperties,
}: {
  isEdit?: boolean;
  isView?: boolean;
  user: any;
  handleDrawerClose?: any;
  setProperties?: any;
}) => {
  const property = usePostPropertyStore((state) => state.getProperty());
  const setProperty = usePostPropertyStore((state) => state.setProperty);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        postedByUserId: user.id,
        ...property,
        basicDetails: {
          ...property.basicDetails,
          name: "Test",
          phone: 0,
        },
      };
      const res = await apiClient.post(
        `${apiClient.URLS.property}/admin`,
        payload,
        true
      );
      setProperties((prev: any) => [res.body, ...prev]);
      setProperty(propertyInitialState);
      toast.success("Property saved successfully");
      setLoading(false);
      handleDrawerClose();
    } catch (error) {
      toast.error("Something went wrong");
      setLoading(false);
      console.log(error);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const payload = {
        postedByUserId: user.id,
        ...property,
        basicDetails: {
          ...property.basicDetails,
          name: "Test",
          phone: 0,
        },
      };
      const res = await apiClient.patch(
        `${apiClient.URLS.property}/admin/${property.propertyId}`,
        payload,
        true
      );
      setProperties((prev: any) => {
        return prev.map((item: any) => {
          if (item.propertyId === property.propertyId) {
            return res.body;
          }
          return item;
        });
      });
      setProperty(propertyInitialState);
      setLoading(false);
      toast.success("Your property updated successfully");
      handleDrawerClose();
    } catch (error) {
      toast.error("Something went wrong");
      setLoading(false);
      console.log(error);
    }
  };
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="w-full flex flex-col gap-6 pb-10 relative bg-slate-50/50 md:p-6 p-4">
      {isView && <div className="absolute inset-0 z-[55] bg-transparent"></div>}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="md:text-2xl text-xl font-semibold text-slate-800">
            {isEdit ? "Edit Property" : isView ? "Property Details" : "Add Property"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isEdit ? "Update your property information" : isView ? "View property information" : "Fill in the details below"}
          </p>
        </div>
        {isView && (
          <span className="px-3 py-1 text-xs font-medium bg-blue-50 text-[#3586FF] rounded-full border border-blue-100">
            View Mode
          </span>
        )}
      </div>

      {/* Basic Details */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#3586FF]/5 to-transparent px-5 py-3 border-b border-slate-100">
          <h2 className="text-[#3586FF] md:text-lg text-base font-semibold flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#3586FF] rounded-full"></span>
            Basic Details
          </h2>
        </div>
        <div className="p-5">
          <BasicDetails />
        </div>
      </div>

      {/* Location Details */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#3586FF]/5 to-transparent px-5 py-3 border-b border-slate-100">
          <h2 className="text-[#3586FF] md:text-lg text-base font-semibold flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#3586FF] rounded-full"></span>
            Location Details
          </h2>
        </div>
        <div className="p-5">
          <LocationDetails />
        </div>
      </div>

      {/* Property Details */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#3586FF]/5 to-transparent px-5 py-3 border-b border-slate-100">
          <h2 className="text-[#3586FF] md:text-lg text-base font-semibold flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#3586FF] rounded-full"></span>
            Property Details
          </h2>
        </div>
        <div className="p-5">
          <PropertyDetails />
        </div>
      </div>

      {/* Videos & Photos Details */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#3586FF]/5 to-transparent px-5 py-3 border-b border-slate-100">
          <h2 className="text-[#3586FF] md:text-lg text-base font-semibold flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#3586FF] rounded-full"></span>
            Photos & Media
          </h2>
        </div>
        <div className="p-5">
          <UploadImage />
        </div>
      </div>

      {/* Action Buttons */}
      {!isView && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Button
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            onClick={() => {
              handleDrawerClose();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={isEdit ? handleUpdate : handleSubmit}
            className="px-8 py-2.5 rounded-lg text-sm font-medium text-white bg-[#3586FF] hover:bg-[#2d75e6] transition-colors shadow-sm"
          >
            {isEdit ? "Update Property" : "Save Property"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PropertyForm;
