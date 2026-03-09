import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import Loader from "../Loader";
import Image from "next/image";
import { FiCalendar, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { BadgeCheck } from "lucide-react";
import Button from "@/common/Button";
import { Tab } from "@headlessui/react";
import clsx from "clsx";
import { CheckCircle } from "lucide-react";
import { FaRulerCombined } from "react-icons/fa";
import { FiPhoneCall, FiPhone } from "react-icons/fi";
import {
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiUserCircle,
} from "react-icons/hi2";
import { HiMail, HiChatAlt2, HiOfficeBuilding } from "react-icons/hi";
import Modal from "@/common/Modal";

import ContactSellerForm from "@/components/PropertyDetailsComponent/ContactSellerForm";

interface ProjectData {
  Highlights: string;
  ProjectArea: number;
  ProjectSize: number;
  MinSize: number;
  MaxSize: number;
  Specifications: string;
  Brochure: string[];
  AboutProject: string;
  ProjectAmenities: string[];
  propertyType: {
    units: {
      BHK: string;
      flooringPlans: {
        floorplan: string;
        BuiltupArea: number;
        TotalPrice: number;
        pricePerSft: number;
      }[];
    }[];
  };
  company: {
    companyName: string;
    RERAId: string;
    Logo: string[];
    estdYear: number;
    about: string;
  };
}

export default function CompanyProjectsView({
  companyId,
}: {
  companyId: string;
}) {
  const [projects, setProjects] = useState<any>([]);
  const [Projectid, setProjectid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      const pathParts = router.asPath.split("/");
      const projectId = pathParts[4];
      setProjectid(projectId);
    }
  }, [router.isReady, router.asPath]);

  const fetchProjects = useCallback(async (companyId: string) => {
    if (!companyId) return;

    setLoading(true);
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.companyonboarding}/${companyId}`
      );
      if (res?.status === 200 && res?.body) {
        setProjects(res.body);
      }
    } catch (error) {
      console.error("error is", error);
      toast.error("Something went wrong while fetching Project details");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (companyId) {
      fetchProjects(companyId);
    }
  }, [companyId, fetchProjects]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-1 mt-8 px-5  relative flex-col md:flex-row max-w-[1440px] mx-auto">
        <div className="flex flex-col items-center md:px-10 px-2 mx-auto gap-y-[10px] py-10 w-full justify-between md:w-[70%] ">
          <div className="bg-white shadow-custom rounded-lg  w-full px-8 py-5 flex flex-col md:gap-4 gap-2">
            <div className="flex items-center gap-10">
              {projects?.Logo && (
                <div className="relative md:w-[80px] w-[70px] md:h-[80px] h-[70px]  ">
                  <Image
                    src={projects?.Logo[0]}
                    fill
                    alt="project_logo"
                    className="object-cover rounded-[16px]"
                  />
                </div>
              )}

              <div className="flex flex-col md:gap-2 gap-1">
                <h1 className="font-bold  md:text-[16px] text-[12px] ">
                  {projects?.companyName}
                </h1>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-nowrap bg-blue-50 text-[#3586FF] font-medium md:text-[12px] text-[8px]">
                    {projects?.projects?.length} Projects
                  </span>
                  {projects?.RERAId && (
                    <span className="px-3 py-1 rounded-full text-nowrap bg-green-50 text-green-500 font-medium md:text-[12px] text-[8px]">
                      RERA ID: {projects.RERAId}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full h-[1px] bg-gray-600 px-5 mb-[2px] " />
            <div className="text-gray-700 w-full"></div>

            <div className="flex flex-col gap-2">
              <h1 className="md:text-[16px] text-[12px] font-medium text-gray-700">
                {projects?.about}
              </h1>
              <p className="md:text-[16px] text-[12px] font-medium">
                Established:
                <span className="font-regular">
                  {projects?.estdYear}
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {projects?.projects?.map((project: any, index: number) => (
              <ProjectCard
                key={index}
                project={project}
                company={projects?.companyName}
                developerInformation={projects?.developerInformation}
              />
            ))}
          </div>
        </div>
        <div className="md:w-[30%] w-full md:sticky md:top-24 h-fit">
          <ContactSellerForm
            propertyId={(projects?.id)}
            project={true}
          />
        </div>
      </div>
    </>
  );
}
const ProjectCard = ({
  project,
  company,
  developerInformation,
}: {
  project: any;
  company: string;
  developerInformation: any;
}) => {
  const [openModal, setOpenModal] = useState(false);

  const formatPrice = (price: number): string => {
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `${(price / 100000).toFixed(1)} L`;
    } else {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(price);
    }
  };
  const calculateEMI = (principal: number) => {
    const rate = 0.00708;
    const tenure = 240;

    const emi =
      (principal * rate * Math.pow(1 + rate, tenure)) /
      (Math.pow(1 + rate, tenure) - 1);

    return Math.round(emi);
  };

  return (
    <div className="flex items-center md:flex-row flex-col gap-6 bg-white w-full md:px-8 px-2 py-4 shadow-lg rounded-md border border-gray-200">
      <div className="relative md:w-[350px] w-[250px] md:max-h-[350px]  md:h-[200px] h-[120px] overflow-hidden rounded-xl">
        {project?.mediaDetails?.propertyImages?.length > 0 && (
          <Image
            src={project?.mediaDetails.propertyImages[0]}
            alt="Property Image"
            fill
            className="object-cover md:rounded-lg rounded-md"
            priority
          />
        )}
      </div>

      <div className="flex flex-col md:gap-1 gap-1 w-full">
        <div className="flex items-center gap-2 text-gray-800">
          <p className="font-bold md:text-[12px] text-[10px] text-black">
            ₹{formatPrice(project?.minPrice)} - ₹
            {formatPrice(project?.maxPrice)}
          </p>
          <p className="text-[#3586FF] font-medium md:text-[12px] text-[10px] bg-blue-100 px-3 py-1 rounded-md">
            EMI Starts at ₹{(calculateEMI(project?.minPrice) / 1000).toFixed(1)}
            K
          </p>
        </div>

        <h2 className="md:text-[14px] text-[12px] font-bold text-gray-900">
          {project.Name}
        </h2>

        <h3 className="md:text-[12px] text-[10px] text-gray-700">
          By <span className="font-bold text-black">{company}</span>
        </h3>

        <div className="flex items-center gap-2 text-gray-700 md:text-[12px] text-[10px]">
          <div className="flex gap-2">
            {project.propertyType?.units.map((unit: any, idx: number) => (
              <span
                key={idx}
                className="font-medium text-[#3586FF] bg-blue-50 px-2.5 py-1 md:rounded-[8px] md:text-[12px] text-[10px] rounded-[4px]"
              >
                {unit.BHK}
              </span>
            ))}
          </div>

          <div className="flex items-center md:gap-1 gap-1 font-medium text-gray-900">
            <span className="font-medium text-gray-900">
              {project.propertyType.typeName}
            </span>
            In
            <span className="font-medium text-gray-900">
              {project.location?.city}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 grid-cols-2 md:gap-4 gap-3 bg-gray-100 rounded-lg p-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <div className="flex  items-center md:gap-2 gap-1 text-gray-700">
              <FiCalendar className="w-5 h-5 text-gray-600" />
              <h1 className="font-Gordita-SemiBold md:text-[12px] text-[10px]">
                POSSESSION DATE
              </h1>
            </div>
            <p className="text-black font-medium md:text-[12px] text-[10px]">
              {project.constructionStatus?.possessionBy}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center  md:gap-2 gap-1 text-gray-700">
              <BadgeCheck className="w-5 h-5 text-gray-600" />

              <h1 className="font-Gordita-SemiBold   md:text-[12px] text-[10px]">
                POSSESSION STATUS
              </h1>
            </div>
            <p className="text-black font-medium md:text-[12px] text-[10px]">
              {project.constructionStatus?.status}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center  md:gap-2 gap-1 text-gray-700">
              <FaRulerCombined className="w-5 h-5 text-gray-600" />
              <h1 className="font-Gordita-SemiBold  md:text-[12px] text-[10px]">
                PROJECT AREA
              </h1>
            </div>
            <p className="text-black font-medium md:text-[12px] text-[10px]">
              {project.ProjectArea.size} {project.ProjectArea.unit}
            </p>
          </div>
        </div>

        {/* <div className="text-gray-700">
          <p className="text-base">
            {project.AboutProject.slice(0, 100)}...
            <span className="text-[#3586FF] cursor-pointer font-medium hover:underline">
              Read More
            </span>
          </p>
        </div> */}
        <div className="w-full h-[1px] bg-gray-200 px-5 mb-[2px] " />

        <div className="flex items-center justify-end gap-x-2 md:text-[12px] text-[10px]">
          <Button
            className="flex items-center gap-2 bg-white md:px-3 px-2 md:py-2 py-2 rounded-[8px] border-[1px] border-[#3586FF] text-[#3586FF]"
            onClick={() => {
              setOpenModal(true);
            }}
          >
            <FiPhoneCall className="md:w-5 w-3 md:h-5 h-3" />
            View Phone
          </Button>
          <Button className="flex items-center gap-2 bg-[#3586FF] md:px-3 px-2 md:py-2 py-2 rounded-[8px] text-white">
            <HiOutlineUserGroup className="md:w-5 w-3 md:h-5 h-3" />
            Contact Developer
          </Button>
        </div>
        {openModal && (
          <Modal
            isOpen={openModal}
            closeModal={() => setOpenModal(false)}
            className="md:max-w-[500px] max-w-[330px] w-full "
            rootCls="flex items-center justify-center z-[9999]"
            title=" Developer Details"
            titleCls="font-bold text-center md:text-[20px] text-[16px] text-[#3586FF] mt-4"
          >
            <div className="flex flex-col md:gap-5 gap-3 md:px-6 px-3 md:py-5 py-3">
              <div className="text-center">
                <p className="text-green-600 font-medium md:text-[14px] text-[12px]">
                  Thank you for your interest in this project!
                </p>
                <p className="text-gray-600 md:text-[14px] text-[12px] mt-1">
                  Our developer will get in touch with you shortly.
                </p>
              </div>

              <div className="bg-gray-50 md:p-4 p-2 md:rounded-[10px] rounded-[4px]  grid grid-cols-1 gap-2 md:text-[14px] text-[10px]">
                <div className="flex items-center gap-3">
                  <div className="md:w-8 w-6 md:h-8 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HiOfficeBuilding className="md:w-4 w-3 md:h-4 h-3 text-[#3586FF]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Company</p>
                    <p className="text-gray-900">{company}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="md:w-8 w-6 md:h-8 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HiUserCircle className="md:w-4 w-3 md:h-4 h-3 text-[#3586FF]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      Developer
                    </p>
                    <p className="text-gray-900">
                      {developerInformation?.fullName || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="md:w-8 w-6 md:h-8 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiPhone className="md:w-4 w-3 md:h-4 h-3 text-[#3586FF]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Phone</p>
                    <p className="text-gray-900">
                      {developerInformation?.phone || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="md:w-8 w-6 md:h-8 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HiChatAlt2 className="md:w-4 w-3 md:h-4 h-3 text-[#3586FF]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      WhatsApp
                    </p>
                    <p className="text-gray-900">
                      {developerInformation?.whatsappNumber || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="md:w-8 w-6 md:h-8 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HiMail className="md:w-4 w-3 md:h-4 h-3 text-[#3586FF]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Email</p>
                    <p className="text-gray-900">
                      {developerInformation?.email || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};
