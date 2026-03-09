import React, { useRef } from "react";
import styles from "./index.module.scss";
import Image from "next/legacy/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const BuilderProcess = () => {
  const sliderRef = useRef<any>(null);
  const gotoNext = () => sliderRef.current?.slickNext();
  const gotoPrev = () => sliderRef.current?.slickPrev();

  const buildsteps = [
    {
      image: "/images/howitworks/sub_req.png",
      title: "Submit Requirement",
      desc: "Technical team will reach out to you",
    },
    {
      image: "/images/howitworks/cost_estimation.png",
      title: "Cost Estimation",
      desc: "Our expert will give cost estimation",
    },
    {
      image: "/images/howitworks/schedule_visit.png",
      title: "Schedule Visit",
      desc: "Expert will reach out to Location and note measurement",
    },
    {
      image: "/images/howitworks/agreement_sign.png",
      title: "Agreement and Signing",
      desc: "Agreement signing between clients & buildAhome",
    },
    {
      image: "/images/howitworks/estimation_del.png",
      title: "Work Execution and Delivery",
      desc: "Team will start work and finish within time",
    },
  ];

  return (
    <div className="relative py-10">
      <h2 className="md:text-[24px] text-[18px] font-bold text-center leading-[46px] mb-[50px]">
        How It <span className="text-[#3586FF]">Works</span>
      </h2>

      <div className="relative">
        <div className={styles.sliderClassName}>
          <Slider
            ref={sliderRef}
            cssEase="linear"
            speed={500}
            arrows={false}
            swipeToSlide={true}
            infinite
            variableWidth
          >
            {buildsteps.map((item, index) => (
              <div
                key={index}
                className="px-3"
              >
                <div className="group bg-white/90 backdrop-blur-md border md:min-h-[220px] min-h-[200px] border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03] w-[180px] md:w-[260px]">
                  <div className="relative h-[120px] md:h-[130px] w-full overflow-hidden rounded-t-xl">
                    <Image
                      src={item.image}
                      alt="steps_img"
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[16px] md:text-[20px] font-bold py-1 px-3 rounded-br-lg shadow-md">
                      {index + 1}
                    </span>
                  </div>

                  <div className="md:p-2 p-1 text-center">
                    <p className="md:text-[16px] text-[14px] font-bold text-[#3586FF] mb-1">
                      {item.title}
                    </p>
                    <p className="md:text-[12px] text-[10px] text-gray-600 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        <div className="absolute top-1/3 -left-6 z-30">
          <button
            onClick={gotoPrev}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:scale-110 transition-all duration-300"
          >
            ‹
          </button>
        </div>
        <div className="absolute top-1/3 -right-6 z-30">
          <button
            onClick={gotoNext}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:scale-110 transition-all duration-300"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuilderProcess;
