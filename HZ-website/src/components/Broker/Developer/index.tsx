import Link from "next/link";
import React from "react";

const PackageDeveloper = () => {
  const developerData = [
    {
      title: "Banners",
      description:
        "Get your brand noticed by property buyers by securing brand space on India's top real estate website",
      bgColor: "bg-orange-50",
      price: null
    },
    {
      title: "Featured Listing",
      description:
        "Provides guaranteed prominence and exposure in preferred locality",
      bgColor: "bg-blue-50",
      price: null
    },
    {
      title: "Featured Project",
      description:
        "Recommended product for getting new booking buyer leads for the primary clients",
      bgColor: "bg-orange-50",
      price: null
    },
    {
      title: "Premium Plan",
      description:
        "Let your property stand out from the crowd with larger display on search results and added animation to attract buyers",
      bgColor: "bg-blue-50",
      price: "₹899 Onwards"
    },
    {
      title: "Premium Plan",
      description:
        "Let your property stand out from the crowd with larger display on search results and added animation to attract buyers",
      bgColor: "bg-orange-50",
      price: "₹899 Onwards"
    },
    {
      title: "Premium Plan",
      description:
        "Let your property stand out from the crowd with larger display on search results and added animation to attract buyers",
      bgColor: "bg-blue-50",
      price: "₹899 Onwards"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {developerData.map((card, index) => (
        <div
          key={index}
          className={`flex flex-col justify-between ${card.bgColor} rounded-xl p-6`}
        >
          <div className="flex flex-col items-start">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {card.title}
            </h3>
            <p className="text-gray-700 mb-2 font-regular w-[200px] md:w-[500px] text-left">
              {card.description}
            </p>
          </div>
          <Link
            href="#"
            className="text-[#3586FF] font-medium hover:underline inline-flex items-center mt-4"
          >
            Know More <span className="ml-1">→</span>
          </Link>
        </div>
      ))}
    </div>

  );
};

export default PackageDeveloper;
