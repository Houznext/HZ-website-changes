import React from 'react'
import Image from 'next/image'
import { CiLocationOn } from 'react-icons/ci';
import { BiRupee } from 'react-icons/bi';
import { FaRulerCombined } from 'react-icons/fa';
import Button from '@/common/Button';
import { generateSlug } from '@/utils/helpers';
import { useRouter } from 'next/router';
const MoreProjectCard = ({ newProperty, key, activetab, city }: { newProperty: any, key: number, activetab?: string, city?: string }) => {
    const router = useRouter()
    const formatPrice = (price: number): string => {
        if (price >= 10000000) {
            return `${(price / 10000000).toFixed(1)} Cr`;
        } else if (price >= 100000) {
            return `${(price / 100000).toFixed(1)} L`;
        } else {
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }).format(price);
        }
    };
    return (
        <div
            className="p-3 md:p-4 border shadow-custom border-gray-300 rounded-md w-full max-w-[170px] md:max-w-[270px] flex-shrink-0"
            key={newProperty.propertyId + key}
        >
            <div className="md:h-[147px] h-[105px] w-full relative md:mb-4 mb-2 overflow-hidden">
                <Image
                    src={
                        newProperty?.mediaDetails?.propertyImages[0] ||
                        "/orders/no-orders.jpeg"
                    }
                    alt={newProperty?.propertyDetails?.propertyName ?? ""}
                    layout="fill"
                    className="object-cover md:rounded-[10px] rounded-[4px]"
                    sizes="(max-width: 640px) 150px, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 30vw"
                />
                <p className="absolute top-1 left-1 bg-[#3586FF] text-white md:text-[12px] text-[10px] md:px-4 px-2 md:py-[4px] py-[2px] rounded-md font-medium">
                    {newProperty?.propertyType?.typeName}
                </p>
            </div>

            <h3 className="font-medium md:text-[14px] text-[13px] md:leading-[18.5px] leading-[14.8px] text-black md:text-nowrap text-wrap mb-1">
                {newProperty?.Name}
            </h3>

            <div className="flex items-center gap-1">
                <CiLocationOn className="md:text-[12px] text-[10px] text-gray-700" />
                <p className="text-gray-500 md:text-[14px] text-[11px] text-nowrap">
                    {newProperty?.location?.locality},{" "}
                    {newProperty?.location?.city}
                </p>
            </div>

            <div className="border border-[#E9E9E9] md:my-2 my-2"></div>

            <div className="grid grid-cols-1 xl:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 md:gap-y-4 gap-y-1 lg:gap-x-4 md:gap-x-3 gap-x-1">
                <div className="flex items-center justify-start gap-1.5 md:gap-2.5 lg:gap-0.5">
                    <BiRupee className="md:text-[12px] text-[10px]" />
                    <span className="text-[#3586FF] text-nowrap md:text-[12px] text-[11px]">
                        ₹{formatPrice(newProperty?.minPrice)} - ₹
                        {formatPrice(newProperty?.maxPrice)}
                    </span>
                </div>
                <div className="flex items-center justify-start gap-1.5 md:gap-2.5 lg:gap-1.5">
                    <FaRulerCombined className="md:text-[12px] text-[10px]" />
                    <span className="text-[#3586FF] md:text-[12px] text-[12px] md:text-nowrap text-wrap">
                        {newProperty?.ProjectArea?.size}{" "}
                        {newProperty?.ProjectArea?.unit}
                    </span>
                </div>
            </div>

            <Button
                className="block w-full rounded-md text-center md:py-1 md:text-[14px] text-[12px] md:px-6 px-3 py-[3px] bg-[#3586FF] font-medium md:leading-[22.8px] leading-[18.52px] text-white md:mt-3 mt-2"
                onClick={() => {
                    const slug = generateSlug(newProperty?.Name);
                    router.push(
                        `/properties/${activetab}/${city}/details/${slug}?id=${newProperty?.id}&type=project`
                    );
                }}
            >
                View Property
            </Button>
        </div>
    )
}

export default MoreProjectCard