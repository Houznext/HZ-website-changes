import Item from "../ItemsSection/item";
import React, { useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface FurnitureImage {
  id: number;
  url: string;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
  colorHex: string | null;
  angle: string | null;
  viewType: string | null;
}

interface ISimilarItemsProps {
  items: {
    id: string;
    category: string;
    subCategory?: string;
    description?: string;
    highlights?: string;
    brand?: string;
    tags?: string[];
    name: string;
    isFeatured?: boolean;
    isCustomizable?: boolean;
    customizationDescription?: string;
    deliveryTime?: string;
    warranty?: string;
    assembly?: string;
    returnPolicy?: string;
    sellerId?: number;
    design?: string;
    baseMrp?: number;
    power?: number;
    baseSellingPrice?: number;
    baseDiscountPercent?: number;
    ratingCount?: number;
    averageRating?: number;
    createdDate?: string;
    updatedDate?: Date;
    images: FurnitureImage[];
    otherProperties?: {
      [key: string]: string;
    };
  }[];
}

const SimilarItems = ({ items }: ISimilarItemsProps) => {
  const sliderRef = useRef<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const sliderSettings = {
    dots: true,
    beforeChange: (_current: number, next: number) => setCurrentSlide(next),
    infinite: items.length > 4,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 300,
    slidesToShow: 4,
    slidesToScroll: 1,
    customPaging: (i: number) => (
      <div
        className="inline-block transition-all duration-300"
        style={{
          width: i === currentSlide ? "24px" : "8px",
          height: "8px",
          borderRadius: i === currentSlide ? "4px" : "50%",
          backgroundColor: i === currentSlide ? "#3586FF" : "#ccc",
          margin: "0 4px",
        }}
      />
    ),
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 2, centerPadding: "8px" } },
    ],
  };

  if (!items?.length) return null;

  return (
    <div className="w-full">
      <h1 className="font-extrabold text-2xl">Similar products</h1>
      <div className="relative mt-5 -mx-1 md:mx-0">
        <Slider ref={sliderRef} {...sliderSettings}>
          {items.map((item) => (
            <div key={item.id} className="px-1 md:px-2">
              <Item category={"sofa-sets"} item={item} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default SimilarItems;
