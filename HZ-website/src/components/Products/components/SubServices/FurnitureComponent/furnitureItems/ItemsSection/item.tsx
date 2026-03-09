import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Button from "@/common/Button";
import { LuEye, LuShoppingCart } from "react-icons/lu";
import { IoHeart } from "react-icons/io5";
import { PiShareFat } from "react-icons/pi";
import { useSession } from "next-auth/react";
import { CartItem, useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import toast from "react-hot-toast";
import { useCompareStore } from "@/store/useCompareStore";
import CheckboxInput from "@/common/FormElements/CheckBoxInput";

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

export interface IFurnitureItem {
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
}

export interface IItemProps {
  item: IFurnitureItem;
  category: string;
  eventCount?: number;
}

const Item = ({ item, category, eventCount }: IItemProps) => {
  const router = useRouter();
  const [user, setUser] = useState<any>();
  const [addedToCart, setAddedToCart] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);
  const session = useSession();
  const { items, toggleItem } = useCompareStore();
  const isCompared = items.some((i: any) => i.id === item.id);

  const {
    removeFromWishlist,
    addToWishlist,
    items: wishListItems,
  } = useWishlistStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const ref = useRef<HTMLDivElement | null>(null);

  const currentPath = router.asPath || "";

  const type = currentPath.includes("furniture")
    ? "furniture"
    : currentPath.includes("property")
      ? "property"
      : "homeDecor";

  // GA4 path for analytics

  useEffect(() => {
    if (session.status === "authenticated") {
      setUser(session?.data?.user);
    }
  }, [session?.status, session?.data]);

  const mrp = item.baseMrp ?? item.baseSellingPrice ?? 0;
  const sellingPrice = item.baseSellingPrice ?? item.baseMrp ?? 0;

  const discountPercent =
    item.baseDiscountPercent ??
    (mrp ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0);
  const path = currentPath.includes("furnitures")
    ? "furnitures"
    : currentPath.includes("electronics")
      ? "electronics"
      : currentPath.includes("homedecor") || currentPath.includes("homeDecor")
        ? "homedecor"
        : "unknown";

  const primaryImageUrl = item.images?.[0]?.url;

  const getImageSrc = (image?: string) => {
    if (image && !image.startsWith("http") && !image.startsWith("/")) {
      return `/${image}`;
    }
    return (
      image || "/images/custombuilder/subservices/furnitures/sofas/image-1.png"
    );
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (window as any).dataLayer = (window as any).dataLayer || [];
            (window as any).dataLayer.push({
              event: "Item_Impression",
              item_id: item.id,
              item_name: item.name,
              category: category,
              price: sellingPrice,
              type: path,
            });

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 },
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [item.id, item.name, category, sellingPrice]);

  const handleRoute = () => {
    const queryCategory = router.query.category as string | undefined;

    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: "item_click",
      item_id: item.id,
      item_name: item.name,
      category: category,
      price: sellingPrice,
      discount: discountPercent,
     type: path,
    });

    const query = router.query.category;

    const cleanPath = router.asPath.split("?")[0];

    const targetUrl = {
      pathname: `${cleanPath}/${item.id}`,
      query: query ? { category: query } : undefined,
    };

    router.push(targetUrl);
  };
  const handleAddToCart = async (
    itemData: IFurnitureItem,
    userId?: string,
  ): Promise<void> => {
    if (!userId) {
      toast.error("Please login to add items to cart");
      return;
    }

    const cartStore = useCartStore.getState();

    const sellingPrice = itemData.baseSellingPrice ?? 0;
    const mrp = itemData.baseMrp ?? 0;
    const discountPercent = itemData.baseDiscountPercent ?? 0;

    const type = router.asPath.includes("furniture")
      ? "FURNITURE_PRODUCT"
      : router.asPath.includes("electronics")
        ? "ELECTRONICS_PRODUCT"
        : "HOME_DECOR_PRODUCT";

    const payload = {
      productType: type,
      productId: itemData.id,
      name: itemData.name,
      description: itemData.description ?? "",
      mrp,
      sellingPrice,
      unitDiscount: discountPercent,
      quantity: 1,
      snapshot: {
        image: itemData.images?.[0]?.url || "",
      },
    };

    const success = await cartStore.addToCart(payload, userId);
    if (success) router.push("/cart");

    setAddedToCart(true);

    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: "add_to_cart",
      item_id: itemData.id,
      item_name: itemData.name,
      category: itemData.category,
      type: path,
    });
  };

  useEffect(() => {
    const inWishlist = wishListItems?.some(
      (wishlistItem) =>
        wishlistItem.furniture?.id === item.id ||
        wishlistItem.property?.id === item.id ||
        wishlistItem.homeDecors?.id === item.id,
    );
    setIsWishlisted(inWishlist);
  }, [wishListItems, item.id]);

  const handleWishlistToggle = async () => {
    if (!user?.id) {
      toast.error("Please login to manage wishlist");
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        const wishlistItem = wishListItems.find((wItem) =>
          type === "furniture"
            ? wItem.furniture?.id === item.id
            : type === "property"
              ? wItem.property?.id === item.id
              : wItem.homeDecors?.id === item.id,
        );
        if (wishlistItem) {
          await removeFromWishlist(wishlistItem.id);
          toast.success("Removed from wishlist");
          setIsWishlisted(false);
        }
      } else {
        await addToWishlist(user?.id, type, item.id);
        toast.success("Added to wishlist");
        setIsWishlisted(true);
      }
    } catch (error) {
      toast.error("Error updating wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const HeartIcon = ({ filled }: { filled: boolean }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-8 w-8 rounded-full p-1 ${
        filled ? "text-red-500 fill-current" : "text-white"
      }`}
    >
      <path
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );

  const handleShare = (itemData: IFurnitureItem) => {
    const detailPath = `${router.asPath}/${itemData.id}`;
    const url = `${window.location.origin}${detailPath}`;

    const imageUrl = getImageSrc(primaryImageUrl);

    const shareData = {
      title: itemData.name,
      text: `Check out this amazing deal on ${itemData.name}!`,
      url,
    };

    if (navigator.share) {
      navigator
        .share(shareData)
        .then(() => toast.success("Shared successfully"))
        .catch((error) => console.error("Error sharing:", error));
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <>
      <div ref={ref}>
        <div
          className="group relative hidden md:flex flex-col p-3 rounded-xl bg-white border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:shadow-slate-300/60 cursor-pointer transition-all duration-200"
          onClick={handleRoute}
        >
          <div className="relative w-full rounded-[10px] aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
            <Image
              src={getImageSrc(primaryImageUrl)}
              alt={item.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              unoptimized
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {discountPercent > 0 && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg animate-in slide-in-from-left">
                {discountPercent}% OFF
              </div>
            )}

            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
              <Button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className="p-2.5 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg border border-slate-200 transition-all duration-200 hover:scale-110 disabled:opacity-50"
              >
                <IoHeart
                  className={`w-5 h-5 transition-colors ${
                    isWishlisted
                      ? "text-red-500"
                      : "text-slate-400 hover:text-red-400"
                  }`}
                />
              </Button>

              <Button
                onClick={() => handleShare(item)}
                className="p-2.5 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg border border-slate-200 transition-all duration-200 hover:scale-110"
              >
                <PiShareFat className="w-5 h-5 text-slate-600 hover:text-blue-500 transition-colors" />
              </Button>
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <h4 className="font-medium text-[14px] text-slate-800 mb-1 line-clamp-2 transition-colors group-hover:text-blue-600">
              {item.name}
            </h4>

            <div className="flex items-center justify-between gap-2 text-nowrap">
              <p className="text-[12px] font-medium text-slate-900">
                ₹{sellingPrice.toFixed(0)}
              </p>
              <p className="line-through text-slate-400 text-[12px]">
                ₹{mrp.toFixed(0)}
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-slate-500 ">
              <LuEye size={16} className="text-slate-400" />
              <p className="text-[12px]">
                <span className="font-medium">{eventCount ?? 0}</span> views
              </p>
            </div>
            <div
              className=" flex items-center gap-1 px-2 py-1 rounded shadow"
              onClick={(e) => e.stopPropagation()}
            >
              <CheckboxInput
                type="checkbox"
                label="Compare"
                name="compare"
                labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                checked={isCompared}
                onChange={() => toggleItem(item)}
              />
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="mt-3">
            <Button
              className="w-full bg-gradient-to-r btn-txt from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-1 md:py-2 rounded-lg font-medium shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] flex items-center justify-center gap-2"
              onClick={(e) => {
    e.stopPropagation() 
    handleAddToCart(item, user?.id)}}
            >
              <LuShoppingCart size={18} />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Mobile: compact Myntra-style vertical card (fits 2-col grid) */}
        <div
          className="md:hidden flex flex-col rounded-lg bg-white border border-gray-200 overflow-hidden shadow-sm cursor-pointer h-full"
          onClick={handleRoute}
        >
          <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-100">
            <Image
              src={getImageSrc(primaryImageUrl)}
              alt={item.name}
              fill
              className="object-cover"
              unoptimized
            />
            {discountPercent > 0 && (
              <span className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                {discountPercent}% OFF
              </span>
            )}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleWishlistToggle();
              }}
              disabled={wishlistLoading}
              className="absolute top-1 right-1 p-1 rounded-full bg-white/90 shadow-sm"
            >
              <HeartIcon filled={isWishlisted} />
            </Button>
          </div>
          <div className="p-2 flex flex-col gap-0.5 min-h-0 flex-1">
            <h3 className="text-[11px] font-medium text-gray-900 line-clamp-2 leading-tight">
              {item.name}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              <span className="text-xs font-semibold text-gray-900">
                ₹{sellingPrice.toFixed(0)}
              </span>
              {mrp > sellingPrice && (
                <>
                  <span className="text-[10px] text-gray-400 line-through">
                    ₹{mrp.toFixed(0)}
                  </span>
                  {discountPercent > 0 && (
                    <span className="text-[10px] text-green-600 font-medium">
                      {discountPercent}% off
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-0.5 text-[10px] text-gray-500 mt-0.5">
              <LuEye size={12} />
              <span>{eventCount ?? 0}</span>
            </div>
            <Button
              className="w-full mt-1.5 bg-[#3586FF] text-white py-1.5 rounded text-[11px] font-medium"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(item, user?.id);
              }}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Item;
