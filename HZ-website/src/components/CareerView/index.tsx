import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  ConnectIcon,
  ExcelIcon,
  FacebookIcon,
  InnovateIcon,
  PowerIcon,
  RightViewArrow,
  WhatsAppIcon,
  YoutubeIcon,
} from "../Icons";
import Button from "@/common/Button";
import Modal from "@/common/Modal";
import Image from "next/image";
import { useRouter } from "next/router";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";

const JobCard = ({ data }: any) => {
  const [modal, setModal] = useState<boolean>(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [careers, setCareers] = useState<any[]>([]);
  const router = useRouter();

  const fetchCareers = async () => {
    try {
      const response = await apiClient.get(apiClient.URLS.apply);
      if (response.status === 200) {
        setCareers(response.body);
      }
    } catch (error) {
      toast.error("error occured ");
      console.error("Error fetching careers:", error);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  const handleView = (job: any) => {
    console.log("sdasda", job);
    setSelectedJob(job);
    setModal(true);
  };

  const handleRoute = (id: number) => {
    router.push(`/careers/apply?id=${id}`);
  };

  return (
    <div className="bg-[#fcf9f9] p-[24px] rounded-[8px] mb-4 max-w-[1000px] shadow-custom">
      <p className="font-medium text-gray-500 mb-3">
        Job Title:
        <span className="text-[black] ml-2 font-medium">
          {data?.title}
        </span>
      </p>
      <p className="font-medium text-gray-500">
        Description:
        <span className="text-[black] font-regular ml-3">
          {data.description}
        </span>
      </p>

      {careers
        .filter((job: any) => job?.jobRole?.id === data?.id)
        .map((job: any) => (
          <Button
            key={job.id}
            className="bg-[#3586FF] rounded-[8px] p-2 mt-4 text-white font-medium"
            onClick={() => handleView(job)}
          >
            View Details
          </Button>
        ))}

      {modal && selectedJob && (
        <Modal
          isOpen={modal}
          closeModal={() => setModal(false)}
          className="md:max-w-[800px] max-w-[370px] z-[1000]"
        >
          <div className="p-4">
            <h2 className="md:text-[24px] text-[20px] font-medium mb-4">
              {selectedJob?.jobRole?.title}
            </h2>
            <div>
              <p className="text-[#7f8793] mb-2">
                Location: <span>{selectedJob?.location}</span>
              </p>
            </div>
            <p className="text-[#7f8793] mb-2">
              Experience Required: {selectedJob?.experience} years
            </p>
            <p className="text-[#7f8793] mb-6">
              Job Type: {selectedJob?.jobType}
            </p>
            {selectedJob?.jobHighlights && (
              <div className="mb-4">
                <h3 className="md:text-[20px] text-[18px] font-medium mb-2">
                  Job Highlights
                </h3>
                <div
                  className="text-[#7f8793]"
                  dangerouslySetInnerHTML={{
                    __html: selectedJob.jobHighlights,
                  }}
                />
              </div>
            )}
            {selectedJob?.skills && (
              <>
                <h3 className="md:text-[20px] text-[18px] font-medium mb-2">
                  Skills Required
                </h3>
                <ul className="list-disc list-inside mb-4">
                  {selectedJob.skills.map((skill: string, index: number) => (
                    <li key={index} className="text-[#7f8793]">
                      {skill}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="mt-6 text-[#3586FF] underline">
              To apply for this job, email your resume at{" "}
              <Link href="mailto:OneCasarealestates@gmail.com">
                OneCasarealestates@gmail.com
              </Link>
            </p>
            <Button
              className="bg-[#3586FF] rounded-[8px] px-4 py-2 mt-4 text-white font-medium"
              onClick={() => handleRoute(selectedJob?.id)} // Pass the job ID to handleRoute
            >
              Apply
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const CareerView = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<any>({});

  const [department, setDepartmemt] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [active, setActive] = useState<number>(0);

  const fetchDepartments = async () => {
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.careers}/departments`
      );
      if (response.status == 200) {
        setDepartmemt(response.body);
      }
    } catch (error) {
      console.error("Error fetching careers:", error);
    }
  };
  const fetchRoles = async () => {
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.careers}/department/${selectedDepartment?.id}`
      );
      if (response.status == 200) {
        setRoles(response.body);
      }
    } catch (error) {
      console.error("Error fetching careers:", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) fetchRoles();
  }, [selectedDepartment]);
  const handleDepartment = (department: any, index: number) => {
    setSelectedDepartment(department);
    setActive(index);
  };

  return (
    <div className="p-[24px]">
      <p className="md:text-[24px] text-[20px] font-medium flex flex-row gap-1 justify-center items-center md:mt-[44px] mt-[30px]">
        <Link href="/">Home</Link>
        <RightViewArrow />
        <Link href="" className="text-[#3586FF] ">
          Career
        </Link>
      </p>
      <div className="flex md:flex-row flex-col justify-center items-center md:px-5 px-0">
        <div className="relative md:w-[30%] w-full h-[380px]">
          <Image
            src="/images/careers/focus.jpg"
            alt="image"
            fill
            className="object-cover"
          />
        </div>
        <div className="md:w-[70%] w-full h-full">
          <div className="flex flex-col gap-4 md:mt-[72px] mt-[50px]">
            <h1 className="md:text-[24px] text-[20px]font-medium">
              Why OneCasa ?
            </h1>
            <h2 className="md:text-[16px] text-[14px] leading-6 font-regular text-[#7B7C83] ">
              At OneCasa, we take pride in offering a comprehensive suite of
              real estate services, including property marketing, personalized
              property search, expert negotiation, seamless closing, and more.
              Our mission is to simplify and streamline the real estate process,
              ensuring a smooth, stress-free experience while securing the best
              possible deal for our clients. search, expert negotiation,
              seamless closing, and more. Our mission is to simplify and
              streamline the real estate process.
            </h2>
          </div>
          <div className="mt-8 flex md:flex-row flex-col gap-y-[4px]">
            <p className="md:text-[20px] text-[18px] font-regular">
              Follow for more updates on:
            </p>
            <div className="flex flex-row gap-3 md:ml-4 ml-2">
              <div className="flex flex-row gap-2 justify-center items-center">
                <WhatsAppIcon />
                <Link className="text-[#3586FF] underline" href={""}>
                  Whatsapp
                </Link>
              </div>
              <div className="flex flex-row gap-2 justify-center items-center">
                <FacebookIcon />
                <Link className="text-[#3586FF] underline" href={""}>
                  Youtube
                </Link>
              </div>
              <div className="flex flex-row gap-2 justify-center items-center">
                <YoutubeIcon />
                <Link className="text-[#3586FF] underline" href={""}>
                  Facebook
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <CoreValues />
      </div>
      <p className="text-center md:text-[24px] text-[20px] leading-10 font-medium mt-20 mb-[70px]">
        Current Openings Positions
      </p>
      <div className="flex flex-col gap-y-[20px] items-center md:items-start md:flex-row">
        <div className="md:px-[16px] px-[14px] py-[20px] border-[1px] border-[#DFDFDF] md:w-[400px] w-[350px] rounded-[8px] md:sticky top-[24px] h-[calc(100vh-48px)] overflow-y-auto">
          <p className="md:text-[20px] text-[18px] leading-7 text-center font-medium">
            Departments
          </p>
          <div className="h-[1px] bg-[#A8A9B0] w-full my-6"></div>
          <div className="flex flex-col gap-7 ">
            {department?.length > 0 &&
              department.map((department: any, index: number) => (
                <div
                  key={index}
                  className={`flex w-full flex-row justify-between cursor-pointer py-3 px-2 rounded-md shadow-custom hover:scale-105 border-gray-500 ${index === active ? "text-[#3586FF]" : "text-black"
                    }`}
                  onClick={() => handleDepartment(department, index)}
                >
                  <p className="md:text-[20px] text-[18px] font-regular">
                    {department?.name}
                  </p>
                  <RightViewArrow />
                </div>
              ))}
          </div>
        </div>

        <div className="ml-8 w-full h-[calc(100vh-48px)] custom-scrollbar overflow-y-auto border-l-[2px] border-[#7B7C83] md:px-8 px-6">
          <p className="text-[24px] leading-9 font-medium mb-8 sticky top-0 bg-white z-10">
            Jobs in {selectedDepartment?.name} ({roles.length})
          </p>
          <div className="flex flex-col ">
            {roles.map((job, index) => (
              <JobCard data={job} key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerView;

const coreValues = [
  {
    title: "Innovate",
    description:
      "We continuously push the boundaries of creativity and technology, developing cutting-edge solutions that redefine industry standards.",
    icon: <InnovateIcon />,
  },
  {
    title: "Empower",
    description:
      "We believe in empowering individuals and teams, providing the tools, resources, and support needed to achieve their full potential.",
    icon: <PowerIcon />,
  },
  {
    title: "Excel",
    description:
      "Striving for excellence in everything we do, we are committed to delivering exceptional quality and exceeding expectations.",
    icon: <ExcelIcon />,
  },
  {
    title: "Connect",
    description:
      "Building strong, meaningful connections with our clients, partners, and communities is at the heart of our mission, fostering trust and collaboration.",
    icon: <ConnectIcon />,
  },
];

const CoreValues: React.FC = () => {
  return (
    <div
      className="relative w-full h-full bg-cover bg-center my-16 shadow-md"
      style={{ backgroundImage: "url('/home/home-page-hero-section.png')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="relative max-w-7xl mx-auto px-4 py-16 text-center text-white">
        <h2 className="md:text-4xl  text-2xl font-bold mb-12">
          Our Core Values
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:gap-8 gap-3">
          {coreValues.map((value, index) => (
            <div
              key={index}
              className="bg-white text-black md:p-6  p-4 rounded-lg shadow-lg transform transition duration-300 hover:scale-105"
            >
              <div className="md:w-12 md:h-12 w-8 h-8 mb-4 mx-auto">
                {value.icon}
              </div>
              <h3 className="md:text-xl text-sm font-semibold mb-2">
                {value.title}
              </h3>
              <p className="md:text-[16px] text-[12px]">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
