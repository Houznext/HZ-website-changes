import React, { useRef, useState } from "react";
import { Tab } from "@headlessui/react";
import clsx from "clsx";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

export interface IServiceTabSectionProps {
  heading: string;
  subHeading: string;
  tabs: Array<{
    tabKey: string;
    buttonLabel: string;
  }>;
  tabPanels: Array<{
    tabKey: string;
    list: Array<{
      label: string;
      imageUrl: string;
    }>;
  }>;
}

function ServiceTabSection({
  tabs,
  tabPanels,
  heading,
  subHeading,
}: IServiceTabSectionProps) {
  const sliderRef = useRef<any>(null);
  const gotoNext = () => {
    sliderRef.current?.slickNext();
  };
  const gotoPrev = () => {
    sliderRef.current?.slickPrev();
  };
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  const sliderSettings = {
    dots: true,
    beforeChange: (current: number, next: number) => {
      setCurrentSlide(next);
    },

    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 2000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    centerMode: true,
    centerPadding: "20px",
    customPaging: (i: number) => (
      <div
        style={{
          width: i === currentSlide ? "41px" : "12px",
          height: "12px",
          borderRadius: i === currentSlide ? "20px" : "50%",
          backgroundColor: i === currentSlide ? "#3586FF" : "#ccc",
          transition: "all 0.3s ease-in-out",
          margin: "-10px 4px",
          display: "inline-block",
        }}
      />
    ),

    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 425,
        settings: {
          slidesToShow: 1,
          centerPadding: "2px",
        },
      },
       {
        breakpoint: 375,
        settings: {
          slidesToShow: 1,
          centerPadding: "20px",
        },
      },
    ],
  };
  return (
    <div className="mx-auto w-full max-w-8xl">
      <Tab.Group onChange={(index) => setActiveTab(index)}>
        <h1 className="heading-text md:leading-[34px]  text-[#212227] font-bold mb-2 text-center">
          {heading}
        </h1>
        <h2 className="label-text md:leading-[28.5px] text-[#7B7C83] text-center mb-5 ">
          {subHeading}
        </h2>
        <div className="w-full  mx-auto">
          <Tab.List
            className={`flex overflow-auto custom-scrollbar  gap-[16px] md:gap-[20px] mb-[25px] md:mb-[48px]`}
          >
            {tabs.map((tabList) => {
              return (
                <Tab
                  key={`${tabList.tabKey}`}
                  className={({ selected }) =>
                    clsx({
                      "label-text rounded-[6px] text-nowrap md:px-[24px] md:mb-1 md:py-[4px] px-[12px] py-[2px]":
                        true,
                      "font-medium bg-[#F4F4F4] text-[#212227] md:mb-1":
                        !selected,
                      "font-medium bg-[#3586FF] text-[#FDFDFD] focus:outline-none md:mb-1":
                        selected,
                    })
                  }
                >
                  {tabList.buttonLabel}
                </Tab>
              );
            })}
          </Tab.List>
        </div>
        <Tab.Panels className=" md:block hidden  mx-auto">
          {tabPanels.map((panel) => {
            return (
              <Tab.Panel
                key={`${panel.tabKey}`}
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[20px]`}
              >
                {panel.list.map((listItem, index) => {
                  return (
                    <div
                      key={`${index}-${listItem.imageUrl}-${listItem.label}`}
                      className="relative h-[170px] md:h-[180px] md:max-w-[333px]"
                    >
                      <Image
                        src={listItem.imageUrl}
                        alt=""
                        fill={true}
                        className="absolute -z-10 md:rounded-[8px] rounded-[4px]"
                      ></Image>
                      <div className="w-full h-full flex items-end justify-start">
                        {
                          <span className="bg-[#101113] py-[6px] rounded px-[14px] font-medium text-[#FFFFFF] text-[13px] leading-[18.52px]">
                            {listItem.label}
                          </span>
                        }
                      </div>
                    </div>
                  );
                })}
              </Tab.Panel>
            );
          })}
        </Tab.Panels>
        <Tab.Panels className="block md:hidden">
          <Slider ref={sliderRef} {...sliderSettings}>
            {tabPanels[activeTab].list.map((listItem, index) => (
              <div
                key={`${index}-${listItem.imageUrl}-${listItem.label}`}
                className="relative h-[180px] md:h-[232px] max-w-[313px] px-2  m-2 flex items-center justify-center mx-auto"
              >
                <Image
                  src={listItem.imageUrl}
                  alt={listItem.label}
                  fill={true}
                  className="absolute -z-10 rounded-[8px]"
                />
                <div className="w-full h-full flex items-end justify-start mb-3">
                  <span className="bg-[#101113] py-[10px] px-[14px] font-medium text-[#FFFFFF] text-[13px] leading-[18.52px]">
                    {listItem.label}
                  </span>
                </div>
              </div>
            ))}
          </Slider>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

export default ServiceTabSection;
