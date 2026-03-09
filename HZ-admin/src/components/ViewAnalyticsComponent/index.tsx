import Loader from "../SpinLoader";
import usePostPropertyStore, { PropertyStore } from "@/src/stores/postproperty";
import Image from "next/image";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import apiClient from "@/src/utils/apiClient";
import Button from "@/src/common/Button";
import { usePathname } from "next/navigation";
import { LuDownload } from "react-icons/lu";
import { CSVLink } from "react-csv";
import { FaChartBar } from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";

import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

import ImageSlider from "../ViewAnalyticsComponent/ImageSlider";
import {
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
  Menu,
} from "@mui/material";
import { number } from "yup";

export enum PurposeType {
  Residential = "Residential",
  Commercial = "Commercial",
}
export const enum ConstructionStatusEnum {
  UnderConstruction = "Under Construction",
  ReadyToMove = "Ready To Move",
  NewLaunched = "Newly Launched",
}

export enum propertyTypeEnum {
  Apartment = "Apartment",
  IndependentFloor = "Independent Floor",
  IndependentHouse = "Independent House",
  Villa = "Villa",
  Plot = "Plot",
  AgriculturalLand = "Agricultural Land",
}

export enum LookingType {
  Rent = "Rent",
  Sell = "Sell",
  PGorColiving = "PG/Co-living",
  FlatShare = "Flat Share",
}
interface AnalyticsItem {
  eventName: string;
  propertyname: string;
  BHK: string;
  location: string;
  city: string;
  username: string;
  customuserid: string;
  phone: string;
  itemId: string;
  usercity: string;
  userEngagementDuration: number;

  eventCount: number;
}
interface Impressionprops {
  eventName: string;
  propertyname: string;
  itemId: string;
  location: string;
  city: string;
  eventCount: number;
}

export default function ViewAnalyticsComponent() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsItem[]>([]);
  const [selectedAnalytics, setSelectedAnalytics] = useState<
    AnalyticsItem[] | undefined
  >(undefined);
  const [property, setProperty] = useState<PropertyStore>();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [propertyid, setPropertyid] = useState<string | null>(null);
  const [Impression, setImpression] = useState<Impressionprops[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/view_property");
      const data = await response.json();
      setAnalyticsData(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const propertyid = router.query.id;
    if (propertyid) {
      setPropertyid(propertyid as string);
    }
  }, [router.isReady]);

  const fetchProperty = useCallback(async (propertyid: string) => {
    if (!propertyid) return;
    setLoading(true);
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.property}/${propertyid}`
      );
      setProperty(response.body);
    } catch (error) {
      console.error("Error fetching property:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (propertyid) {
      fetchProperty(propertyid);
    }
  }, [propertyid, fetchProperty]);
  useEffect(() => {
    const fetchimpression = async () => {
      const impressionres = await fetch("/api/Property_Impression");
      const impressiondata = await impressionres.json();
      setImpression(impressiondata);
    };
    fetchimpression();
  }, []);
  const getEventCount = (propertyid:any) => {
    const impressionProperty = Impression.filter(
      (property) => (property.itemId) === propertyid
    );

    const totalEventCount = impressionProperty.reduce(
      (acc, curr) => acc + Number(curr.eventCount || 0),
      0
    );

    return totalEventCount;
  };

  const getLabel = useCallback((key: string) => {
    const keyValues: { [key: string]: string } = {
      balcony: "Balcony",
      bathrooms: "Bathrooms",
      bathroom: "Bathrooms",
      bedrooms: "Bedrooms",
      floorArea: "Floor Area",
      parking2w: "2 Wheeler Parking",
      parking4w: "4 Wheeler Parking",
      totalFloors: "Total Floors",
      currentFloor: "Current Floor",
      facing: "Facing",

      // ✅ flatshare labels
      lookingFor: "Looking For",
      occupancy: "Occupancy",
      waterAvailability: "Water Availability",

      // ... keep your rest unchanged
      plotArea: "Plot Area",
      length: "Length",
      width: "Width",
      widthFacingRoad: "Width Facing Road",
      possessionStatus: "Possession Status",
      possessionDate: "Possession Date",
      transactionType: "Transaction Type",
      boundaryWall: "Boundary Wall",
      noOfFloorsAllowed: "No of Floors Allowed",
      suitableFor: "Suitable For",
      ownership: "Ownership",
      locationHub: "Location Hub",
      builtUpArea: "Built Up Area Sqft",
      twoWheelerParking: "2 Wheeler Parking",
      fourWheelerParking: "4 Wheeler Parking",
      staircases: "Staircases",
      passengerLifts: "Passenger Lifts",
      entranceAreaWidth: "Entrance Area Width",
      entranceAreaHeight: "Entrance Area Height",
      purpose: "Purpose",
      lookingType: "Looking For",
      ownerType: "Posted by",
      email: "Email",
      phone: "Phone",
      name: "Name",
      address: "Address",
      city: "City",
      state: "State",
      pinCode: "Pin Code",
      numberOfWashrooms: "Number of Washrooms",
      numberOfMeetingRooms: "Number of Meeting Rooms",
      numberOfCabins: "Number of Cabins",
      minSeats: "Min Seats",
      isNegotiable: "Negotiable",
      advanceAmount: "Advance Amount",
      securityDeposit: "Security Deposit",
      monthlyRent: "Monthly Rent",
      maxPriceOffer: "Max Price Offer",
      minPriceOffer: "Min Price Offer",
      maintenanceCharges: "Maintenance Charges",
      pricePerSqft: "Price Per Sqft",
      expectedPrice: "Expected Price",
      status: "Construction Status",
      propertyType: "Property Type",
      bhk: "BHK",
      buildupArea: "Buildup Area",
      furnitureType: "Furniture Type",
      flatFurnishings: "Flat Furnishings",
      ageOfProperty: "Age of Property",
      possessionBy: "Possession By",
      possessionYears: "Possession Years",
      constructionStatus: "Construction Status",
    };

    return keyValues[key];
  }, []);

  // if (loading) {
  //   return <Loader />;
  // }

  if (!property) {
    return null;
  }

  const filteredData = analyticsData.filter(
    (item) => item.itemId === propertyid
  );

  const result = filteredData.reduce((acc, curr) => {
    const existing = acc.find(
      (item) =>
        item.itemId === curr.itemId && item.customuserid === curr.customuserid
    );

    if (existing) {
      existing.eventCount =
        Number(existing.eventCount) + Number(curr.eventCount);
      existing.userEngagementDuration =
        Number(existing.userEngagementDuration) +
        Number(curr.userEngagementDuration);
    } else {
      acc.push({ ...curr });
    }

    return acc;
  }, [] as AnalyticsItem[]);

  const groupedData = filteredData.reduce((acc, curr) => {
    const key = `${curr.propertyname}-${curr.usercity}`;
    if (!acc[key]) {
      acc[key] = {
        eventCount: 0,
        propertyname: curr.propertyname,
        userCity: curr.usercity,
      };
    }
    acc[key].eventCount += curr.eventCount;
    return acc;
  }, {} as { [key: string]: any });

  const chartData = {
    labels: Object.keys(groupedData).map((key) => {
      const [propertyName, userCity] = key.split("-");
      return `${propertyName} - ${userCity}`;
    }),
    datasets: [
      {
        label: "Views ",
        data: Object.values(groupedData).map((data) => data.eventCount),
        backgroundColor: "#383b86",
        borderColor: "#6dcd60",
        borderWidth: 1,
      },
    ],
  };
  const userEventData = filteredData.reduce<Map<string, number>>(
    (acc, curr) => {
      const currentCount = acc.get(curr.customuserid) || 0;
      acc.set(curr.customuserid, currentCount + Number(curr.eventCount));
      return acc;
    },
    new Map()
  );

  const userChartData = {
    labels: Array.from(userEventData.keys()),
    datasets: [
      {
        label: "Views By User",
        data: Array.from(userEventData.values()),
        backgroundColor: ["#4BC0C099", "#FF6363", "#36C2CF", "#3F72AF"],
        hoverBackgroundColor: ["#4BC0C099", "#FF6363", "#36C2CF", "#3F72AF"],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const userchartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: "Views by User",
      },
    },
  };
  const uniqueResults = Array.from(
    new Set(result.map((item) => item.itemId))
  ).map((id) => {
    return result.find((item) => item.itemId === id);
  });

  const itemPerPage = 10;

  const totalPages = Math.ceil(result.length / itemPerPage);
  const isResidential =
    property.basicDetails?.purpose === PurposeType.Residential;
    const isFlatShare =
    (property.basicDetails?.lookingType || "")
      .toLowerCase()
      .replace(/\s/g, "") === "flatshare";
    const bhkValue = isFlatShare
    ? property.propertyDetails?.flatshareAttributes?.bhk
    : property.propertyDetails?.residentialAttributes?.bhk;

  const paginatedData = result.slice(
    (currentPage - 1) * itemPerPage,
    currentPage * itemPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const headers = [
    { label: "User Id", key: "customuserid" },
    { label: "Username", key: "username" },
    { label: "Phone", key: "phone" },
    { label: "User City", key: "usercity" },
    { label: "User Duration", key: "userEngagementDuration" },
    { label: "Views", key: "eventCount" },
  ];
  const formatValue = (value: any) => {
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return value.join(", ");
    if (value instanceof Date) return new Date(value).toLocaleDateString();
    if (
      typeof value === "object" &&
      value !== null &&
      "size" in value &&
      "unit" in value
    ) {
      return `${value.size} ${value.unit}`;
    }
    return String(value);
  };
  return (
    <>
     <div className=" w-full md:px-[24px] px-[12px] md:py-10 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <Button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 w-fit rounded-full px-3 py-2 transition-all hover:bg-white hover:shadow-sm active:scale-[0.99]"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">
              <MdArrowBack />
            </span>
            <p className="md:text-[16px] text-[12px] font-medium text-[#3586FF]">
              Back
            </p>
          </Button>
        </div>

        <div className="flex gap-[32px] flex-col ">
          <div className="w-full border border-gray-200 md:rounded-[10px] rounded-[4px] p-4 md:p-8 bg-white shadow-custom hover:shadow-xl transition-all duration-500 md:space-y-4 space-y-2">
            <div className="flex flex-row justify-between items-start md:items-center md:gap-4 gap-2">
              <div className="flex flex-col gap-2">
                <h1 className="md:text-[18px] text-[16px] font-bold text-gray-800 hover:text-[#3586FF] transition-colors duration-300">
                  {property.propertyDetails?.propertyName}
                </h1>
                {property.propertyDetails?.constructionStatus?.status ===
                  ConstructionStatusEnum.NewLaunched && (
                    <span className="inline-block text-white bg-[#3586FF] py-1.5 px-4 rounded-full md:text-[14px] text-[10px] font-medium shadow hover:shadow-lg transition-all duration-300">
                      New Launch
                    </span>
                  )}
                <p className=" md:text-[12px] text-[10px] leading-relaxed font-medium text-gray-400">
                    {isResidential &&
                            `${bhkValue ? `${bhkValue} ` : ""}${
                              property.propertyDetails?.propertyType ?? ""
                            } For ${property.basicDetails?.lookingType} in `}
                  {property.locationDetails?.locality},{" "}
                  {property.locationDetails?.city}
                </p>
              </div>
              <h2 className="md:text-[16px] text-[12px] font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-wide drop-shadow-sm hover:from-blue-600 hover:to-blue-800 transition-all duration-500">
                {property.basicDetails?.lookingType ===
                                         LookingType.Rent ||
                                       property.basicDetails?.lookingType ===
                                         LookingType.FlatShare
                                         ? `₹${property.propertyDetails?.pricingDetails?.monthlyRent}/Month`
                                         : `₹${property.propertyDetails?.pricingDetails?.expectedPrice}`}
              </h2>
            </div>

            <div className="w-full flex flex-col lg:flex-row md:gap-8 gap-4 items-center">
              <div className="md:w-[400px]  w-full flex-shrink-0 flex flex-col h-full">
                <div className="relative flex-1 overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-500 md:min-h-[300px] min-h-[100px]">
                  <ImageSlider
                    images={property?.mediaDetails?.propertyImages || []}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none rounded-3xl"></div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-4  w-full h-full">

                <div className="mt-6 md:p-6 p-3 w-full bg-blue-50 rounded-xl border-l-4 border-[#3586FF] shadow-sm hover:shadow-md transition-all duration-500 flex-1 overflow-y-auto md:max-h-[400px] max-h-[350px]">
                  <h3 className="md:text-[20px] text-[16px] font-bold text-gray-900 md:mb-4 mb-2 hover:text-[#3586FF] transition-colors duration-300">
                    Property Overview
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 md:gap-4 gap-2">
                    {property.basicDetails?.purpose ===
                      PurposeType.Residential ? (
                      <>
                        {property.basicDetails.lookingType ===
                          LookingType.Sell &&
                          (property.propertyDetails?.propertyType ===
                            propertyTypeEnum.Plot ||
                            property.propertyDetails?.propertyType ===
                            propertyTypeEnum.AgriculturalLand)
                          ? Object.entries(
                            property.propertyDetails?.plotAttributes || {}
                          ).map(([key, value]) => {
                            if (
                              key === "id" ||
                              value === null ||
                              value === undefined
                            )
                              return;
                            return (
                              <div
                                key={key}
                                className="md:p-2 p-2 rounded-xl bg-white border-l-4 border-[#3586FF] shadow hover:shadow-md transition-all duration-300 group"
                              >
                                <p className="text-[#3586FF] font-medium md:text-sm text-[12px] leading-[17.1px] mb-1">
                                  {getLabel(key)}
                                </p>
                                <p className="text-sm font-regular leading-[17.1px]">
                                  {typeof value === "boolean"
                                    ? value === true
                                      ? "Yes"
                                      : "No"
                                    : value}
                                </p>
                              </div>
                            );
                          })
                          : property.basicDetails.lookingType ===
                                                            LookingType.FlatShare ||
                                                          property?.basicDetails?.lookingType ===
                                                            "Flat Share"
                                                        ? Object.entries(
                                                            property?.propertyDetails
                                                              ?.flatshareAttributes || {},
                                                          ).map(([key, value]) => {
                                                            if (
                                                              key === "id" ||
                                                              value === null ||
                                                              value === undefined
                                                            )
                                                              return null;
                          
                                                            return (
                                                            <div
                                key={key}
                                className="md:p-2 p-2 rounded-xl bg-white border-l-4 border-[#3586FF] shadow hover:shadow-md transition-all duration-300 group"
                              >
                                <p className="text-[#3586FF] font-medium md:text-sm text-[12px] leading-[17.1px] mb-1">
                                  {getLabel(key)}
                                </p>
                                <p className="md:text-sm text-[12px] font-regular leading-[17.1px]">
                                  {formatValue(value)}
                                </p>
                              </div>
                                                            );
                                                          })
                          : Object.entries(
                            property.propertyDetails?.residentialAttributes ||
                            {}
                          ).map(([key, value]) => {
                            if (
                              key === "id" ||
                              value === null ||
                              value === undefined
                            )
                              return;
                            return (
                              <div
                                key={key}
                                className="md:p-2 p-2 rounded-xl bg-white border-l-4 border-[#3586FF] shadow hover:shadow-md transition-all duration-300 group"
                              >
                                <p className="text-[#3586FF] font-medium md:text-sm text-[12px] leading-[17.1px] mb-1">
                                  {getLabel(key)}
                                </p>
                                <p className="md:text-sm text-[12px] font-regular leading-[17.1px]">
                                  {formatValue(value)}
                                </p>
                              </div>
                            );
                          })}
                      </>
                    ) : (
                      <>
                        {Object.entries(
                          property.propertyDetails?.commercialAttributes || {}
                        ).map(([key, value]) => {
                          if (
                            key === "id" ||
                            value === null ||
                            value === undefined
                          )
                            return;
                          return (
                            <div
                              key={key}
                              className="md:p-4 p-2 rounded-xl bg-white border-l-4 border-[#3586FF] shadow hover:shadow-md transition-all duration-300 group"
                            >
                              <p className="text-[#3586FF] font-medium md:text-sm text-[12px]leading-[17.1px] mb-1">
                                {getLabel(key)}
                              </p>

                              <p className="md:text-sm text-[12px] font-regular leading-[17.1px]">
                                {typeof value === "boolean"
                                  ? value === true
                                    ? "Yes"
                                    : "No"
                                  : value}
                              </p>
                            </div>
                          );
                        })}
                      </>
                    )}
                    {Object.entries(
                      property.propertyDetails?.pricingDetails || {}
                    ).map(([key, value]) => {
                      if (key === "id" || value === null || value === undefined)
                        return;
                      if (
                        key === "monthlyRent" ||
                        key === "expectedPrice" ||
                        key === "minPriceOffer" ||
                        key === "maxPriceOffer"
                      )
                        return;
                      return (
                        <div
                          key={key}
                          className="md:p-4 p-2 rounded-xl bg-white border-l-4 border-[#3586FF] shadow hover:shadow-md transition-all duration-300 group"
                        >
                          <p className="text-[#3586FF]  font-medium md:text-sm text-[12px] leading-[17.1px] mb-1">
                            {getLabel(key)}
                          </p>
                          <p className="md:text-sm text-[12px]  font-regular leading-[17.1px]">
                            {typeof value === "boolean"
                              ? value === true
                                ? "Yes"
                                : "No"
                              : value}
                          </p>
                        </div>
                      );
                    })}

                    {Object.entries(
                      property.propertyDetails?.constructionStatus || {}
                    ).map(([key, value]) => {
                      if (key === "id" || value === null || value === undefined)
                        return;
                      return (
                        <div
                          key={key}
                          className="md:p-4 p-2 rounded-xl bg-white border-l-4 border-[#3586FF] shadow hover:shadow-md transition-all duration-300 group"
                        >
                          <p className="text-[#3586FF] md:text-sm text-[12px] font-medium leading-[17.1px] mb-1">
                            {getLabel(key)}
                          </p>
                          <p className="md:text-sm text-[12px] font-regular leading-[17.1px]">
                            {typeof value === "boolean"
                              ? value === true
                                ? "Yes"
                                : "No"
                              : value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {result.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-6 mx-auto mt-10 px-4 lg:px-8">
            {/* Bar Chart Card */}
            <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 md:p-6 p-3 flex flex-col items-center">
              <h3 className="md:text-[14px] text-[12px] font-bold text-gray-900 mb-4">
                Views by Property and User City
              </h3>
              <div className="w-full h-[250px] sm:h-[200px] md:h-[250px] overflow-auto">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "bottom" },
                    },
                  }}
                />
              </div>
            </div>

            {/* Pie Chart Card */}
            <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 md:p-6 p-3 flex flex-col items-center">
              <h3 className="md:text-[14px] text-[12px] font-bold text-gray-900 mb-4">
                User Distribution
              </h3>
              <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] overflow-auto">
                <Pie data={userChartData} options={userchartOptions} />
              </div>
            </div>
          </div>
        )}

        <div className="mt-[60px] lg:max-w-[70%] w-full  bg-white md:rounded-lg rounded-[6px] shadow-custom p-6 md:p-4">
          {result.length > 0 ? (
            <>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex flex-col gap-2">
                  <h2 className="font-bold md:text-[16px] text-[14px] text-gray-900">
                    Analytics for {result[0]?.propertyname}
                  </h2>

                  {uniqueResults.length > 0
                    ? uniqueResults.map((item) => (
                      <div className="flex flex-col justify-center md:gap-[5px] gap-[3px] w-full">
                        <div>
                          <strong className="font-medium md:text-[16px] text-[12px] text-[#000000]">
                            Name:{" "}
                          </strong>
                          <span className="font-regular md:text-[16px] text-[12px] text-gray-600">
                            {item?.propertyname}
                          </span>
                        </div>
                        <div>
                          <strong className="font-medium md:text-[16px] text-[12px] text-[#000000]">
                            City:
                          </strong>{" "}
                          <span className="font-regular md:text-[16px] text-[12px] text-gray-600">
                            {item?.city}
                          </span>
                        </div>
                        <div>
                          <strong className="font-medium md:text-[16px] text-[12px] text-[#000000]">
                            Location:
                          </strong>{" "}
                          <span className="font-regular md:text-[16px] text-[12px] text-gray-600">
                            {item?.location}
                          </span>
                        </div>
                      </div>
                    ))
                    : ""}
                </div>


                <div className="mt-4 md:mt-0">
                  <CSVLink
                    data={result}
                    headers={headers}
                    filename={`Analytics_${result[0]?.propertyname || "Default"
                      }.csv`}
                  >
                    <Button className="md:px-6  px-3 md:py-1 py-1 bg-[#3586FF] btn-txt text-white rounded-[6px] flex items-center gap-2">
                      <LuDownload className="text-white md:text-[12px] text-[10px]" />
                      Download
                    </Button>
                  </CSVLink>
                </div>
              </div>


              <TableContainer
                component={Paper}
                className="rounded-xl overflow-x-auto"
              >
                <Table>
                  <TableHead>
                    <TableRow className="bg-gray-100">
                      {[
                        "User Id",
                        "Username",
                        "Phone",
                        "User City",
                        "User Duration",
                        "Views",
                      ].map((header, idx) => (
                        <TableCell
                          key={idx}
                          className="font-bold text-center text-[16px] md:text-[18px] py-3 px-2"
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.map((item, index) => (
                      <TableRow
                        key={index}
                        className="hover:bg-gray-50 transition-colors duration-300"
                      >
                        <TableCell className="font-medium text-gray-600 md:text-[16px] text-[12px] text-center">
                          {item.customuserid}
                        </TableCell>
                        <TableCell className="font-medium text-gray-600 md:text-[16px] text-[12px] text-center">
                          {item.username}
                        </TableCell>
                        <TableCell className="font-medium text-gray-600 md:text-[16px] text-[12px] text-center">
                          {item.phone}
                        </TableCell>
                        <TableCell className="font-medium text-gray-600 md:text-[16px] text-[12px] text-center">
                          {item.usercity}
                        </TableCell>
                        <TableCell className="font-medium text-gray-600 md:text-[16px] text-[12px] text-center">
                          {item.userEngagementDuration} Sec
                        </TableCell>
                        <TableCell className="font-medium text-gray-600 md:text-[16px] text-[12px] text-center">
                          {item.eventCount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {result.length > 10 && (
                <div className="flex items-center justify-center mx-auto">
                  <div className="mt-4 flex md:gap-4 gap-2 items-center">
                    <Button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-300 text-white rounded-[6px] disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    <span>
                      {currentPage} of {totalPages}
                    </span>
                    <Button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-[#3586FF] text-white rounded-[6px] disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center mx-auto ">
              <h1 className="font-medium md:text-[16px] text-[12px]">
                No analytics data available for this property.
              </h1>
            </div>
          )}
        </div>

        <div className="mt-6 md:p-5 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-[8px]  shadow-md border border-blue-200 md:w-[50%] w-[80%] flex items-center gap-2 mb-2 md:mb-0">
          <div className="flex items-center gap-x-3">
            <div className="p-2 bg-[#3586FF] text-white rounded-full">
              <FaChartBar className="md:w-6 w-3 md:h-6 h-3" />
            </div>
            <p className="md:text-[24px] text-[18px] font-medium text-gray-700">
              {" "}
              Impressions :
            </p>
          </div>
          <p className="md:text-[24px] text-[16px] font-medium text-[#3586FF] mt-2">
            {getEventCount((propertyid))}
          </p>
        </div>
      </div>
    </>
  );
}
