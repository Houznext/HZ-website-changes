import React, { useRef, useState } from "react";
import Slider from "react-slick";
import Image from "next/image";
import Modal from "@/common/Modal";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export interface ListItem {
  id: number;
  name: string;
  image: string;
  Experience: string;
  Education: string;
  cases: string;
}

export interface IWorkWithExpertLawyersprops {
  heading: string;
  listItems: ListItem[];
}

export default function WorkWithExpertLawyers({
  heading,
  listItems,
}: IWorkWithExpertLawyersprops) {
  const sliderRef = useRef<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ListItem | undefined>(
    undefined
  );

  const sliderSettings = {
    dots: true,
    beforeChange: (current: number, next: number) => {
      setCurrentSlide(next);
    },
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 700,
    slidesToShow: 4,
    slidesToScroll: 1,
    customPaging: (i: number) => (
      <div
        style={{
          width: i === currentSlide ? "40px" : "8px",
          height: "8px",
          borderRadius: i === currentSlide ? "999px" : "999px",
          backgroundColor: i === currentSlide ? "#3586FF" : "#D1D5DB",
          transition: "all 0.3s ease-in-out",
          margin: "0 4px",
          display: "inline-block",
        }}
      />
    ),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const gotoNext = () => sliderRef.current?.slickNext();
  const gotoPrev = () => sliderRef.current?.slickPrev();

  const handleClick = (item: ListItem) => {
    setSelectedItem(item);
    setOpenModal(true);
  };

  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex flex-col items-center gap-8">
        <h2 className="text-center font-bold text-[22px] md:text-[26px] text-[#111827]">
          {heading}
        </h2>

        <div className="relative w-full">
          <Slider ref={sliderRef} {...sliderSettings}>
            {listItems.map((item) => (
              <div
                key={item.id}
                className="px-2 md:px-3 cursor-pointer"
                onClick={() => handleClick(item)}
              >
                <div className="relative h-[280px] md:h-[280px] bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />

                  <div className="absolute left-3 right-3 bottom-3 bg-white/95 rounded-lg px-3 py-3 flex flex-col items-center gap-1 shadow-sm">
                    <h3 className="font-medium text-[16px] text-[#111827]">
                      {item.name}
                    </h3>
                    <p className="text-[12px] text-[#6B7280]">
                      {item.Education}
                    </p>
                    <p className="text-[12px] text-[#4B5563]">
                      {item.Experience}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>

          <Image
            src="/testimonials/icons/left-slide.svg"
            alt="Previous"
            width={42}
            height={42}
            onClick={gotoPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 md:-translate-x-6 cursor-pointer hidden md:block"
          />
          <Image
            src="/testimonials/icons/right-slide.svg"
            alt="Next"
            width={42}
            height={42}
            onClick={gotoNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 md:translate-x-6 cursor-pointer hidden md:block"
          />
        </div>
      </div>

      {/* Modal */}
      {openModal && selectedItem && (
        <Modal
          isOpen={openModal}
          closeModal={() => setOpenModal(false)}
          className="md:max-w-[560px] max-w-[400px] md:h-[340px] h-[420px]"
        >
          <div className="flex flex-col items-center gap-5">
            <div className="w-full bg-[#3586FF] mt-4 text-white font-bold text-[20px] md:text-[22px] py-2 text-center rounded-t-md">
              <h3>Lawyer Details</h3>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:mt-4 px-4 w-full">
              <div className="relative w-[110px] h-[110px] md:w-[130px] md:h-[130px] rounded-full overflow-hidden shadow-md">
                <Image
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-wrap justify-center md:justify-between gap-6 w-full">
                <div className="flex flex-col gap-3 min-w-[150px]">
                  <div className="space-y-1">
                    <h4 className="font-medium text-[16px] md:text-[18px] text-[#111827]">
                      Full Name
                    </h4>
                    <p className="font-regular text-[14px] md:text-[15px] text-[#6B7280]">
                      {selectedItem.name}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-medium text-[16px] md:text-[18px] text-[#111827]">
                      Qualifications
                    </h4>
                    <p className="font-regular text-[14px] md:text-[15px] text-[#6B7280]">
                      {selectedItem.Education}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[150px]">
                  <div className="space-y-1">
                    <h4 className="font-medium text-[16px] md:text-[18px] text-[#111827]">
                      Experience
                    </h4>
                    <p className="font-regular text-[14px] md:text-[15px] text-[#6B7280]">
                      {selectedItem.Experience}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-medium text-[16px] md:text-[18px] text-[#111827]">
                      No. of Cases Dealt
                    </h4>
                    <p className="font-regular text-[14px] md:text-[15px] text-[#6B7280]">
                      {selectedItem.cases}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
