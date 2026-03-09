import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";

const PropertyTypes = (props: any) => {
  const { type, count, image, url } = props;
  const router = useRouter();
  return (
    <div
      className="relative md:min-h-[342px] cursor-pointer min-h-[240px] min-w-[170px] max-w-[170px] md:max-w-[342px] md:min-w-[312px] transition-transform hover:scale-[1.01] hover:shadow-lg duration-300"
      onClick={() => router.push(url)}
    >
      <div className="absolute inset-0 z-10 rounded-[10px]  cursor-pointer transform transition-transform hover:scale-105">
        <Image
          src={image}
          alt="property type"
          layout="fill"
          objectFit="cover"
          className="rounded-[10px] "
        />
      </div>
      <div className="absolute inset-0 z-20 flex flex-col justify-start items-start text-white md:p-4 p-3">
        <h1 className="font-Gordita-bold md:text-[20px] text-[14px] md:leading-7 leading-4">
          {type}
        </h1>
        <h2 className="font-medium md:text-[16px] text-[12px] md:leading-6 leading-3">
          {count}+{" "}
        </h2>
        <p>Properties</p>
      </div>
    </div>
  );
};

export default PropertyTypes;
