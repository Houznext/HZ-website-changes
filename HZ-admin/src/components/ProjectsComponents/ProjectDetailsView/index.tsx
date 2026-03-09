import React, { useState, useEffect } from "react";

import apiClient from "@/src/utils/apiClient";
import { useRouter } from "next/router";
import Loader from "@/src/common/Loader";
import toast from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";
import { iconMap } from "@/src/components/Property/PropertyDetails/PropertyHelpers";
import { ProjectDetails } from "@/src/stores/companyproperty";

import { MdInfoOutline, MdQuestionAnswer } from "react-icons/md";
import { GoLocation } from "react-icons/go";
import { FaHome } from "react-icons/fa";
import { FaHardHat } from "react-icons/fa";
import { MapPin } from "lucide-react";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { BookOpen } from "lucide-react";
import Image from "next/image";

export default function ProjectDetailsView() {
  const [projectData, setProjectData] = useState<ProjectDetails | null>(null);

  const [projectid, setProjectid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  useEffect(() => {
    const projectid = router.query.id;
    if (projectid) {
      setProjectid(projectid as string);
      fetchProjects(projectid as string);
    }
  }, [router.isReady]);
  const fetchProjects = async (projectid: string) => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.company_Onboarding}/projects/${projectid}`
      );
      if (response?.status === 200) {
        setProjectData(response?.body);
        toast.success("Projects Data fetched successfully");
        setLoading(false);
      }
    } catch (error) {
      console.log("error", error);
      toast.error("Error occured in projects fetching");
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="w-full ">
        <Loader />
      </div>
    );

  return (
    <>
      <div className="p-4 w-full flex flex-col gap-2">
        <div
          className="flex flex-row items-center md:mb-[20px] mb-[10px] mt-[10px] md:mt-[0px]"
          onClick={() => router.back()}
        >
          <FiArrowLeft />
          <p className="text-[16px] font-medium">Back</p>
        </div>
        {projectData && (
          <div className="flex flex-col md:gap-4 gap-2 md:px-6 px-4">
            <h1 className="font-medium text-[#3586FF]  md:text-[18px] text-[14px] flex items-center md:gap-2 gap-1">
              <MdInfoOutline className="w-4 h-4 text-[#3586FF]  md:w-5 md:h-5" />
              Project Basic Details
            </h1>
            <div className="grid md:grid-cols-4 grid-cols-2 md:gap-8 gap-3 justify-between w-full md:px-8 px-4 md:py-8 py-4  shadow-custom bg-white md:rounded-[10px] rounded-[4px]">
              {Object.entries(projectData ?? {}).map(([key, value]) => {
                const lowerKey = key.toLowerCase();

                if (
                  lowerKey === "id" ||
                  value === null ||
                  value === undefined ||
                  key === "updatedBy" ||
                  key === "approvedBy" ||
                  key === "mediaDetails" ||
                  key === "AboutProject" ||
                  key === "Specifications" ||
                  key === "Highlights" ||
                  key === "faqs" ||
                  key === "Brochure" ||
                  key === "propertyType" ||
                  key === "constructionStatus" ||
                  key === "company" ||
                  key === "location" ||
                  key === "Description"
                )
                  return null;

                const formattedKey = key
                  .replace(/_/g, " ")
                  .replace(/([A-Z])/g, " $1")
                  .toLowerCase()
                  .replace(/^\w/, (c) => c.toUpperCase());

                return (
                  <div key={key} className="flex flex-col col-span-1">
                    <div className="flex items-center md:gap-2 gap-1">
                      {iconMap[key] && (
                        <span className="text-[#3586FF] ">
                          {React.cloneElement(iconMap[key], {
                            className: "md:w-6 md:h-6 w-3 h-3",
                          })}
                        </span>
                      )}
                      <p className="font-medium md:text-[16px] text-[12px] text-gray-600 break-words">
                        {formattedKey}
                      </p>
                    </div>

                    <div className="font-medium md:text-[16px] text-[12px] text-gray-900 break-words">
                      {Array.isArray(value)
                        ? value.join(",")
                        : typeof value === "object" && value !== null
                        ? `${value.size} ${value.unit}`
                        : value}
                    </div>
                  </div>
                );
              })}
            </div>
            <div>
              {projectData?.location && (
                <div>
                  <h3 className="font-medium text-[#3586FF]  sub-heading mb-2 md:mb-4 flex items-center md:gap-2 gap-1">
                    <MapPin className="w-4 h-4 text-[#3586FF]  md:w-5 md:h-5" />
                    Location Details
                  </h3>
                  <RenderKeyValueObject data={projectData.location} />
                </div>
              )}
            </div>
            <div>
              {projectData?.propertyType && (
                <div>
                  <h3 className="font-medium text-[#3586FF]  md:text-[18px] text-[14px] mb-2 md:mb-4 flex items-center md:gap-2 gap-1">
                    <FaHome className="w-4 h-4 text-[#3586FF]  md:w-5 md:h-5" />
                    Property Type
                  </h3>
                  <RenderKeyValueObject data={projectData.propertyType} />
                </div>
              )}
            </div>
            <div>
              {projectData?.constructionStatus && (
                <div>
                  <h3 className="font-medium text-[#3586FF]  md:text-[18px] text-[14px] md:mb-4 mb-2 flex items-center md:gap-2 gap-1">
                    <FaHardHat className="md:text-[14px] text-[10px]" />
                    Construction Status :
                  </h3>
                  <RenderKeyValueObject data={projectData.constructionStatus} />
                </div>
              )}
            </div>
            <div>
              <h1 className="font-medium text-[#3586FF]  md:text-[18px] text-[14px] mb-2 flex items-center md:gap-2 gap-1 md:mb-4">
                <MdQuestionAnswer className="w-4 h-4 text-[#3586FF]  md:w-5 md:h-5" />
                Faqs :
              </h1>
              <div className="flex flex-col md:gap-4 gap-2 justify-between w-full md:px-8 px-4 md:py-8 py-4  shadow-custom bg-white md:rounded-[10px] rounded-[4px]">
                {projectData?.faqs?.length>0 ? (projectData?.faqs?.map((faq, index) => (
                  <div className="flex flex-col md:gap-3 gap-1">
                    <h3 className="font-medium  md:text-[16px] text-[12px] flex items-center md:gap-2 gap-1">
                      <AiOutlineQuestionCircle className="text-[#3586FF]  md:text-[16px] text-[12px]" />
                      {faq.question} ?
                    </h3>
                    <p className="text-gray-700 font-regular  md:text-[14px] text-[10px] flex items-center md:gap-2 gap-1">
                      <MdQuestionAnswer className="text-[#3586FF]  md:text-[14px] text-[10px]" />
                      {faq.answer}
                    </p>
                  </div>
                ))):<h1 className="text-center md:text-[16px] text-[10px] font-medium">No Faqs Found</h1>}
              </div>
            </div>
            <div className="md:space-y-2 space-y-1">
              <h3 className="font-medium text-[#3586FF]  md:text-[18px] text-[14px] mb-2  flex items-center md:gap-2 gap-1">
                <BookOpen className="w-4 h-4 text-[#3586FF]   md:w-5 md:h-5" />
                Additional Details :
              </h3>
              <div className="grid md:grid-cols-1 grid-cols-1 md:gap-4 gap-2 justify-between w-full md:px-8 px-4 md:py-8 py-4  shadow-custom bg-white md:rounded-[10px] rounded-[4px]">
                <div className="flex flex-col md:gap-2 gap-1">
                  <div className="flex items-center md:gap-2 gap-1 ">
                    <span className="text-[#3586FF] ">
                      {React.cloneElement(iconMap["AboutProject"], {
                        className: "md:w-6 md:h-6 w-3 h-3",
                      })}
                    </span>

                    <h2 className="font-medium md:text-[16px] mb-2text-[12px]  break-words">
                      About Project :
                    </h2>
                  </div>
                  <p className="text-gray-700 md:text-[16px] text-[12px] font-regular ">
                    {projectData?.AboutProject}
                  </p>
                </div>
                <div className="flex flex-col md:gap-2 gap-1">
                  <div className="flex items-center md:gap-2 gap-1 ">
                    <span className="text-[#3586FF] ">
                      {React.cloneElement(iconMap["Description"], {
                        className: "md:w-6 md:h-6 w-3 h-3",
                      })}
                    </span>
                    <h2 className="font-medium md:text-[16px] mb-2 text-[12px]  break-words">
                      Description :
                    </h2>
                  </div>
                  <p className="text-gray-700 md:text-[16px] text-[12px] font-regular ">
                    {projectData?.Description}
                  </p>
                </div>

                <div className="flex flex-col md:gap-2 gap-1">
                  <div className="flex items-center md:gap-2 gap-1 ">
                    <span className="text-[#3586FF] ">
                      {React.cloneElement(iconMap["Highlights"], {
                        className: "md:w-6 md:h-6 w-3 h-3",
                      })}
                    </span>
                    <h2 className="font-medium md:text-[16px] text-[12px]  break-words">
                      Highlights
                    </h2>
                  </div>
                  <div
                    className="text-gray-700 md:text-[16px] text-[12px] font-regular"
                    dangerouslySetInnerHTML={{
                      __html: projectData?.Highlights || "",
                    }}
                  />
                </div>

                <div className="flex flex-col md:gap-2 gap-1">
                  <div className="flex items-center md:gap-2 gap-1 ">
                    <span className="md:text-[16px] text-[12px] text-[#3586FF] ">
                      {iconMap["Specifications"]}
                    </span>
                    <h2 className="font-medium md:text-[16px] text-[12px] break-words">
                      Specifications
                    </h2>
                  </div>
                  <div
                    className="text-gray-700 md:text-[16px] text-[12px] font-regular"
                    dangerouslySetInnerHTML={{
                      __html: projectData?.Specifications || "",
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="md:space-y-2 space-y-1">
              <h1 className="font-medium text-[#3586FF]  mb-2 md:text-[18px] text-[14px]  flex items-center md:gap-2 gap-1">
                <span className="text-[#3586FF] ">
                  {React.cloneElement(iconMap["mediaDetails"], {
                    className: "md:w-6 md:h-6 w-3 h-3",
                  })}
                </span>
                Media Details :
              </h1>
              <div className="flex flex-wrap w-full">
                {projectData?.mediaDetails?.propertyImages
                  ?.slice(0, 2)
                  .map((imgUrl, index) => (
                    <div key={index} className="w-1/2 p-1">
                      <div className="relative w-full aspect-[2/1] rounded-md overflow-hidden">
                        <Image
                          src={imgUrl}
                          alt={`Project Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
const RenderKeyValueObject = ({ data }: { data: any }) => {
  if (!data) return null;

  return (
    <div className="grid md:grid-cols-4 grid-cols-2 md:gap-8 gap-3 justify-between w-full md:px-8 px-4 md:py-8 py-4 shadow-custom bg-white md:rounded-[10px] rounded-[4px]">
      {Object.entries(data).map(([key, value]) => {
        if (value === null || typeof value === "object") return null;
        if (key === "id") return null;

        const formattedKey = key
          .replace(/_/g, " ")
          .replace(/([A-Z])/g, " $1")
          .replace(/^\w/, (c) => c.toUpperCase());

        return (
          <div key={key} className="flex flex-col col-span-1">
            <div className="flex items-center md:gap-2 gap-1">
              {iconMap[key] && (
                <span className="text-[#3586FF] ">
                  {React.cloneElement(iconMap[key], {
                    className: "md:w-6 md:h-6 w-3 h-3",
                  })}
                </span>
              )}
              <p className="font-medium md:text-[16px] text-[12px] text-gray-600 break-words">
                {formattedKey}
              </p>
            </div>
            <div className="font-medium md:text-[16px] text-[12px] text-gray-900 break-words">
              {value as React.ReactNode}
            </div>
          </div>
        );
      })}
    </div>
  );
};
