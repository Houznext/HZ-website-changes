import React, { useEffect, useState } from "react";
import { CiLocationOn } from "react-icons/ci";
import Image from "next/image";
import Link from "next/link";
import SectionSkeleton from "@/common/Skeleton";
import { useHomepageStore } from "@/store/useHomepageStore";
const PropertiesList = ({ newProjects, heading }: any) => {
  const loading = useHomepageStore((state) => state.loading);
  return (
    <div className="my-10 md:mb-[80px]  px-2 md:px-6 xl:px-10 mx-auto max-w-[1600px]">
      <h2
        style={{
          backgroundImage:
            "linear-gradient(90deg, #3586FF 30.48%, #212227 100%)",
          color: "transparent",
          backgroundClip: "text",
        }}
        className="md:text-[24px] text-[18px] md:leading-[44.17px] leading-[39px] font-medium md:mb-10 mb-4 text-center md:text-nowrap text-wrap"
      >
        {heading}
      </h2>
      {loading ? (
        <SectionSkeleton type={"propertiesList"} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 md:gap-5 gap-3 mx-auto">
          {newProjects?.length > 0 &&
            newProjects?.map((project: any, index: number) => {
              return (
                <Link
                  key={`${index}-new-launched-project`}
                  href={project?.cta?.href || "#"}
                  className="block"
                >
                  <div className="p-2 md:p-4 cursor-pointer  border shadow-md border-[#DBDBDB] rounded-md group relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="relative w-full h-[110px] md:h-[180px] mb-3 md:mb-4 overflow-hidden rounded-lg">
                      <Image
                        src={project?.imageUrl}
                        alt={project?.name}
                        fill
                        className="object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        quality={75}
                        priority={index < 3}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute md:top-3 top-1 md:left-3 left-1">
                        <span className="bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-[2px] rounded-full  font-medium md:text-[12px] text-[10px]">
                          {project?.type}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-medium  md:text-[18px] text-[12px] md:leading-[28.5px] leading-[22.8px] ">
                      {project?.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      {" "}
                      <CiLocationOn className="md:text-[12px] text-[10px] text-[#7B7C83]" />{" "}
                      <span className="md:text-[14px] text-[12px] md:leading-[19.95px] leading-[18.52px] text-[#7B7C83]">
                        {project?.location}
                      </span>{" "}
                    </div>
                    <div className="border border-[#E9E9E9] md:my-4 my-2"></div>
                    <div className="grid  grid-cols-1 xl:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 md:gap-y-4 gap-y-2 lg:gap-x-4 md:gap-x-3 gap-x-1">
                      <div className="flex items-center justify-start gap-1.5 md:gap-2.5 lg:gap-0.5">
                        <Image
                          src="/icons/cost.svg"
                          alt=""
                          width={20}
                          height={18}
                          loading="lazy"
                        />
                        <span className="text-[#7B7C83] text-nowrap md:text-[12px] text-[12px]">
                          {project?.cost}
                        </span>
                      </div>
                      <div className="flex items-center justify-start gap-1.5 md:gap-2.5 lg:gap-1.5 lg:ml-4 ml-0">
                        <Image
                          src="/icons/bed.svg"
                          alt=""
                          width={20}
                          height={18}
                          loading="lazy"
                        />
                        <span className="text-[#7B7C83] text-nowrap md:text-[12px] text-[12px]">
                          {project?.rooms}
                        </span>
                      </div>
                      {/* <div className="flex items-center justify-start gap-1.5 md:gap-2.5 lg:gap-1.5">
                    <Image
                      src="/icons/apartment.svg"
                      alt=""
                      width={20}
                      height={18}
                      loading="lazy"
                    />
                    <span className="text-[#7B7C83] font-medium md:text-[14px] text-[12px]">
                      {project?.type}
                    </span>
                  </div> */}
                    </div>
                    <div className="block md:mt-4 mt-2">
                      <span className="block w-full rounded-md text-center md:py-1  max-md:text-[12px] text-[14px]  py-[4px] bg-[#3586FF] font-medium md:leading-[22.8px] leading-[18.52px] text-white">
                        {project?.cta?.label.slice(0, 1).toUpperCase() +
                          project?.cta?.label.slice(1)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default PropertiesList;
