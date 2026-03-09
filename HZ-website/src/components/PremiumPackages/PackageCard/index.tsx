// pages/packages/index.tsx
import React, { useEffect, useState } from 'react';
import Image from "next/image";
import { useRouter } from 'next/router';
import Button from '@/common/Button';
import PackageBroker from '@/components/Broker';
import PackageDeveloper from '@/components/Broker/Developer';

const PackageCard = () => {
    const router = useRouter();

    const getTabFromQuery = () => {
        const tab = router.query.tab;
        if (tab === "developer") return "developer";
        return "broker";
    };

    const [activeTab, setActiveTab] = useState("broker");

    useEffect(() => {
        if (router.isReady) {
            setActiveTab(getTabFromQuery());
        }
    }, [router.isReady, router.query]);

    const handleTabClick = (tab: string) => {
        router.push(
            {
                pathname: "/packages",
                query: { tab },
            },
            undefined,
            { shallow: true } // prevents full reload
        );
    };

    const logo_place_holder = {
        packagesImage: "/images/packagebg.jpg",
        imageUrl: "/images/logobb.png",
        link: "/",
    };

    return (
        <div className="flex flex-col ">
            <Image
                src={logo_place_holder.packagesImage}
                alt="Tab Image"
                fill
                className="object-cover h-[400px] relative rounded-b-lg shadow-md overflow-hidden"
            />

            <div className="flex space-x-4 mt-4 m-7 gap-6 ">
                <Button
                    onClick={() => handleTabClick("broker")}
                    className={`relative md:py-[8px] py-[12px] md:px-[18px] font-medium px-[27px] rounded-none border-none bg-transparent focus:outline-none text-[19px]
                        hover:bg-gray-100
                        after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#3586FF] after:transition-all after:duration-300 after:ease-in-out
                        ${activeTab === "broker" ? "text-[#3586FF] after:w-full" : "text-black after:w-0"}
                    `}
                >
                    Broker
                </Button>

                <Button
                    onClick={() => handleTabClick("developer")}
                    className={`relative md:py-[8px] py-[12px] font-medium md:px-[18px] px-[27px] rounded-none border-none bg-transparent focus:outline-none text-[19px]
                        hover:bg-gray-100
                        after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#3586FF] after:transition-all after:duration-300 after:ease-in-out
                        ${activeTab === "developer" ? "text-[#3586FF] after:w-full" : "text-black after:w-0"}
                    `}
                >
                    Developer
                </Button>
            </div>

            <div className="m-7 text-center">
                {activeTab === "broker" ? <PackageBroker /> : <PackageDeveloper />}
            </div>
        </div>
    );
};

export default PackageCard;
