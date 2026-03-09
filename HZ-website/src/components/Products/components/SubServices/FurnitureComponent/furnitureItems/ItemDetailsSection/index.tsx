import BreadCrumb from "@/components/Products/components/BreadCrumb";
import { ShoppingBag, ShoppingCartOutlined, Star } from "@mui/icons-material";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import RecentlyViewed from "./RecentlyViewed";
import Footer from "@/components/Footer";
import SimilarItems from "./SimilarItems";
import FAQSComp from "../../../Components/FAQSComp";
import apiClient from "@/utils/apiClient";
import Loader from "@/components/Loader";
import ReviewSection from "./ReviewSection";
import { useRouter } from "next/router";
import Button from "@/common/Button";
import SEO from "@/components/SEO";
import { CartItem, useCartStore } from "@/store/cart";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { mapElectronicsToProduct } from "@/utils/electronicsMapper";

interface FurnitureImage {
  id: number | string;
  url: string;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
  colorHex: string | null;
  angle: string | null;
  viewType: string | null;
}

interface FurnitureVariant {
  id: string;
  sku: string;
  colorName?: string;
  colorHex?: string;
  material?: string;
  finish?: string;
  sizeLabel?: string;
  widthCm?: number;
  depthCm?: number;
  heightCm?: number;
  weightKg?: number;
  maxLoadKg?: number;
  stockQty: number;
  reservedQty: number;
  mrp: number;
  sellingPrice: number;
  discountPercent: number;
  isDefault: boolean;
  isActive: boolean;
  images: FurnitureImage[];
}

interface Offer {
  code: string;
  type: string;
  title: string;
  validTo?: string;
  validFrom?: string;
  description?: string;
}

interface Product {
  id: string | number;
  slug?: string;
  category: string;
  subCategory?: string;
  description?: string;
  highlights?: string;
  brand?: string;
  tags?: string[] | null;
  name: string;
  status?: string;
  isFeatured?: boolean;
  isCustomizable?: boolean;
  customizationDescription?: string;
  deliveryTime?: string;
  warranty?: string;
  assembly?: string;
  returnPolicy?: string;
  offers?: Offer[] | null;
  applicableCouponCodes?: string[] | null;
  sellerId?: number | null;
  baseMrp?: number;
  power?: number;
  baseSellingPrice?: number;
  baseDiscountPercent?: number;
  ratingCount?: number;
  averageRating?: number;
  createdDate?: string;
  updatedDate?: Date;
  images: FurnitureImage[];
  variants?: FurnitureVariant[];
  otherProperties?: Record<string, string | number>;
  design?: string;
}

interface ViewedItem {
  id: string | number;
  name: string;
}

/** Raw home decor API response shape */
interface HomeDecorProductResponse {
  id: string;
  name: string;
  slug?: string | null;
  price?: string;
  prodDetails?: string;
  discount?: string;
  category?: string;
  images?: string[];
  design?: string;
  color?: string;
  shape?: string;
  otherProperties?: Record<string, string | number>;
  deliveryTime?: string;
  assembly?: string;
  warranty?: string;
  brand?: string;
  returnPolicy?: string | null;
  offers?: Offer[] | null;
  applicableCouponCodes?: string[] | null;
  rating?: number;
}

function mapHomeDecorToProduct(raw: HomeDecorProductResponse): Product {
  const priceNum = parseFloat(raw.price ?? "0") || 0;
  const discountNum = parseFloat(raw.discount ?? "0") || 0;
  const mrpNum =
    discountNum > 0 && discountNum <= 100
      ? Math.round(priceNum / (1 - discountNum / 100))
      : priceNum;
  const images: FurnitureImage[] = (raw.images ?? []).map((url, i) => ({
    id: i + 1,
    url,
    alt: null,
    sortOrder: i,
    isPrimary: i === 0,
    colorHex: null,
    angle: null,
    viewType: null,
  }));
  const otherProps = { ...(raw.otherProperties || {}) };
  if (raw.color) otherProps.color = raw.color;
  if (raw.shape) otherProps.shape = raw.shape;
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug ?? undefined,
    category: raw.category ?? "",
    description: raw.prodDetails,
    baseSellingPrice: priceNum,
    baseMrp: mrpNum,
    baseDiscountPercent: discountNum,
    ratingCount: 0,
    averageRating: raw.rating ?? 0,
    images,
    otherProperties: Object.keys(otherProps).length ? otherProps : undefined,
    design: raw.design,
    deliveryTime: raw.deliveryTime,
    assembly: raw.assembly,
    warranty: raw.warranty,
    brand: raw.brand,
    returnPolicy: raw.returnPolicy ?? undefined,
    offers: raw.offers ?? undefined,
    applicableCouponCodes: raw.applicableCouponCodes ?? undefined,
  };
}

const faqs = [
  {
    question: "How do I choose the right paint color for my space?",
    answer:
      "Choosing the right paint color depends on factors like room size, lighting, and personal preference. Our experts can guide you through the process by offering color consultations and suggesting shades that match your style and enhance your space.",
  },
  {
    question: "How long does a typical painting project take?",
    answer:
      "The duration of a painting project depends on the size of the area being painted and the complexity of the work. Most residential projects can be completed in a few days, while larger commercial spaces may take longer. We’ll provide you with a timeline during the consultation.",
  },
  {
    question: "What should I do to prepare my home for painting?",
    answer:
      "Before we start, it’s helpful to remove fragile items, furniture, and decor from the rooms being painted. Our team will cover and protect floors, fixtures, and furniture that can’t be moved to ensure everything stays clean and undamaged during the process.",
  },
  {
    question: "How often should I repaint my home?",
    answer:
      "On average, interior walls should be repainted every 5-7 years, depending on wear and tear. Exterior surfaces may need repainting every 5-10 years, depending on weather conditions and the quality of the previous paint job.",
  },
  {
    question: "Do I need to be home during the painting process?",
    answer:
      "It’s not necessary for you to be present while we paint, but some clients prefer to be home to monitor progress. Our team is professional and trustworthy, so you can feel confident leaving us to complete the job.",
  },
];

const ProductItemDetails = () => {
  const router = useRouter();
  const detailsParam = router.query.details ?? router.query["details"];
  const id = typeof detailsParam === "string" ? detailsParam : Array.isArray(detailsParam) ? detailsParam[0] : undefined;
  const session = useSession();
  const [user, setUser] = useState<any>();

  const items = [
    {
      id: "1",
      name: "Luxury Fabric Sofa Set",
      baseSellingPrice: 25999,
      material: "fabric",
      images: [
        "/images/custombuilder/subservices/furnitures/sofas/image-1.png",
      ],
      baseDiscountPercent: 15,
      createdDate: "2023-09-15",
      category: "Sofas",
    },
    {
      id: "2",
      name: "Modern Metal Dining Table",
      baseSellingPrice: 42999,
      material: "metal",
      images: [
        "/images/custombuilder/subservices/furnitures/sofas/image-1.png",
      ],
      baseDiscountPercent: 25,
      createdDate: "2024-01-20",
      category: "Dining",
    },
    {
      id: "3",
      name: "Classic Rosewood Bed",
      baseSellingPrice: 59999,
      material: "rosewood",
      images: [
        "/images/custombuilder/subservices/furnitures/sofas/image-1.png",
      ],
      baseDiscountPercent: 30,
      createdDate: "2024-04-10",
      category: "Bed Room",
    },
    {
      id: "4",
      name: "Teakwood Wardrobe",
      baseSellingPrice: 38999,
      material: "teakwood",
      images: [
        "/images/custombuilder/subservices/furnitures/sofas/image-1.png",
      ],
      baseDiscountPercent: 10,
      createdDate: "2023-07-22",
      category: "Storage",
    },
    {
      id: "5",
      name: "Leather Recliner Sofa",
      baseSellingPrice: 79999,
      material: "fabric",
      images: [
        "/images/custombuilder/subservices/furnitures/sofas/image-1.png",
      ],
      baseDiscountPercent: 20,
      createdDate: "2023-11-01",
      category: "Sofas",
    },
    {
      id: "6",
      name: "Minimalist Metal Coffee Table",
      baseSellingPrice: 14999,
      material: "metal",
      images: [
        "/images/custombuilder/subservices/furnitures/sofas/image-1.png",
      ],
      baseDiscountPercent: 5,
      createdDate: "2024-05-30",
      category: "Tables",
    },
    {
      id: "7",
      name: "Solid Teakwood Sofa",
      baseSellingPrice: 45999,
      material: "teakwood",
      images: [
        "/images/custombuilder/subservices/furnitures/sofas/image-1.png",
      ],
      baseDiscountPercent: 25,
      createdDate: "2024-06-12",
      category: "Sofas",
    },
    {
      id: "8",
      name: "Premium Rosewood Dining Set",
      baseSellingPrice: 65999,
      material: "rosewood",
      images: [
        "/images/custombuilder/subservices/furnitures/sofas/image-1.png",
      ],
      baseDiscountPercent: 40,
      createdDate: "2023-08-09",
      category: "Dining",
    },
    {
      id: "9",
      name: "Modern Fabric Bed",
      baseSellingPrice: 32999,
      material: "fabric",
      images: [
        "/images/custombuilder/subservices/furnitures/sofas/image-1.png",
      ],
      baseDiscountPercent: 18,
      createdDate: "2024-02-18",
      category: "Bed Room",
    },
    {
      id: "10",
      name: "Teakwood Armchair",
      baseSellingPrice: 24999,
      material: "teakwood",
      images: [
        "/images/custombuilder/subservices/furnitures/sofas/image-1.png",
      ],
      baseDiscountPercent: 10,
      createdDate: "2023-09-11",
      category: "Chairs",
    },
    {
      id: "11",
      name: "Sculpa Wall Shelf",
      baseSellingPrice: 24999,
      material: "Mango Wood and Cane",
      images: [
        "/images/custombuilder/subservices/furnitures/sofas/image-1.png",
      ],
      baseDiscountPercent: 10,
      createdDate: "2023-09-11",
      category: "Clocks",
    },
  ];

  const mappedRecentlyViewed = items.map((item) => ({
    ...item,
    images: item.images.map((img, index) => ({
      id: index + 1,
      url: img,
      alt: item.name,
      sortOrder: index,
      isPrimary: index === 0,
      colorHex: null,
      angle: null,
      viewType: null,
    })),
  }));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [item, setItem] = useState<Product | undefined>(undefined);
  const [images, setImages] = useState<FurnitureImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>(
    "/orders/no-orders.jpeg"
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewedItems, setViewedItems] = useState<ViewedItem[]>([]);
  const [selectedVariant, setSelectedVariant] =
    useState<FurnitureVariant | null>(null);
  const reviewSectionRef = useRef<HTMLDivElement>(null);

  const { asPath } = router;
  const pathParts = asPath.split("/");
  const actualRoute = pathParts[2];
  const cartItems = useCartStore((s) => s.items);

  // store viewed items in localStorage
  useEffect(() => {
    if (!item?.id) return;

    const key = "viewed_Items";
    const storedProperties: ViewedItem[] = JSON.parse(
      localStorage.getItem(key) || "[]"
    );

    const propertyExists = storedProperties.some(
      (p: ViewedItem) => p.id === item.id
    );

    if (!propertyExists) {
      const updatedProperties: ViewedItem[] = [
        ...storedProperties,
        {
          id: item.id,
          name: item.name || "",
        },
      ];
      setViewedItems(updatedProperties);
      localStorage.setItem(key, JSON.stringify(updatedProperties));
    }
  }, [item?.id, item?.name]);

  // fetch product
  useEffect(() => {
    if (!router.isReady) return;
    if (!id) {
      setIsLoading(false);
      return;
    }
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        let res;
        if (actualRoute === "furnitures") {
          res = await apiClient.get(`${apiClient.URLS.furniture}/${id}`);
        } else if (actualRoute === "homedecor") {
          res = await apiClient.get(`${apiClient.URLS.homeDecor}/${id}`);
        } else if (actualRoute === "electronics") {
          res = await apiClient.get(`${apiClient.URLS.electronics}/${id}`);
        } else {
          return;
        }

        const product: Product =
          actualRoute === "homedecor"
            ? mapHomeDecorToProduct(res?.body as HomeDecorProductResponse)
            : actualRoute === "electronics"
              ? (mapElectronicsToProduct(res?.body as any) as Product)
              : (res?.body as Product);
        setItem(product);

        // choose default variant (if any) — furniture/electronics only; homedecor has no variants
        const defaultVariant =
          product.variants?.find((v) => v.isDefault) ||
          product.variants?.[0] ||
          null;
        setSelectedVariant(defaultVariant);

        // Prefer variant images, fallback to product-level images; support empty arrays
        const variantImages =
          defaultVariant?.images && defaultVariant.images.length > 0
            ? defaultVariant.images
            : product.images && product.images.length > 0
              ? product.images
              : [];
        setImages(variantImages);
        if (variantImages.length > 0 && variantImages[0].url) {
          setSelectedImage(variantImages[0].url);
        } else {
          setSelectedImage("/orders/no-orders.jpeg");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [router.isReady, id, actualRoute]);

  // navigation for main image
  const handleNext = () => {
    if (images.length === 0) return;
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    setSelectedImage(images[nextIndex].url);
  };

  const handlePrev = () => {
    if (images.length === 0) return;
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    setSelectedImage(images[prevIndex].url);
  };
  useEffect(() => {
    if (session.status === "authenticated") {
      setUser(session?.data?.user);
    }
  }, [session?.status, session?.data]);

  if (isLoading) return <Loader />;

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Item not found</p>
      </div>
    );
  }

  // derive price from variant or base
  const sellingPrice =
    selectedVariant?.sellingPrice ?? item.baseSellingPrice ?? item.baseMrp ?? 0;
  const mrp =
    selectedVariant?.mrp ??
    item.baseMrp ??
    item.baseSellingPrice ??
    sellingPrice;

  const productTypeForCart = asPath.includes("furniture")
    ? "FURNITURE_PRODUCT"
    : asPath.includes("electronics")
      ? "ELECTRONICS_PRODUCT"
      : "HOME_DECOR_PRODUCT";
  const cartItemInCart = cartItems.find(
    (i) =>
      String(i.productId) === String(item.id) &&
      i.productType === productTypeForCart
  );
  const isInCart = !!cartItemInCart;

  const discountPercent =
    selectedVariant?.discountPercent ??
    item.baseDiscountPercent ??
    (mrp ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0);
  const addItemToCart = async (
    itemData: Product,
    userId: string
  ): Promise<boolean> => {
    const cartStore = useCartStore.getState();
    const type = router.asPath.includes("furniture")
      ? "FURNITURE_PRODUCT"
      : router.asPath.includes("electronics")
        ? "ELECTRONICS_PRODUCT"
        : "HOME_DECOR_PRODUCT";

    const snapshotImage =
      selectedVariant?.images?.[0]?.url ||
      itemData.images?.[0]?.url ||
      "";
    const cartMrp = selectedVariant?.mrp ?? itemData.baseMrp ?? itemData.baseSellingPrice ?? 0;
    const cartSellingPrice = selectedVariant?.sellingPrice ?? itemData.baseSellingPrice ?? itemData.baseMrp ?? 0;
    const cartDiscount = selectedVariant?.discountPercent ?? itemData.baseDiscountPercent ?? (cartMrp ? Math.round(((cartMrp - cartSellingPrice) / cartMrp) * 100) : 0);
    const payload = {
      productType: type,
      productId: String(itemData.id),
      name: itemData.name,
      description: itemData.description ?? "",
      mrp: cartMrp,
      sellingPrice: cartSellingPrice,
      unitDiscount: cartDiscount,
      quantity: 1,
      snapshot: { image: snapshotImage },
    };

    return await cartStore.addToCart(payload, userId);
  };
  const currentPath = router.asPath || "";
  const path = currentPath.includes("furnitures")
    ? "furnitures"
    : currentPath.includes("electronics")
      ? "electronics"
      : currentPath.includes("homedecor") || currentPath.includes("homeDecor")
        ? "homedecor"
        : "unknown";

  const handleAddToCart = async (itemData: Product, userId?: string) => {
    if (!userId) {
      toast.error("Please login to add items to cart");
      return;
    }
    const success = await addItemToCart(itemData, userId);
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
    
      event: "add_to_cart",
      item_id: itemData.id,
      item_name: itemData.name,
      category: itemData.category,
      type: path,
    });
   
    if (success) toast.success("Added to cart");
    
  };

  const handleBuyNow = async (itemData: Product, userId?: string) => {
    if (!userId) {
      toast.error("Please login to buy");
      return;
    }
    if (isInCart) {
      router.push("/cart");
      return;
    }
    const success = await addItemToCart(itemData, userId);
    if (success) router.push("/cart");
  };

  const handleIncreaseQty = () => {
    if (!cartItemInCart || !user?.id) return;
    useCartStore.getState().increaseQuantity(cartItemInCart.id, user.id);
  };

  const handleDecreaseQty = () => {
    if (!cartItemInCart || !user?.id) return;
    useCartStore.getState().decreaseQuantity(cartItemInCart.id, user.id);
  };

  const seoImage =
    images.length > 0
      ? images[0].url
      : item.images?.[0]?.url || "/orders/no-orders.jpeg";
  const seoImages = images.length > 0
      ? images.map((img) => img.url)
      : item.images?.map((img) => img.url) || [];
  const seoTags = (
    <SEO
      title={`${item.name}${item.brand ? ` by ${item.brand}` : ''} | Buy Online | OneCasa`}
      description={
        item?.description
          ? `${item.description.slice(0, 150)}${item.description.length > 150 ? '...' : ''}`
          : `Buy ${item.name} online at the best price on OneCasa. ${item.category ? `Category: ${item.category}.` : ''} Fast delivery & easy returns.`
      }
      imageUrl={seoImage}
      keywords={[
        item.name,
        item.brand,
        item.category,
        item.subCategory,
        `buy ${item.name?.toLowerCase()} online`,
        `${item.category?.toLowerCase()} online India`,
        'OneCasa',
      ].filter(Boolean).join(', ')}
      product={{
        name: item.name,
        description: item.description || `${item.name} available on OneCasa`,
        image: seoImages.length > 0 ? seoImages : seoImage,
        price: sellingPrice,
        priceCurrency: 'INR',
        availability: (selectedVariant?.stockQty ?? 1) > 0 ? 'InStock' : 'OutOfStock',
        brand: item.brand || 'OneCasa',
        category: item.category,
        sku: selectedVariant?.sku || String(item.id),
        ratingValue: item.averageRating || undefined,
        reviewCount: item.ratingCount || undefined,
      }}
    />
  );

  return (
    <div>
      {seoTags}

      <div className="px-4 sm:px-6 max-w-[1400px] mx-auto">
        <div className="py-4 md:py-6 w-full md:flex flex-col md:flex-row md:gap-8 gap-4 md:pb-10 border-b border-[#E9E9E9] md:items-start">
          {/* Image section - sticky so it stays in view when scrolling details */}
          <div className="lg:w-[55%] shrink-0 w-full md:sticky md:top-20 z-10 flex flex-col md:max-h-[calc(100vh-5rem)]">
            <div className="relative w-full aspect-square md:aspect-[4/3] md:max-h-[420px] overflow-hidden flex justify-center items-center rounded-lg bg-gray-50 shrink-0">
              <Button
                className="absolute md:left-2 -left-3 transform -translate-y-1/2 bg-[#E2E2E2] text-[#7B7B80] rounded-full w-10 h-10 flex items-center justify-center shadow-md"
                onClick={handlePrev}
              >
                <span className="absolute top-0 text-3xl">‹</span>
              </Button>

              <Image
                src={selectedImage}
                alt={item.name}
                className="w-full rounded-lg overflow-hidden transition-all duration-200 ease-in-out"
                width={1000}
                height={500}
                unoptimized
              />
              <Button
                className="absolute md:right-2 -right-3 top-1/2 transform -translate-y-1/2 bg-[#E2E2E2] text-[#7B7B80] rounded-full w-10 h-10 flex items-center justify-center shadow-md"
                onClick={handleNext}
              >
                <span className="absolute top-0 text-3xl">›</span>
              </Button>
            </div>

            {images.length > 0 && (
            <div className="flex justify-center mt-3 md:mt-4 gap-2 md:gap-3 overflow-x-auto overflow-y-hidden pb-1">
              {images.map((image, index) => (
                <div key={image.id ?? index} className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-md overflow-hidden">
                  <Image
                    src={image.url}
                    alt={image.alt || `Image ${index + 1}`}
                    className={`object-cover cursor-pointer transition-all duration-100 ease-in-out ${selectedImage === image.url
                        ? "ring-2 ring-[#3586FF]"
                        : "opacity-80 hover:opacity-100"
                      }`}
                    fill
                    onClick={() => {
                      setSelectedImage(image.url);
                      setCurrentIndex(index);
                    }}
                    unoptimized
                  />
                </div>
              ))}
            </div>
            )}
          </div>

          {/* Properties section */}
          <div className="md:p-5 p-0 mt-0 lg:w-[45%] md:mt-0 rounded-lg md:shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className=" flex items-start justify-start">
              <BreadCrumb
                steps={[
                  { label: "Our Services", link: "/services/custom-builder" },
                  {
                    label: `${actualRoute}`,
                    link: `/services/${actualRoute}`,
                  },
                  {
                    label: item?.category
                      ? (
                        item?.category.charAt(0).toUpperCase() +
                        item?.category.slice(1)
                      )
                        .split("-")
                        .join(" ")
                      : "Subservice",
                    link: `/services/${actualRoute}/${actualRoute}-shop?category=${item?.category ?? ""
                      }`,
                  },
                  {
                    label: item?.name
                      ? (
                        item?.name.charAt(0).toUpperCase() +
                        item?.name.slice(1)
                      )
                        .split("-")
                        .join(" ")
                      : "Subservice",
                    link: `/services/${actualRoute}/${item.id}`,
                  },
                ]}
                currentStep={
                  item
                    ? (item?.name.charAt(0).toUpperCase() + item?.name.slice(1))
                      .split("-")
                      .join(" ")
                    : "Subservice"
                }
                className="text-xs text-gray-500"
              />
            </div>
            <div className="flex flex-col items-start gap-2">
              <h1 className="text-lg font-semibold text-gray-900 md:text-2xl lg:text-3xl leading-tight">
                {item?.name}
              </h1>
              <button
                type="button"
                onClick={() =>
                  reviewSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
                className="flex items-center gap-2 text-left cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="text-[#3586FF] font-semibold flex items-center gap-1 text-sm md:text-base">
                  {item?.averageRating ?? 0}
                  <Star className="w-4 h-4 shrink-0" />
                </span>
                <span className="text-gray-500 text-xs md:text-sm">
                  {item?.ratingCount ?? 0} Ratings
                </span>
              </button>
            </div>

            {item?.variants && item.variants?.length > 0 && (
              <div className="mt-4 md:mt-6">
                <h3 className="font-semibold text-sm md:text-base text-gray-800 mb-2 md:mb-3">
                  Available Options
                </h3>

                <div className="flex flex-wrap gap-2 md:gap-3">
                  {item.variants.map((variant) => {
                    const isActive = selectedVariant?.id === variant.id;

                    return (
                      <Button
                        key={variant.id}
                        onClick={() => {
                          setSelectedVariant(variant);
                          const variantImages =
                            variant.images?.length > 0
                              ? variant.images
                              : item.images?.length > 0
                                ? item.images
                                : [];
                          setImages(variantImages);
                          if (variantImages.length > 0) {
                            setSelectedImage(variantImages[0].url);
                            setCurrentIndex(0);
                          } else {
                            setSelectedImage("/orders/no-orders.jpeg");
                          }
                        }}
                        className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full border shadow-sm text-xs md:text-sm transition-all
              ${isActive
                            ? "border-[#3586FF] bg-[#E8F1FF] text-[#3586FF] shadow-md"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }
            `}
                      >
                        {variant.colorName ||
                          variant.sizeLabel ||
                          variant.material ||
                          variant.sku ||
                          "Option"}
                      </Button>
                    );
                  })}
                </div>

                {/* Selected Label */}
                {selectedVariant && (
                  <div className="mt-2 md:mt-3 inline-block px-3 py-1.5 text-xs md:text-sm bg-gray-100 text-gray-700 rounded-full">
                    <span className="font-medium text-gray-800">Selected:</span>{" "}
                    {[
                      selectedVariant.colorName,
                      selectedVariant.material,
                      selectedVariant.sizeLabel,
                    ]
                      .filter(Boolean)
                      .join(" • ")}
                  </div>
                )}
              </div>
            )}

            <div className="my-4 md:my-5 flex flex-col gap-3">
              <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
                <span className="text-xl font-semibold text-gray-900 md:text-2xl lg:text-3xl">
                  ₹{sellingPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-sm md:text-base text-gray-400 line-through">
                  ₹{mrp.toLocaleString("en-IN")}
                </span>
                {discountPercent > 0 && (
                  <span className="text-xs md:text-sm font-medium text-[#1DA13A]">
                    {discountPercent}% off
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                <span>EMI from </span>
                <span className="font-semibold text-gray-800">₹1,873/month</span>
                <span className="text-[#3586FF] hover:underline cursor-pointer">View Plans</span>
              </div>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {isInCart && cartItemInCart ? (
                  <div className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-1">
                    <Button
                      type="button"
                      className="min-w-9 h-9 md:h-10 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center justify-center text-lg font-medium"
                      onClick={handleDecreaseQty}
                      aria-label="Decrease quantity"
                    >
                      −
                    </Button>
                    <span className="min-w-8 text-center text-sm md:text-base font-medium text-gray-900">
                      {cartItemInCart.quantity}
                    </span>
                    <Button
                      type="button"
                      className="min-w-9 h-9 md:h-10 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center justify-center text-lg font-medium"
                      onClick={handleIncreaseQty}
                      aria-label="Increase quantity"
                    >
                      +
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full bg-[#5297FF] text-white px-4 py-2.5 md:py-3 rounded-lg hover:bg-[#1972f8] flex items-center justify-center gap-2 text-sm md:text-base font-medium"
                    onClick={() => handleAddToCart(item, user?.id)}
                  >
                    <ShoppingCartOutlined className="w-5 h-5" /> Add to Cart
                  </Button>
                )}
                <Button
                  className="w-full bg-[#5297FF] text-white px-4 py-2.5 md:py-3 rounded-lg hover:bg-[#1972f8] flex items-center justify-center gap-2 text-sm md:text-base font-medium"
                  onClick={() => handleBuyNow(item, user?.id)}
                >
                  <ShoppingBag className="w-5 h-5" /> Buy Now
                </Button>
              </div>
            </div>

            <hr className="md:mt-5 mt-3 dark:border-white" />

            {item.offers && item.offers.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 md:p-4">
                <h3 className="font-semibold text-sm md:text-base text-gray-800 mb-2">Offers</h3>
                <ul className="space-y-2 text-xs md:text-sm">
                  {item.offers.map((offer) => (
                    <li key={offer.code} className="flex flex-col gap-0.5">
                      <span className="font-medium text-[#3586FF]">{offer.title}</span>
                      {offer.description && (
                        <span className="text-gray-600">{offer.description}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <hr className="md:mt-5 mt-3 dark:border-white" />


            <div className="mt-4 md:mt-5">
              <h2 className="font-semibold text-base md:text-lg text-gray-900 mb-3">
                Product Details
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 py-2 text-xs md:text-sm">
                {Object.entries(item?.otherProperties || {}).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="border-b border-gray-100 flex flex-col gap-0.5 pb-2"
                    >
                      <span className="font-medium text-gray-500">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </span>
                      <span className="text-gray-800">
                        {String(value)}
                      </span>
                    </div>
                  )
                )}
                <div className="border-b border-gray-100 flex flex-col gap-0.5 pb-2">
                  <span className="font-medium text-gray-500">Assembly</span>
                  <span className="text-gray-800">{item?.assembly ?? "—"}</span>
                </div>
                <div className="border-b border-gray-100 flex flex-col gap-0.5 pb-2">
                  <span className="font-medium text-gray-500">Brand</span>
                  <span className="text-gray-800">{item?.brand ?? "—"}</span>
                </div>
                <div className="border-b border-gray-100 flex flex-col gap-0.5 pb-2">
                  <span className="font-medium text-gray-500">Color</span>
                  <span className="text-gray-800">
                    {selectedVariant?.colorName ||
                      item?.variants?.[0]?.colorName ||
                      "N/A"}
                  </span>
                </div>
                <div className="border-b border-gray-100 flex flex-col gap-0.5 pb-2">
                  <span className="font-medium text-gray-500">Customizable</span>
                  <span className="text-gray-800">{item?.isCustomizable ? "Yes" : "No"}</span>
                </div>
                <div className="border-b border-gray-100 flex flex-col gap-0.5 pb-2">
                  <span className="font-medium text-gray-500">Delivery Time</span>
                  <span className="text-gray-800">{item?.deliveryTime ?? "—"}</span>
                </div>
                {item?.returnPolicy && (
                  <div className="border-b border-gray-100 flex flex-col gap-0.5 pb-2 col-span-2">
                    <span className="font-medium text-gray-500">Return Policy</span>
                    <span className="text-gray-800">{item.returnPolicy}</span>
                  </div>
                )}
                {item?.design != null && item.design !== "" && (
                  <div className="border-b border-gray-100 flex flex-col gap-0.5 pb-2">
                    <span className="font-medium text-gray-500">Design</span>
                    <span className="text-gray-800">{item.design}</span>
                  </div>
                )}
                <div className="flex flex-col gap-0.5 pb-2">
                  <span className="font-medium text-gray-500">Warranty</span>
                  <span className="text-gray-800">{item?.warranty ?? "—"}</span>
                </div>
              </div>
            </div>

            <hr className="my-4 border-gray-200" />
            <div className="flex flex-col gap-2">
              <h2 className="font-semibold text-base md:text-lg text-gray-900">
                Product Description
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                {item?.description}
              </p>
            </div>
          </div>
        </div>

        <div ref={reviewSectionRef} className="mt-10 w-full">
          <ReviewSection type={actualRoute === "furnitures" ? "furniture" : actualRoute === "homedecor" ? "homedecor" : "electronics"} id={String(item.id)} />
        </div>
        <div className="mt-10 w-full">
          <RecentlyViewed items={mappedRecentlyViewed} />
        </div>

        <div className="mt-10 mb-20 w-full">
          <SimilarItems items={mappedRecentlyViewed} />
        </div>

        <div className="mt-10 mb-20 w-full">
          <FAQSComp
            faqs={faqs}
            image="/images/custombuilder/subservices/furnitures/sofas/image-2.png"
          />
        </div>
      </div>

      {/* <Footer /> */}
    </div>
  );
};

export default ProductItemDetails;
