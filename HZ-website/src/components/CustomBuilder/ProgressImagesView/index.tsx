import Image from "next/image";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { MdOutlineImage } from "react-icons/md";
import { useRouter } from "next/router";
import { useCustomBuilderStore } from "@/store/useCustomBuilderStore ";
import Loader from "@/components/Loader";
import RouterBack from "../RouterBack";
import Slider, { Settings } from "react-slick";
import Button from "@/common/Button";
import Modal from "@/common/Modal";
import { Download, Calendar } from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function ProgressImagesView() {
  const router = useRouter();
  const custom_builder_id = Number(router?.query?.id);
  const { data: customBuilder, isLoading, fetchData } = useCustomBuilderStore();

  const [logs, setLogs] = useState<any[]>([]);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [activeMonth, setActiveMonth] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);
  const PAGE_SIZE = 5;
  const sliderRef = useRef<any>(null);

  const gotoNext = () => {
    sliderRef.current?.slickNext();
  };
  const gotoPrev = () => {
    sliderRef.current?.slickPrev();
  };

  const [currentSlide, setCurrentSlide] = useState(0);

  const buildSliderSettings = (count: number): Settings => {
    const SLIDES_DESKTOP = 3;
    const show = Math.min(SLIDES_DESKTOP, Math.max(1, count));
    const enableInfinite = count > show;

    return {
      arrows: false,
      dots: count > 1,
      infinite: true,
      autoplay: count > 1,
      autoplaySpeed: 5000,
      speed: 600,
      slidesToShow: show,
      slidesToScroll: 1,
      beforeChange: (_: number, next: number) =>
        setCurrentSlide(next % Math.max(1, count)),
      customPaging: (i: number) => (
        <div
          style={{
            width: i === currentSlide ? 48 : 8,
            height: 8,
            borderRadius: i === currentSlide ? 16 : "50%",
            backgroundColor: i === currentSlide ? "#3586FF" : "#ccc",
            transition: "all .25s",
            margin: "-10px 4px",
            display: "inline-block",
          }}
        />
      ),
      responsive: [
        {
          breakpoint: 1444,
          settings: { slidesToShow: Math.min(3, count), slidesToScroll: 1 },
        },
        {
          breakpoint: 1024,
          settings: { slidesToShow: Math.min(3, count), slidesToScroll: 1 },
        },
        {
          breakpoint: 768,
          settings: { slidesToShow: Math.min(2, count), slidesToScroll: 1 },
        },
        {
          breakpoint: 480,
          settings: { slidesToShow: 1, slidesToScroll: 1 },
        },
      ],
    };
  };

  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{
    url: string;
    type: string;
  } | null>(null);

  useEffect(() => {
    if (custom_builder_id) {
      fetchData(custom_builder_id.toString());
    }
  }, [custom_builder_id, fetchData]);

  useEffect(() => {
    if (customBuilder?.logs?.length) {
      const sortedLogs = [...customBuilder.logs].sort((a, b) => a.day - b.day);
      setLogs(sortedLogs);
    }
  }, [customBuilder?.logs]);

  const logsByMonth = useMemo(() => {
    if (!logs.length) return {};
    const grouped: { [key: string]: any[] } = {};
    logs.forEach((log) => {
      const monthKey = new Date(log.date).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(log);
    });
    return grouped;
  }, [logs]);

  const months = Object.keys(logsByMonth);
  const currentLogs = logsByMonth[months[activeMonth]] || [];
  const visibleLogs = currentLogs.slice(0, visibleCount);

  const downloadMedia = async (
    url: string,
    type: string,
    filename?: string
  ) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download =
        filename || `progress.${type === "video" ? "mp4" : "jpg"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:p-5 p-2 gap-4 w-full">
      <div className="px-2 py-4">
        <RouterBack />
      </div>

      <section className="bg-white rounded-[8px] md:p-6 p-3">
        <div className="flex items-center justify-between md:mb-[32px] mb-[22px]">
          <div className="w-full flex items-center gap-2 md:mb-6 mb-3">
            <MdOutlineImage size={24} className="text-[#3586FF] w-6 h-6" />
            <h1 className="font-bold md:text-[18px] text-[14px]">
              Progress Images
            </h1>
          </div>
        </div>

        <div className="flex md:gap-3 overflow-x-auto gap-2 md:mb-6 mb-3">
          {months.map((month, index) => (
            <Button
              key={month}
              onClick={() => {
                setActiveMonth(index);
                setVisibleCount(PAGE_SIZE);
              }}
              className={`md:px-4 px-2 md:py-2 py-1 md:text-[14px] flex items-center md:gap-1 gap-0.5 text-[12px] rounded-[4px] md:rounded-[10px]  font-medium ${activeMonth === index
                ? "bg-[#3586FF] text-white"
                : "bg-gray-200 text-gray-800"
                }`}
            >
              <Calendar size={16} className="md:mr-2 mr-0" />
              {month}
            </Button>
          ))}
        </div>

        <div className="md:space-y-4 space-y-2">
          {visibleLogs.map((log) => (
            <div
              key={log.id}
              className="border rounded-[4px] md:rounded-[10px] md:p-4 p-1 bg-gray-50 shadow-custom"
            >
              <Button
                onClick={() =>
                  setExpandedDay(expandedDay === log.day ? null : log.day)
                }
                className="w-full flex justify-between items-center text-left"
              >
                <div className="flex items-center gap-1">
                  <div className="bg-blue-100 text-[#3586FF] md:rounded-[10px] rounded-[4px] md:p-2 py-0.5 px-1">
                    <span className="font-medium md:text-[16px] text-[12px]">
                      Day {log.day}
                    </span>
                  </div>
                  <h2 className="font-bold text-gray-800 md:text-[16px] text-[12px]">
                    {log.date}
                  </h2>
                </div>

                <span className="text-[#3586FF]">
                  {expandedDay === log.day ? "▲" : "▼"}
                </span>
              </Button>

              {expandedDay === log.day &&
                (() => {
                  const mediaList = Array.isArray(log.imageOrVideo)
                    ? log.imageOrVideo
                    : [];
                  const sliderSettings = buildSliderSettings(mediaList.length);
                  const show = Math.min(3, Math.max(1, mediaList.length));

                  return (
                    <div className="relative w-full xl:max-w-[1392px] lg:max-w-[980px] md:max-w-[750px] max-w-[300px] mx-auto pb-10 md:mt-4 mt-2">
                      <Slider ref={sliderRef} {...sliderSettings}>
                        {mediaList.map((media: any, i: number) => {
                          const url =
                            typeof media === "string" ? media : media.url;
                          const type =
                            typeof media === "string"
                              ? /\.(mp4|webm|ogg)$/i.test(url)
                                ? "video"
                                : "image"
                              : media.type;

                          return (
                            <div key={i} className="px-2">
                              <div
                                className="relative xl:max-w-[451px] lg:max-w-[450px] md:max-w-[340px] max-w-[300px] md:h-[263px] h-[150px] mx-auto bg-white overflow-hidden rounded-[16px] group"
                                onClick={() => {
                                  setPreviewMedia({ url, type });
                                  setOpenPreviewModal(true);
                                }}
                              >
                                {type === "image" ? (
                                  <Image
                                    src={url}
                                    alt={`Day ${log.day} progress ${i + 1}`}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                    loading="lazy"
                                  />
                                ) : (
                                  <video
                                    src={url}
                                    className="w-full h-full object-cover"
                                    preload="metadata"
                                  />
                                )}

                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    downloadMedia(
                                      url,
                                      type,
                                      `day-${log.day}-${i + 1}`
                                    );
                                  }}
                                  className="absolute top-2 right-2 bg-white/85 p-1 md:rounded shadow-custom opacity-0 group-hover:opacity-100 transition"
                                >
                                  <Download size={16} />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </Slider>

                      {mediaList.length > show && (
                        <>
                          <Image
                            src="/testimonials/icons/left-slide.svg"
                            alt="Previous"
                            width={42}
                            height={42}
                            onClick={gotoPrev}
                            priority
                            className="absolute left-0 md:top-1/2 top-1/2  transform md:-translate-y-1/2 -translate-y-9 md:-translate-x-1/2 md:translate-x-1/1 -translate-x-1/2 cursor-pointer"
                          />
                          <Image
                            src="/testimonials/icons/right-slide.svg"
                            alt="Next"
                            width={42}
                            height={42}
                            onClick={gotoNext}
                            priority
                            className="absolute md:-right-1 -right-5  top-1/2 transform -translate-y-1/2 cursor-pointer"
                          />
                        </>
                      )}
                    </div>
                  );
                })()}
            </div>
          ))}
        </div>

        {visibleCount < currentLogs.length && (
          <div className="flex justify-center md:mt-6 mt-3">
            <Button
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              className="md:px-6 px-3 md:py-2 py-1 bg-[#3586FF] text-white md:text-[14px] text-[12px] rounded-[4px] md:rounded-[10px]"
            >
              Load More
            </Button>
          </div>
        )}
      </section>

      <Modal
        isOpen={openPreviewModal}
        closeModal={() => setOpenPreviewModal(false)}
        title={"Preview"}
        titleCls="font-medium md:text-[18px] text-[12px] text-center text-[#3586FF]"
        className="md:max-w-[800px] max-w-[320px] w-full"
        rootCls="z-[99999]"
      >
        <div className="relative md:h-[250px] h-[150px] md:rounded-[10px] rounded-[4px] ">
          {previewMedia?.type === "image" ? (
            <Image
              src={previewMedia?.url}
              alt="Preview"
              fill
              className="object-cover "
              loading="lazy"
            />
          ) : (
            <video
              src={previewMedia?.url}
              className="w-full h-full object-cover"
              preload="metadata"
            />
          )}

          <Button
            onClick={() =>
              downloadMedia(
                previewMedia?.url || "",
                previewMedia?.type || "image",
                "progress-preview"
              )
            }
            className="absolute top-2 right-2 bg-white/80 text-black  md:px-4 px-2  md:py-2 py-1 md:rounded-[10px] rounded-[4px] md:text-[14px] text-[12px] flex items-center gap-2"
          >
            <Download size={16} /> Download
          </Button>
        </div>
      </Modal>
    </div>
  );
}
