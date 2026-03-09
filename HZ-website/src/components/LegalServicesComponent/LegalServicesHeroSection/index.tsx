import React, { useState } from "react";
import Image from "next/image";
import Button from "@/common/Button";
import { Tabs, Tab, Box } from "@mui/material";

export interface ILegalServicesHerosectionProps {
  heading: string;
  bgimageurl: string;
  customericon: string;
  ratingicon: string;
  listItems: Array<{
    id: number;
    title: string;
    iconurl: string;
    description: string;
  }>;
  cardItems: {
    packages: Array<{
      image?: string;
      title: string;
      description?: string;
      features: string[];
      price: string;
      buttonText: string;
      buttonLink?: string;
      originalPrice?: string;
    }>;
    services: Array<{
      image?: string;
      title: string;
      description?: string;
      features: string[];
      price: string;
      buttonText: string;
      buttonLink?: string;
      originalPrice?: string;
    }>;
  };
}

export default function LegalServicesHeroSection({
  heading,
  bgimageurl,
  customericon,
  ratingicon,
  listItems,
  cardItems,
}: ILegalServicesHerosectionProps) {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <section className="relative max-w-[1440px] mx-auto px-4 md:px-6 py-10 md:py-12 lg:py-16 overflow-hidden rounded-xl md:rounded-2xl">
      {/* Background image + overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={bgimageurl}
          alt="Property legal services background"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/40" />
      </div>

      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start justify-between">
        {/* Left content */}
        <div className="flex-1 text-white space-y-8">
          <h1 className="max-w-[730px] text-2xl md:text-4xl lg:text-5xl font-bold leading-tight md:leading-[1.3]">
            {heading}
          </h1>

          <div className="space-y-4">
            {listItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 bg-white/95 rounded-lg px-4 py-3 md:px-6 md:py-4 shadow-sm"
              >
                <div className="relative w-8 h-8 md:w-9 md:h-9 flex-shrink-0">
                  <Image
                    src={item.iconurl}
                    alt={item.title}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <h2 className="font-medium text-[13px] md:text-[15px] text-[#212227]">
                    {item.title}
                  </h2>
                  <p className="text-[11px] md:text-[13px] text-[#4B4C4F] leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap items-center gap-4 bg-[#E6F0FF] border border-[#DDDDDD] rounded-md px-3 md:px-4 py-3 md:py-4 max-w-[500px]">
            <div className="flex items-center gap-2">
              <Image
                src={customericon}
                alt="Happy customers"
                width={24}
                height={24}
                className="object-contain"
              />
              <p className="font-regular text-[11px] md:text-[13px] text-[#000]">
                1,00,000+ happy customers
              </p>
            </div>

            <span className="hidden md:inline-block w-px h-6 bg-[#DDDDDD]" />

            <div className="flex items-center gap-2">
              <Image
                src={ratingicon}
                alt="Customer rating"
                width={24}
                height={24}
                className="object-contain"
              />
              <p className="font-regular text-[11px] md:text-[13px] text-[#000]">
                4.9 / 5 · 1250+ verified reviews
              </p>
            </div>
          </div>
        </div>

        {/* Right side – Packages / Services box */}
        <div className="relative w-full max-w-[420px] bg-white rounded-xl shadow-xl border border-[#E2E4EA] flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="sticky top-0 z-10 bg-white border-b border-[#E5E7EB]">
            <Box sx={{ width: "100%" }}>
              <Tabs
                value={tabIndex}
                onChange={handleTabChange}
                aria-label="Packages and Services"
                centered
                sx={{
                  "& .MuiTab-root": {
                    color: "#4B4C4F",
                    fontSize: 14,
                    textTransform: "none",
                    fontWeight: 600,
                    fontFamily: "inherit",
                  },
                  "& .Mui-selected": {
                    color: "#3586FF",
                    fontWeight: 600,
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#3586FF",
                    height: 2,
                  },
                }}
              >
                <Tab label="Packages" className="w-1/2" />
                <Tab label="Individual Services" className="w-1/2" />
              </Tabs>
            </Box>
          </div>

          <div className="overflow-y-auto custom-scrollbar max-h-[420px] px-3 pt-3 pb-24">
            {tabIndex === 0 ? (
              <div className="flex flex-col items-stretch gap-3">
                {cardItems.packages.map((item, index) => (
                  <PackageCard key={`${item.title}-${index}`} item={item} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-stretch gap-3">
                {cardItems.services.map((item, index) => (
                  <PackageCard key={`${item.title}-${index}`} item={item} />
                ))}
              </div>
            )}
          </div>

          <div className="absolute left-0 right-0 bottom-0 px-4 pb-4 pt-2 bg-gradient-to-t from-white via-white to-white/80">
            <Button
              className="bg-[#3586FF] hover:bg-[#3586FF] transition-colors text-white w-full py-2 md:py-1 rounded-md font-medium text-[14px]"
              href="/legalservices/packages"
            >
              Select Services &amp; Packages
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

const PackageCard = ({ item }: { item: any }) => {
  return (
    <article className="w-full bg-white border border-[#E5E7EB] rounded-lg px-4 py-3 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="font-bold text-[15px] text-[#111827]">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-[12px] text-[#6B7280] leading-snug">
              {item.description}
            </p>
          )}
        </div>
      </div>

      <ul className="mt-3 space-y-1.5 list-disc list-inside text-[12px] text-[#4B5563]">
        {item.features?.map((feature: string, idx: number) => (
          <li key={idx}>{feature}</li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[#3586FF] font-medium text-[18px]">
            {item.price}
          </span>
          {item.originalPrice && (
            <span className="text-[#9CA3AF] text-[12px] line-through">
              {item.originalPrice}
            </span>
          )}
        </div>
        <Button className="border border-[#3586FF] text-[#111827] rounded-md px-3 py-1 text-[12px] font-medium bg-white hover:bg-[#EFF6FF] transition-colors">
          {item.buttonText}
        </Button>
      </div>
    </article>
  );
};
