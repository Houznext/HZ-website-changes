import { useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import Image from "next/image";
import Loader from "../Loader";
import { useRouter } from "next/router";
import usePostPropertyStore, {
  propertyInitialState,
  PropertyStore,
} from "@/store/postproperty";
import { generateSlug } from "@/utils/helpers";
import { CiLocationOn } from "react-icons/ci";
import { BiRupee } from "react-icons/bi";
import { MdOutlineApartment } from "react-icons/md";
import {
  ConstructionStatusEnum,
  LookingType,
  PurposeType,
} from "../Property/PropertyDetails/PropertyHelpers";
import Button from "@/common/Button";
import { getLookingTypePath } from "@/components/Property/PropertyDetails/PropertyHelpers";

export interface IPropertyDetails {
  propertyType: string;
  propertyName: string;
  description: string;
}
export interface Propertyprops {
  propertyId: number | null;

  propertyDetails: IPropertyDetails | null;
}

const RecentPropertiesView = () => {
  const [properties, setProperties] = useState<PropertyStore[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProperties = async () => {
    const storedProperties = JSON.parse(
      localStorage.getItem("viewed_properties") || "[]"
    );

    if (storedProperties.length === 0) {
      setLoading(false);
      return;
    }

    const propertyNames = storedProperties.map((p: any) => p.name);

    try {
      setLoading(true);

      const response = await apiClient.get(
        `${apiClient.URLS.property}/get-all-properties`
      );

      if (!response.body || !response.body.data) {
        console.error("Invalid API response:", response);
        toast.error("Failed to fetch properties");
        return;
      }

      const filteredProperties = response.body.data.filter((property: any) =>
        propertyNames.includes(property.propertyDetails.propertyName)
      );

      setProperties(filteredProperties);
    } catch (error) {
      console.error("Error fetching properties", error);
      toast.error("Error fetching properties");
    } finally {
      setLoading(false);
    }
  };
  const setProperty = usePostPropertyStore((state) => state.setProperty);

  useEffect(() => {
    fetchProperties();
  }, []);

  if (loading) return <Loader />;

  return (
    <>
      <div className="flex flex-col items-center mx-auto p-8 gap-10">
        <h1 className="font-bold text-[24px]">Viewed Properties</h1>

        <div className="grid md:grid-cols-4 grid-cols-2 gap-2 p-4">
          {properties.map((newProperty, index) => {
            return (
              <div
                className="p-2 md:p-4  border shadow-md border-[#DBDBDB] rounded-md"
                key={newProperty.propertyId}
              >
                <div className="md:h-[147px] h-[75px] w-full relative md:mb-4 mb-2 overflow-hidden">
                  <Image
                    src={
                      newProperty.mediaDetails?.propertyImages[0] ||
                      "/orders/no-orders.jpeg"
                    }
                    alt={newProperty.propertyDetails?.propertyName ?? ""}
                    layout="fill"
                    className="object-cover md:rounded-[10px] rounded-[4px]"
                    sizes="(max-width: 640px) 130px, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 30vw"
                  />
                  <p className=" absolute top-1 left-1  bg-[#3586FF] text-white md:text-[12px] text-[10px] px-4 md:py-[4px] py-[4px] rounded-md font-medium">
                    {newProperty?.basicDetails?.lookingType}
                  </p>
                </div>
                <h3 className="font-medium md:text-[14px] text-[12px] md:leading-[18.5px] leading-[14.8px] text-gray-700 md:text-nowrap text-wrap">
                  {newProperty?.propertyDetails?.propertyName}
                </h3>

                <div className="flex items-center gap-1">
                  <CiLocationOn className="md:text-[12px] text-[10px] text-gray-700" />{" "}
                  <p className="text-gray-500 md:text-[14px] text-[10px] text-nowrap">
                    {newProperty?.locationDetails?.locality},{" "}
                    {newProperty?.locationDetails?.city}
                  </p>
                </div>
                <div className="border border-[#E9E9E9] md:my-2 my-1"></div>
                <div className="grid  grid-cols-1 xl:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 md:gap-y-4 gap-y-1 lg:gap-x-4 md:gap-x-3 gap-x-1">
                  <div className="flex items-center justify-start gap-1.5 md:gap-2.5 lg:gap-0.5  ">
                    <BiRupee className=" md:text-[12px] text-[10px]" />
                    <span className="text-[#3586FF] text-nowrap md:text-[12px] text-[10px]">
                      {newProperty.basicDetails?.lookingType ===
                        LookingType.Rent
                        ? `${newProperty.propertyDetails?.pricingDetails?.monthlyRent?.toLocaleString()}/month`
                        : `${newProperty.propertyDetails?.pricingDetails?.expectedPrice?.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-start gap-1.5 md:gap-2.5 lg:gap-1.5">
                    <MdOutlineApartment className=" md:text-[12px] text-[10px]" />
                    <span className="text-[#3586FF] md:text-[12px]  text-[10px] md:text-nowrap text-wrap">
                      {newProperty?.propertyDetails?.propertyType}
                    </span>
                  </div>
                </div>
                <Button
                  className="block w-full rounded-md text-center md:py-1 md:text-[14px] text-[12px] py-[2px] bg-[#3586FF] font-medium md:leading-[22.8px] leading-[18.52px] text-white md:mt-3 mt-2"
                  onClick={() => {
                    const slug = generateSlug(
                      newProperty.propertyDetails?.propertyName!
                    );

                    const lookingTypePath = getLookingTypePath(
                      newProperty?.basicDetails?.lookingType
                    );
                    router.push(
                      `/properties/${lookingTypePath}/${newProperty?.locationDetails?.city}/details/${slug}?id=${newProperty.propertyId}&type=property`
                    );
                  }}
                >
                  View Property
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default RecentPropertiesView;
