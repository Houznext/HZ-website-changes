import Button from "@/common/Button";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { InteriorCalc } from "../InteriorsCard";
import Modal from "@/common/Modal";
import CustomInput from "@/common/FormElements/CustomInput";
import SectionSkeleton from "@/common/Skeleton";
import BreadCrumb from "../../../BreadCrumb";
import { usePathname } from "next/navigation";
import { IoHeart } from "react-icons/io5";
import { useSession } from "next-auth/react";
import { useWishlistStore } from "@/store/wishlist";
import toast from "react-hot-toast";
import { PiShareFat } from "react-icons/pi";
import { FiShare2 } from "react-icons/fi";
import { useRouter } from "next/router";
import { Style } from "@mui/icons-material";
import { listItems } from "@/utils/interiorshelper";
import { CheckCircle2 } from "lucide-react";
import { MdArrowForwardIos } from "react-icons/md";
import Link from "next/link";

interface InteriorsDetailsCompProps {
  imageUrl: string;
  title: string;
  description: string;
  id: any;
}
interface ImageItem {
  id: number;
  title: string;
  description: string;
  style: string;
  roomDimension: string;
  imageUrl: { id: number; documentId: string; url: string };
  furnitureHighlights: string[];
  wallFeatures: string[];
  lighting: string[];
  storageFeatures: string[];
  roomHighlights: string[];
}

const InteriorsDetailsComp: React.FC<InteriorsDetailsCompProps> = ({
  imageUrl,
  title,
  description,
  id,
}) => {
  const pathname = usePathname();
  const path = pathname?.split("/");

  const lastSegment = path?.[2];
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleOpenQuoteModal = () => {
    setIsQuoteModalOpen(true);
  };

  const handleCloseQuoteModal = () => {
    setIsQuoteModalOpen(false);
  };
  const query = new URLSearchParams({
    title: encodeURIComponent(title),
    description: encodeURIComponent(description),
    imageUrl: encodeURIComponent(imageUrl),
  }).toString();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  });
  const {
    removeFromWishlist,
    addToWishlist,
    items: wishListItems,
  } = useWishlistStore();
  const imageListItems: ImageItem[] = Object.values(listItems).flatMap(
    (section: any) => section?.ImageList || []
  );

  const interiorData = imageListItems.find((item) => item.title === title);

  const type = "interior";
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [user, setUser] = useState<any>();
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "authenticated") {
      setUser(session?.data?.user);
    }
  }, [session?.status]);

  useEffect(() => {
    const exists = wishListItems.some(
      (wItem) => (wItem as any)?.[type]?.id === id
    );
    setIsWishlisted(exists);
  }, [wishListItems, id, type]);

  if (!interiorData) {
    return <div>No data found for this ID</div>;
  }

  const {
    style,
    roomDimension,
    furnitureHighlights,
    wallFeatures,
    lighting,
    storageFeatures,
    roomHighlights,
  } = interiorData;

  const pathSegments = router.pathname.split("/");
  const activetab = router.query.id;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) {
      toast.error("Please login to manage wishlist");
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        const wishlistItem = wishListItems.find(
          (wItem) => (wItem as any)?.[type]?.id === id
        );
        if (wishlistItem) {
          await removeFromWishlist(wishlistItem.id);
          toast.success("Removed from wishlist");
          setIsWishlisted(false);
        }
      } else {
        await addToWishlist(user.id, type, id);
        toast.success("Added to wishlist");
        setIsWishlisted(true);
      }
    } catch (error) {
      toast.error("Error updating wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = () => {
    const interiorUrl = `${window.location.origin}${router.asPath}`;
    const shareTitle = title || "Interior Design";
    const shareDescription =
      description || "Explore our interior design ideas.";
    const shareImage = imageUrl || "/fallback.jpg";

    const shareText = `
  ${shareTitle}
  ${shareDescription}
  Image: ${shareImage}
  `;

    if (navigator.share) {
      navigator
        .share({
          title: shareTitle,
          text: shareText,
          url: interiorUrl,
        })
        .then(() => console.log("Interior shared successfully"))
        .catch((error) => console.error("Error sharing:", error));
    } else {
      navigator.clipboard.writeText(interiorUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <>
      {/* <div className="md:px-6 px-0 md:py-6 py-2">
        <div className="bg-[#F0F0F0] md:text-[20x] text-[10px]">
          <BreadCrumb
            steps={[
              { label: "Our Services", link: "/services/custom-builder" },
              { label: "Interiors", link: "/interiors" },
              {
                label: lastSegment
                  ? lastSegment?.toLowerCase().replace(/\s+/g, "-")
                  : "Subservice",
                link: `/interiors/${
                  lastSegment?.toLowerCase().replace(/\s+/g, "-") ?? ""
                }`,
              },
              {
                label: (
                  <>
                    <span className="hidden md:inline">{title}</span>
                    <span className="block md:hidden">
                      {title?.length > 10 ? `${title?.slice(0, 10)}...` : title}
                    </span>
                  </>
                ),
                link: `/interiors/${lastSegment ?? ""}/${query}`,
              },
            ]}
            currentStep={title}
          />
        </div>
      </div> */}

      {loading ? (
        <SectionSkeleton type={"tiredOfMultipleOptionsSkeleton"} />
      ) : (
        <div className="flex md:flex-row flex-col w-full items-center justify-center md:mb-10 mb-5 md:gap-4 gap-2">
          <div className="relative md:w-[35%] w-full md:h-[550px] h-[200px] md:sticky md:top-0 md:self-start bg-gray-200 rounded-[10px]">
            <Image
              src={imageUrl}
              alt="Interior Image"
              fill
              className="rounded-[10px] object-cover p-2"
            />
            <div className="absolute bottom-4 left-4">
              <span className="inline-block bg-white backdrop-blur-md text-gray-900 md:px-4 px-2 md:py-2 md:rounded-[10px] rounded-[4px] md:text-lg text-[12px] font-bold">
                {style}
              </span>
            </div>
          </div>

          <div className="md:w-[50%] w-full flex flex-col md:gap-6 gap-3 md:px-6 px-1 justify-center md:mt-0 mt-3">
            <div className="w-full md:text-[12px] text-[10px] mb-4 font-medium text-gray-900">
              <div className="flex md:flex-nowrap flex-wrap items-center space-x-1">
                <Link href="/" className="underline underline-offset-2">
                  Home
                </Link>
                <span>
                  <MdArrowForwardIos size="12px" />
                </span>
                <Link
                  href="/services/custom-builder"
                  className="underline underline-offset-2"
                >
                  Our Services
                </Link>
                <span>
                  <MdArrowForwardIos size="12px" />
                </span>
                <Link
                  href="/interiors"
                  className="underline underline-offset-2"
                >
                  Interiors
                </Link>
                <span>
                  <MdArrowForwardIos size="12px" />
                </span>
                <Link
                  href={`/interiors/${lastSegment?.toLowerCase().replace(/\s+/g, "-") ?? ""
                    }`}
                  className="underline underline-offset-2"
                >
                  {lastSegment ?? "Subservice"}
                </Link>
                <span>
                  <MdArrowForwardIos size="12px" />
                </span>
                <span className="underline underline-offset-2 text-[#3586FF]">
                  <span className="hidden md:inline">{title}</span>
                  <span className="block md:hidden">
                    {title?.length > 10 ? `${title?.slice(0, 10)}...` : title}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex md:flex-row flex-col gap-2">
              <h1 className="font-medium text-[#3586FF] md:max-w-[70%] md:text-[20px] text-[18px] md:text-left text-center">
                {title}
              </h1>
              <div className="flex md:items-center justify-end gap-2">
                <Button
                  onClick={handleShare}
                  className="flex items-center justify-center md:w-10 w-6 md:h-10 h-6 bg-white hover:text-white hover:bg-[#3586FF]  border border-black rounded-full text-lg transition-colors"
                >
                  <FiShare2 className="border-black md:text-[18px] text-[14px]" />
                </Button>

                <Button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className="flex items-center justify-center md:w-10 w-6 md:h-10 h-6 bg-white hover:text-white hover:bg-[#3586FF] border border-black rounded-full text-lg transition-colors"
                >
                  <IoHeart className="border-black md:text-[18px] text-[14px]" />
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="bg-blue-50 md:rounded-[10px] rounded-[4px] md:p-5 p-3 shadow-custom">
                <h2 className="font-bold md:text-base text-sm text-blue-800 mb-3 pb-2 border-b border-blue-200">
                  {activetab} Design Details:
                </h2>

                <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-[#3586FF] md:text-sm text-xs mb-1">
                      Style
                    </span>
                    <span className="font-regular md:text-base text-sm">
                      {style}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="font-medium text-[#3586FF] md:text-sm text-xs mb-1">
                      Room Dimension
                    </span>
                    <span className="font-regular md:text-base text-sm">
                      {roomDimension}
                    </span>
                  </div>
                </div>
              </div>

              <HighlightsSection
                title="Furniture Highlights"
                items={furnitureHighlights}
              />
              <HighlightsSection title="Wall Features" items={wallFeatures} />
              <HighlightsSection title="Lighting" items={lighting} />
              <HighlightsSection
                title="Storage Features"
                items={storageFeatures}
              />
              <HighlightsSection
                title="Room Highlights"
                items={roomHighlights}
              />
            </div>
            <h2 className="text-[#7B7C83] md:text-[14px] text-[12px] font-medium md:leading-6 leading-3 md:text-left text-center">
              {description}
            </h2>
            <div className="md:pb-0 pb-1 md:px-0 px-4">
              <Button
                className="md:w-[50%] w-full md:rounded-[8px] rounded-[4px] bg-[#3586FF]  p-2 md:text-[20px] font-medium text-[12px] text-white md:static fixed bottom-0  right-0 "
                onClick={handleOpenQuoteModal}
              >
                Get Quote
              </Button>
            </div>
          </div>

          {isQuoteModalOpen && (
            <Modal
              isOpen={isQuoteModalOpen}
              closeModal={handleCloseQuoteModal}
              className="max-w-[520px] md:min-h-[630px] min-h-[500px]"
              rootCls="z-[99999]"
              label="Place"
            >
              <div className="flex flex-col items-center md:gap-4 gap-2 py-4">
                <h1 className="font-medium md:text-[20px] text-[16px] leading-[18.52px]">
                  Design for Every Budget
                </h1>
                <form>
                  <div className="flex flex-col md:gap-y-[48px] gap-y-[24px] p-5">
                    <div className="grid grid-cols-1 md:gap-5 gap-2">
                      <CustomInput
                        type="text"
                        name="name"
                        placeholder="Name"
                        className=" px-2 rounded-[4px]"
                        rootCls="px-2"
                      />
                      <CustomInput
                        type="email"
                        name="email"
                        placeholder="Email ID"
                        className=" px-2 rounded-[4px]"
                        rootCls="px-2"
                      />
                      <CustomInput
                        type="number"
                        name="phone"
                        placeholder="Phone Number"
                        className=" px-2 rounded-[4px]"
                        rootCls="px-2"
                      />
                      <div className="flex items-center gap-2 md:pl-[15px] pl-[10px]">
                        <input
                          id="whatsappUpdates"
                          type="checkbox"
                          className="w-4 h-4"
                        />
                        <label
                          htmlFor="whatsappUpdates"
                          className="text-gray-800 md:text-[16px] text-[12px]"
                        >
                          Send me updates on WhatsApp
                        </label>
                      </div>
                      <CustomInput
                        type="text"
                        name="propertyName"
                        placeholder="Property Name"
                        className=" px-2 rounded-[4px]"
                        rootCls="px-2"
                      />
                    </div>

                    <Button className="bg-[#3586FF] md:px-5 px-3 md:py-4 py-3 md:text-[16px] font-medium text-[12px] rounded-md text-white">
                      Get A Quote
                    </Button>
                  </div>
                </form>

                <p className="text-center font-regular md:text-[16px] text-[10px]">
                  By submitting this form, you agree to the{" "}
                  <span className="text-red-500">privacy policy</span> &{" "}
                  <span className="text-red-500">terms and conditions</span>.
                </p>
              </div>
            </Modal>
          )}
        </div>
      )}
      <InteriorCalc />
    </>
  );
};

export default InteriorsDetailsComp;

const HighlightsSection = ({
  title,
  items,
}: {
  title: string;
  items: string[];
}) => (
  <div className="bg-white rounded-xl p-4 shadow-sm">
    <h2 className="font-bold md:text-base text-sm text-[#3586FF] mb-3 flex items-center">
      <div className="w-1.5 h-1.5 bg-[#3586FF] rounded-full mr-2"></div>
      {title}
    </h2>
    <ul className="space-y-2.5">
      {items?.map((item, idx) => (
        <li key={idx} className="flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-[#3586FF] mt-0.5 flex-shrink-0" />
          <span className="font-regular md:text-[12px] text-[10px] text-gray-700">
            {item}
          </span>
        </li>
      ))}
    </ul>
  </div>
);
