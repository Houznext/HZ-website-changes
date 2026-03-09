import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";

const PropertyCity = (props: any) => {
  const { type, count, image, city } = props;
  const router = useRouter();

  const handleRoute = () => {

    router.push({
      pathname: `/properties/buy/${city || "hyderabad"}`,
      query: {
        constructionStatus: type
      }
    })
  }
  return (
    <div className="relative md:min-h-[302px] min-h-[240px]  min-w-[170px] max-w-[170px] md:max-w-[342px] md:min-w-[322px] cursor-pointer  transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg" onClick={handleRoute}>
      <div className="absolute inset-0 z-10 rounded-[10px]  cursor-pointer transform transition-transform hover:scale-105">
        <Image
          src={image}
          alt="property type"
          layout="fill"
          objectFit="cover"
          className="rounded-[10px] "
        />
      </div>
      <div className="absolute inset-0 z-20 flex flex-col justify-end items-start text-white p-4">
        <h1 className="font-medium md:text-[16px] text-[12px] md:leading-6 leading-4">
          {count}+
        </h1>

        <h2 className="font-bold md:text-[18px] text-[16px] md:leading-7 leading-5">
          {type}
        </h2>
        <p className="md:text-[14px] text-[12px]">Properties</p>
      </div>
    </div>
  );
};

export default PropertyCity;
