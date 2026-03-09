import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import FAQSComp from "@/components/Products/components/SubServices/Components/FAQSComp";
import InteriorsList, {
  InteriorCalc,
} from "@/components/Products/components/SubServices/InteriorsComponent/InteriorsCard";
import React from "react";
import { useRouter } from "next/router";
import SEO from '@/components/SEO';
import { listItems } from "@/utils/interiorshelper";

const InteriorsId = () => {
  const router = useRouter();
  const { id } = router.query;

  let item = id ? String(id).toLowerCase().replace("-", "") : "";

  const faqIdMap = {
    kitchen: "Kitchen",
    "living-room": "LivingRoom",
    bedrooms: "Bedroom",
    bathrooms: "Bathroom",
    "dining-room": "DiningRoom",
    "tv-unit": "TvUnit",
    "study-room": "StudyRoom",
    balconies: "Balconies",
    "pooja-room": "PoojaRoom",
    wardrobe: "Wardrobe",
    home: "Home",
    tiles: "Tiles",
  } as const;

  // Validate key
  const isValidId = (
    id: string | string[] | undefined
  ): id is keyof typeof faqIdMap => {
    return typeof id === "string" && id in faqIdMap;
  };

  const category = isValidId(id) ? faqIdMap[id] : null;

  const faqs = category ? listItems?.[category]?.faq || [] : [];

  const fetchInteriorData = (category: string) => {
    const data = listItems[category as keyof typeof listItems] as {
      heading: string;
      description: string;
      ImageList: any[];
    };

    return {
      data: data?.ImageList?.map((item) => ({
        imageUrl:
          item.imageUrl?.url ?? "/images/custombuilder/subservices/default.png",
        title: item.title,
        description: item.description,
        buttonLabel: "Get quote",
      })),
      title: data.heading,
      subTitle: data.description,
    };
  };

  const interiorsData = Object.keys(listItems).reduce((acc, key) => {
    if (key !== "id" && key !== "heading" && key !== "subHeading") {
      acc[key.toLowerCase()] = fetchInteriorData(key as keyof typeof listItems);
    }
    return acc;
  }, {} as Record<string, any>);

  const selectedData = interiorsData[item] ?? null;

  if (!selectedData) {
    return (
      <div className="text-[20px] font-medium text-center">
        Invalid category. Please check the URL.
      </div>
    );
  }

  return (
    <div>
      <SEO
        title={`${selectedData?.title || "Interior Design Ideas"
          } | Home & Office Interiors`}
        description={`${selectedData?.subTitle ||
          "Explore modern and functional interior design ideas for kitchens, living rooms, bedrooms, and more."
          } Get expert recommendations and inspiration for your dream home.`}
        keywords={`Interior Design, ${selectedData?.title || "Home Interiors"
          }, ${item} Design Ideas, Modern Interiors, Home Renovation, Stylish Interiors, Custom Interiors`}
        imageUrl={`https://www.onecasa.in/interiors/${id}`}
      />
      <InteriorsList {...selectedData} />
      <InteriorCalc />
      <FAQSComp faqs={faqs} image={"/interiors/faqs.png"} />
    </div>
  );
};
// const InteriorsId = () => {
// };

export default withGeneralLayout(InteriorsId);
