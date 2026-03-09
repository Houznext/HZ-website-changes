import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";

const PopularBuilders = (props: any) => {
  const { image, name, projects, slug, id, projectsincity } = props;
  const router = useRouter();
  return (
    <div
      className="flex cursor-pointer bg-white gap-6 items-center rounded-[8px] shadow-custom max-w-[460px] min-h-[180px] px-[24px] py-[48px]"
      onClick={() => router.push(`/company/${slug}?id=${id}`)}
    >
      <div className="h-[86px] w-[86px] relative ">
        <Image
          src={image}
          alt="popular-builders"
          layout="fill"
          objectFit="cover "
          className="rounded-full"
        />
      </div>
      <div>
        <h1 className="md:text-[20px] text-[14px] font-medium leading-8">
          {name}
        </h1>
        <h2 className="font-regular md:text-[16px] text-[12px] text-[#7B7C83] leading-6">
          {projects} Total Projects | {projectsincity} in this City
        </h2>
      </div>
    </div>
  );
};

export default PopularBuilders;
