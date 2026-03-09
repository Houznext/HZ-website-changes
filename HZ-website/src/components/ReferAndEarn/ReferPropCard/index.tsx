import React from 'react';
import Image from 'next/image';
import {
  FavouriteIcon,
  LocationBWIcon,
  RightArrow,
  ShareIcon,
} from '@/components/Icons';
import RupeesIcon, {
  BedIcon,
  BuildingIcon,
  FeaturedIcon,
} from '@/components/PropertyComp/Icons';
import Button from '@/common/Button';

const properties = [
  {
    title: 'Flats',
    data: [
      {
        id: 1,
        title: 'Aparna Heights',
        location: 'Madhapur, Hyderabad',
        price: '6L',
        bhk: '2,3 BHK',
        buildingType: 'High-rise',
        referralAmount: '2.5 Lakhs',
        imageUrl: '/referandearn/flats.png',
        featured: true,
      },
      {
        id: 2,
        title: 'Skyline Apartments',
        location: 'Gachibowli, Hyderabad',
        price: '8L',
        bhk: '3 BHK',
        buildingType: 'Apartment',
        referralAmount: '3 Lakhs',
        imageUrl: '/referandearn/flats.png',
        featured: false,
      },
      {
        id: 3,
        title: 'Prestige Villas',
        location: 'Kondapur, Hyderabad',
        price: '15L',
        bhk: '4 BHK',
        buildingType: 'Villa',
        referralAmount: '5 Lakhs',
        imageUrl: '/referandearn/test.png',
        featured: true,
      },
      {
        id: 4,
        title: 'Green Meadows',
        location: 'Kukatpally, Hyderabad',
        price: '7L',
        bhk: '2 BHK',
        buildingType: 'Gated Community',
        referralAmount: '2 Lakhs',
        imageUrl: '/referandearn/test.png',
        featured: false,
      },
      {
        id: 5,
        title: 'Luxury Heights',
        location: 'Banjara Hills, Hyderabad',
        price: '20L',
        bhk: '5 BHK',
        buildingType: 'Penthouse',
        referralAmount: '8 Lakhs',
        imageUrl: '/referandearn/test.png',
        featured: true,
      },
      {
        id: 6,
        title: 'Urban Nest',
        location: 'Manikonda, Hyderabad',
        price: '10L',
        bhk: '3 BHK',
        buildingType: 'High-rise',
        referralAmount: '3.5 Lakhs',
        imageUrl: '/referandearn/test.png',
        featured: false,
      },
    ],
  },
  {
    title: 'Plots',
    data: [
      {
        id: 1,
        title: 'Plot 1',
        location: 'Shamshabad, Hyderabad',
        price: '25L',
        bhk: 'N/A',
        buildingType: 'Residential Plot',
        referralAmount: '1.5 Lakhs',
        imageUrl: '/referandearn/plots.png',
        featured: true,
      },
      {
        id: 2,
        title: 'Plot 2',
        location: 'Shadnagar, Hyderabad',
        price: '30L',
        bhk: 'N/A',
        buildingType: 'Residential Plot',
        referralAmount: '2 Lakhs',
        imageUrl: '/referandearn/plots2.png',
        featured: false,
      },
    ],
  },
  {
    title: 'Villas',
    data: [
      {
        id: 1,
        title: 'Harmony Villas',
        location: 'Kompally, Hyderabad',
        price: '2.5 Cr',
        bhk: '4 BHK',
        buildingType: 'Independent Villa',
        referralAmount: '10 Lakhs',
        imageUrl: '/referandearn/test.png',
        featured: true,
      },
      {
        id: 2,
        title: 'Lakeside Villa',
        location: 'Kokapet, Hyderabad',
        price: '3 Cr',
        bhk: '5 BHK',
        buildingType: 'Luxury Villa',
        referralAmount: '12 Lakhs',
        imageUrl: '/referandearn/test.png',
        featured: false,
      },
      {
        id: 3,
        title: 'Green Acres Villa',
        location: 'Gandipet, Hyderabad',
        price: '2 Cr',
        bhk: '4 BHK',
        buildingType: 'Independent Villa',
        referralAmount: '9 Lakhs',
        imageUrl: '/referandearn/test.png',
        featured: false,
      },
      {
        id: 3,
        title: 'Green Acres Villa',
        location: 'Gandipet, Hyderabad',
        price: '2 Cr',
        bhk: '4 BHK',
        buildingType: 'Independent Villa',
        referralAmount: '9 Lakhs',
        imageUrl: '/referandearn/test.png',
        featured: false,
      },
    ],
  },
];

const ReferPropCard = () => {
  return (
    <div>
      <p className="font-bold text-center text-[28px] leading-[40px] text-[#4992FF] mb-[32px] mt-5">
        PROPERTIES
      </p>
      <div className="flex flex-col gap-10">
        {properties.map((category) => (
          <div key={category.title}>
            <div className="flex flex-row w-full justify-between mb-8">
              <p className="text-[30px] font-bold leading-[43px]">
                {category.title}
              </p>
              <div className="flex flex-row items-center">
                <p className="cursor-pointer">View all</p>
                <div>
                  <RightArrow />
                </div>
              </div>
            </div>
            <div className="flex flex-row flex-wrap gap-5 justify-center">
              {category.data.map((property) => (
                <div
                  key={property.id}
                  className={`flex md:flex-row flex-col gap-[20px] min-[1024px]:w-[670px] md:h-[252px] min-w-[310px] border-[2px] p-4 ${property.featured ? 'border-yellow-300' : 'border-gray-100'
                    } rounded-md`}
                >
                  <div className="relative h-[204px] md:w-[260px] w-full">
                    <Image
                      src={property.imageUrl}
                      alt={property.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-[8px]"
                    />
                    {property.featured && (
                      <div className="absolute top-[20px]">
                        <FeaturedIcon />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col w-full md:justify-between max-md:gap-5">
                    <div className="flex flex-col px-2 gap-3">
                      <div className="flex flex-row justify-between">
                        <p className="leading-[24px] text-[20px] font-medium">
                          {property.title}
                        </p>
                        <div className="flex flex-row gap-2">
                          <p className="cursor-pointer hover:opacity-50">
                            <FavouriteIcon />
                          </p>
                          <p className="cursor-pointer hover:opacity-50">
                            <ShareIcon />
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row gap-2 items-center">
                        <LocationBWIcon />
                        <p className="text-[#00000080]">{property.location}</p>
                      </div>
                      <div className="flex flex-row gap-2 items-center">
                        <div className="flex flex-row gap-1 items-center">
                          <RupeesIcon />
                          <p className="text-[#7B7C83]">{property.price}</p>
                        </div>
                        <div className="w-[1px] bg-[#7B7C83] h-[15px]"></div>
                        <div className="flex flex-row gap-1 items-center">
                          <BedIcon />
                          <p className="text-[#7B7C83]">{property.bhk}</p>
                        </div>
                        <div className="w-[1px] bg-[#7B7C83] h-[15px]"></div>
                        <div className="flex flex-row gap-1 items-center">
                          <BuildingIcon />
                          <p className="text-[#7B7C83]">
                            {property.buildingType}
                          </p>
                        </div>
                      </div>
                      <p className="bg-custom-gradient w-[200px] rounded-sm text-center font-semibold">
                        Earn {property.referralAmount} by referral
                      </p>
                    </div>
                    <div>
                      <Button className="bg-[#3586FF] py-[10px] w-full rounded-[6px] text-white font-bold">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReferPropCard;
