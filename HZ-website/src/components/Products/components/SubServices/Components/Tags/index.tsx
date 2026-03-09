import Image from "next/image";
import React from "react";

export interface ITagsProps {
  heading: string;
  tags: Array<{
    name: string;
    imageUrl: string;
  }>;
}

export const Tags = ({ heading, tags }: ITagsProps) => {
  return (
    <div className="flex flex-col items-center md:px-6 px-3">
      <h2 className="px-5 text-center font-medium text-[20px] mb-5 md:mb-10 md:text-[24px] md:leading-[34.2px]">
        {heading}
      </h2>
      <div className="hidden md:flex gap-6 md:gap-10 items-center justify-center flex-wrap">
        {tags.map((tag, index) => {
          return (
            <div
              key={`${tag.name}-${tag.imageUrl}-${index}`}
              className="border border-[#DBDBDB] shadow-md flex items-center gap-4 p-4 rounded-md"
            >
              <div className="relative w-[100px] h-[65px] md:w-[144px] md:h-[91px]">
                <Image
                  src={tag.imageUrl}
                  alt={tag.name || "tag image"}
                  className="absolute object-cover"
                  fill
                  priority
                />
              </div>
              <span className="md:text-[20px] md:leading-[28.5px] text-[16px] text-[#212227]">
                {tag.name}
              </span>
            </div>
          );
        })}
      </div>
      <div className=" md:hidden grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
        {tags.map((tag, index) => {
          return (
            <div
              key={`${tag.name}-${tag.imageUrl}-${index}`}
              className="border border-[#DBDBDB] shadow-md flex items-center md:flex-row flex-col md:gap-4 gap-2 md:p-4 p-2 rounded-md"
            >
              <div className="relative w-[130px] h-[95px] md:w-[144px] md:h-[91px]">
                <Image src={tag.imageUrl} alt={``} className="absolute" fill />
              </div>
              <span className="md:text-[20px] md:leading-[28.5px] text-[12px] text-center md:text-nowrap text-wrap text-[#212227]">
                {tag.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
