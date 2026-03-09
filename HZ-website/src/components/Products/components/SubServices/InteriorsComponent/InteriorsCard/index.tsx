import Button from "@/common/Button";
import BreadCrumb from "../../../BreadCrumb";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SectionSkeleton from "@/common/Skeleton";
import { useWishlistStore } from "@/store/wishlist";
import toast from "react-hot-toast";
import { IoHeart } from "react-icons/io5";
import { useSession } from "next-auth/react";
interface InteriorsCardProps {
  key: string;
  imageUrl: string; 
  title: string;
  description: string;
  buttonLabel: string;
  item: { id: string;[key: string]: any };
  type: string;
}

const InteriorsCard = ({
  key,
  imageUrl,
  title,
  description,
  buttonLabel,
  item,
  type,
}: InteriorsCardProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleCardClick = () => {
    const query = new URLSearchParams({
      title: encodeURIComponent(title),
      description: encodeURIComponent(description),
      imageUrl: encodeURIComponent(imageUrl),
    }).toString();

    router.push(`${pathname}/${query}`);
  };
  const {
    removeFromWishlist,
    addToWishlist,
    items: wishListItems,
  } = useWishlistStore();

  // useEffect(() => {
  //   const exists = wishListItems.some((wItem) => wItem.interior?.id === item.id);
  //   setIsWishlisted(exists);
  // }, [wishListItems, item.id]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [user, setUser] = useState<any>();
  const session = useSession();
  useEffect(() => {
    if (session.status === "authenticated") {
      setUser(session?.data?.user);
    }
  }, [session?.status]);
  useEffect(() => {
    const exists = wishListItems.some(
      (wItem) => (wItem as any)?.[type]?.id === item.id
    );
    setIsWishlisted(exists);
  }, [wishListItems, item.id, type]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click
    if (!user?.id) {
      toast.error("Please login to manage wishlist");
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        const wishlistItem = wishListItems.find(
          (wItem) => (wItem as any)?.[type]?.id === item.id
        );
        if (wishlistItem) {
          await removeFromWishlist(wishlistItem.id);
          toast.success("Removed from wishlist");
          setIsWishlisted(false);
        }
      } else {
        await addToWishlist(user.id, type, item.id);
        toast.success("Added to wishlist");
        setIsWishlisted(true);
      }
    } catch (error) {
      toast.error("Error updating wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div
      className="md:max-w-[313px] max-w-[150px] md:min-h-[370px] min-h-[180px]  w-full shadow-custom rounded-[8px] hover:scale-105 cursor-pointer transition-all duration-300 ease-in-out sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4 bg-gray-100 border border-black"
      onClick={() => handleCardClick()}
    >
      <div className="relative md:w-[313px] w-[150px] md:h-[200px] h-[110px] md:mb-2 mb-0   rounded-[8px]">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover p-2 md:rounded-[10px] rounded-[4px]"
        />
        <Button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          className="p-1 rounded-full absolute bg-white/10 border border-white/20 backdrop-blur-md top-3 right-3"
        >
          <IoHeart
            className={`w-6 h-6 ${isWishlisted ? "text-red-600" : "text-white hover:text-red-400"
              }`}
          />
        </Button>
      </div>
      <div className="flex flex-col md:gap-2 gap-0.5 px-4 py-3">
        <p className="md:text-[14px] text-[10px] font-medium text-gray-600  text-center  mb-3  md:h-[46px] h-auto md:mb-4 ">
          {title}
        </p>
        <Button className="md:rounded-[8px] rounded-[4px] hover:text-white hover:bg-[#3586FF]border-2 font-bold md:text-[16px] text-[10px] text-white bg-[#3586FF] border-blue-400 md:p-2 p-0.5  hover:bg-[5297FF]">
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};

export const InteriorCalc = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  });
  return (
    <>
      {loading ? (
        <SectionSkeleton type={"tiredOfMultipleOptionsSkeleton"} />
      ) : (
        <div
          className="w-full flex flex-row md:px-6  px-3 items-center justify-center cursor-pointer md:mt-0 mt-2"
          onClick={() => router.push("/interiors/cost-estimator")}
        >
          <div className="w-[40%] h-[357px] relative md:block hidden">
            <Image
              src="/Interiors/interiors_cal.png"
              alt=" interior_cal"
              fill
              className="rounded-[4px] object-cover"
            />
          </div>
          <div className="md:py-[68px] py-[44px] md:w-[50%] w-[90%] md:px-[80px] px-[40px] flex flex-col items-center justify-center md:gap-6  gap-3 bg-color-gradient rounded-[4px] md:ml-0 ml-3">
            <h1 className="md:text-[32px] text-[20px] font-bold max-w-[536px] text-center">
              Interior Design Budget Calculator
            </h1>
            <h2 className="md:mb-[24px] mb-[16px] md:text-[16px] text-[12px] text-center text-gray-700 font-medium max-w-[436px]">
              Get an approximate budget for your home interior design by sharing
              your space details.
            </h2>
            <Button className="md:w-[240px] w-[180px] bg-[#3586FF] md:rounded-[8px] rounded-[4px] md:p-3 p-2 md:text-[20px] text-[14px] font-bold  text-white hover:opacity-80">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

const InteriorsList = ({
  title,
  subTitle,
  data,
}: {
  title: string;
  subTitle: string;
  data: Array<any>;
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const lastSegment = pathname?.split("/")?.filter(Boolean).pop();
  const formattedLabel = lastSegment?.toLowerCase().replace(/\s+/g, "-");

  const sliderRef = useRef<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (data && data.length > 0) {
      setLoading(false);
    }
  }, [data]);

  return (
    <div className="px-6 py-6">
      <div className="bg-[#F0F0F0] md:text-[20x] text-[12px]">
        <BreadCrumb
          steps={[
            { label: "Our Services", link: "/services/custom-builder" },
            { label: "Interiors", link: "/interiors" },
            {
              label: formattedLabel
                ? formattedLabel.charAt(0).toUpperCase() +
                formattedLabel.slice(1)
                : "Subservice",
              link: `/interiors/${formattedLabel ?? ""}`,
              onClick: () => {
                if (router.asPath === `/interiors/${formattedLabel}`) {
                  router.replace(router.asPath);
                } else {
                  router.push(`/interiors/${formattedLabel}`);
                }
              },
            },
          ]}
          currentStep={
            formattedLabel
              ? formattedLabel.charAt(0).toUpperCase() + formattedLabel.slice(1)
              : "Subservice"
          }
        />
      </div>
      <div className="mb-10 flex flex-col md:gap-4 gap-2 md:mt-[64px] mt-[20px]">
        <h1 className="md:text-[24px] text-[18px]  font-medium md:text-left text-center md:leading-9 leading-5">
          {title}
        </h1>
        <h2 className="md:text-[16px] text-[12px] font-medium md:text-left text-center md:leading-9 leading-6 text-[#7B7C83]">
          {subTitle}
        </h2>
      </div>
      {loading ? (
        <SectionSkeleton type={"propertiesSkeleton"} />
      ) : (
        <div className=" flex flex-wrap items-center justify-center md:gap-y-8 gap-y-6 md:gap-x-4 gap-x-3">
          {data.map((item: any) => (
            <InteriorsCard
              key={item.id}
              imageUrl={item.imageUrl}
              title={item.title}
              description={item.description}
              buttonLabel={item.buttonLabel}
              item={item}
              type="interior"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InteriorsList;
