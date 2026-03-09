import React, { useEffect, useState } from "react";
import CommonTheWayWeWork, {
  ICommonTheWayWeWorkProps,
} from "../Components/CommonTheWayWeWork";
import { IOurProjectsProps, OurProjects } from "../Components/OurProjects";
import { ITagsProps, Tags } from "../Components/Tags";
import TestimonialsSection, {
  ITestimonialsSectionProps,
} from "../Components/TestimonialsSection";
import { RoutebreadCrumbs } from "@/components/RouteBreadCrumbs";
import BlogCard from "@/components/BlogCard";
import apiClient from "@/utils/apiClient";
import BreadCrumb from "../../BreadCrumb";
import Button from "@/common/Button";
import MobileBlogCard from "@/components/MobileBlogCard";
import GoogleAdSense from "@/components/GoogleAdSense";

const testimonialsData: ITestimonialsSectionProps = {
  words: [
    {
      name: "Nisha",
      desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem",
      rating: 4,
    },
    {
      name: "Nisha",
      desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem",
      rating: 4,
    },
    {
      name: "Nisha",
      desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem",
      rating: 4,
    },
    {
      name: "Nisha",
      desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem",
      rating: 4,
    },
  ],
};

const theWayWeWorkData: ICommonTheWayWeWorkProps = {
  heading: "The Way We Work",
  subHeading: "We help you at every step of your house construction journey.",
  steps: [
    {
      stepIcon: "/icons/custom-builder/subservices/expand.svg",
      stepname: "Explain your need",
    },
    {
      stepIcon: "/icons/custom-builder/subservices/house-cost.svg",
      stepname: "Cost & Planning",
    },
    {
      stepIcon: "/icons/custom-builder/subservices/execution.svg",
      stepname: "Work Execution",
    },
    {
      stepIcon: "/icons/custom-builder/subservices/delivery-service.svg",
      stepname: "Delivery",
    },
  ],
};

const ourProjects: IOurProjectsProps = {
  heading: "Our Projects",
  projects: [
    {
      imageUrl: "/images/custombuilder/subservices/project-image.png",
      title: "Residential Construction Project",
      descriptionPoints: ["CBD, Bengaluru"],
    },

    {
      imageUrl: "/images/custombuilder/subservices/project-image.png",
      title: "Residential Construction Project",
      descriptionPoints: ["CBD, Bengaluru"],
    },
    {
      imageUrl: "/images/custombuilder/subservices/project-image.png",
      title: "Residential Construction Project",
      descriptionPoints: ["CBD, Bengaluru"],
    },
  ],
};

const categoriesdata: ITagsProps = {
  heading: "Categories",
  tags: [
    {
      imageUrl: "/images/custombuilder/subservices/category-image.png",
      name: "Retail & Commercial Building",
    },
    {
      imageUrl: "/images/custombuilder/subservices/category-image.png",
      name: "Showroom/Retail Outlet",
    },
    {
      imageUrl: "/images/custombuilder/subservices/category-image.png",
      name: "Corporate Office",
    },
    {
      imageUrl: "/images/custombuilder/subservices/category-image.png",
      name: "Hotel/Resort",
    },
    {
      imageUrl: "/images/custombuilder/subservices/category-image.png",
      name: "Hospital Building",
    },
    {
      imageUrl: "/images/custombuilder/subservices/category-image.png",
      name: "Farm/ Guest House",
    },
  ],
};

const ConstructionForBusinessComponent = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const fetchBlogs = async () => {
    try {
      const res = await apiClient.get(apiClient.URLS.blogs, {
        blogType: "Residential construction",
      });
      console.log("lohhh", res);
      setBlogs(res?.body?.blogs);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setLoading(false);
    }
  };
  const blogsToShow = showMore ? blogs : blogs.slice(0, 4);

  useEffect(() => {
    fetchBlogs();
  }, []);
  const [showAll, setShowAll] = useState(false);
  const blogsToShowall = showAll ? blogs : blogs.slice(0, 3);

  const handleshowall = () => {
    setShowAll(!showAll);
  };
  return (
    <div>
      <div className="mb-[35px] md:mb-[64px]">
        <Tags {...categoriesdata} />
      </div>
      <div className="mb-[35px] md:mb-[64px]">
        <OurProjects {...ourProjects} />
      </div>
      <div className="md:px-8 px-3 mb-[45px] max-w-[98%] mx-auto md:mb-[64px] flex flex-col items-center gap-4">
        <GoogleAdSense />
      </div>

      <div className="mb-[35px] md:mb-[64px]">
        <CommonTheWayWeWork {...theWayWeWorkData} />
      </div>
      <div className="mb-[35px] md:mb-[64px]">
        <TestimonialsSection {...testimonialsData} />
      </div>
      <div className="flex flex-col items-center gap-y-[20px] mb-[45px] md:mb-[64px]">
        <div className="md:flex flex-col justify-center items-center gap-4  hidden">
          <h1 className="text-black font-medium md:font-bold text-[24px] md:text-[25px]  text-start">
            Our Blog
          </h1>
          <h2 className="text-[#7B7C83] leading-[28.5px] text-[20px]">
            Latest Blog & Articles
          </h2>
        </div>
        <div className="max-w-[398px] min-h-[29px] flex items-center gap-x-[231px] md:hidden">
          <div className="max-w-[109px] min-h-[29px] ">
            <h1 className="text-[#000000] font-medium text-[20px] leading-[28.5px]">
              Our Blogs
            </h1>
          </div>
          {blogs.length > 3 && (
            <div className="max-w-[69px] min-h-[23px] ">
              <Button
                className="text-[#3586FF] text-[16px] leading-[22.8px] text-nowrap font-medium"
                onClick={() => handleshowall()}
              >
                {showAll ? "View Less" : "View All"}
              </Button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap md:flex-row flex-col justify-center items-center gap-5 ">
          {blogs.length > 0 ? (
            blogsToShow.map((blog, index) => (
              <>
                <div
                  key={index}
                  className={`rounded-[12px] shadow-md md:max-w-[332px] hidden md:block`}
                >
                  <BlogCard data={blog} />
                </div>
              </>
            ))
          ) : loading ? (
            <p>Loading blogs...</p>
          ) : (
            <p>No blogs found.</p>
          )}
          {blogsToShowall.map((blog, index) => (
            <div
              key={index}
              className="rounded-[12px] shadow-md flex flex-col gap-y-[8px] items-center md:hidden"
            >
              <MobileBlogCard data={blog} />
            </div>
          ))}
        </div>

        {blogs.length > 4 && (
          <div className="md:flex justify-center mt-5 hidden">
            <button
              className="bg-[#3586FF] text-white px-4 py-2 rounded-lg"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? "See Less" : "See More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConstructionForBusinessComponent;
