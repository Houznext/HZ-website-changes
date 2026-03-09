/**
 * Maps electronics API response shape to the shared Product/Item shape used by
 * furniture, home decor, and electronics list/detail components.
 */

export interface ElectronicsApiImage {
  id?: string;
  url: string;
  alt?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface ElectronicsApiVariant {
  id: string;
  sku: string;
  color?: string | null;
  sizeLabel?: string | null;
  originalPrice: number;
  discount: number;
  stockQuantity: number;
  isDefault: boolean;
  isActive: boolean;
  attributes?: Record<string, unknown> | null;
  images?: ElectronicsApiImage[];
}

export interface ElectronicsApiItem {
  id: string;
  name: string;
  slug?: string | null;
  baseOriginalPrice: number;
  baseDiscount: number;
  category: string;
  brand?: string;
  deliveryTime?: string;
  warranty?: string;
  returnPolicy?: string | null;
  prodDetails?: string;
  technicalSpecifications?: Record<string, string> | null;
  variants?: ElectronicsApiVariant[];
  images?: ElectronicsApiImage[];
  [key: string]: unknown;
}

const toFurnitureImage = (img: ElectronicsApiImage | string, index: number) => {
  const url = typeof img === "string" ? img : img?.url ?? "";
  return {
    id: index + 1,
    url,
    alt: null,
    sortOrder: index,
    isPrimary: index === 0,
    colorHex: null,
    angle: null,
    viewType: null,
  };
};

/** Map electronics list item from API to the shape expected by Item (card) and filters. */
export function mapElectronicsListItem(raw: ElectronicsApiItem) {
  const baseMrp = Number(raw.baseOriginalPrice) || 0;
  const discountPercent = Number(raw.baseDiscount) || 0;
  const baseSellingPrice =
    baseMrp > 0 ? baseMrp * (1 - discountPercent / 100) : baseMrp;

  const images: Array<{
    id: number;
    url: string;
    alt: string | null;
    sortOrder: number;
    isPrimary: boolean;
    colorHex: string | null;
    angle: string | null;
    viewType: string | null;
  }> = [];

  if (raw.images?.length) {
    raw.images.forEach((img, i) =>
      images.push(toFurnitureImage(img, images.length))
    );
  }
  if (images.length === 0 && raw.variants?.length) {
    for (const v of raw.variants) {
      if (v.images?.length) {
        v.images.forEach((img, i) =>
          images.push(toFurnitureImage(img, images.length))
        );
        break;
      }
    }
  }

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    category: raw.category ?? "",
    brand: raw.brand,
    deliveryTime: raw.deliveryTime,
    warranty: raw.warranty,
    returnPolicy: raw.returnPolicy,
    description: raw.prodDetails,
    baseMrp,
    baseSellingPrice,
    baseDiscountPercent: discountPercent,
    images: images.length ? images : [toFurnitureImage("", 0)],
    otherProperties: raw.technicalSpecifications
      ? { ...raw.technicalSpecifications }
      : {},
    createdDate: (raw as any).createdDate,
  };
}

/** Map electronics single product (by id) to Product shape for ItemDetailsSection. */
export function mapElectronicsToProduct(raw: ElectronicsApiItem) {
  const baseMrp = Number(raw.baseOriginalPrice) || 0;
  const baseDiscountPercent = Number(raw.baseDiscount) || 0;
  const baseSellingPrice =
    baseMrp > 0 ? baseMrp * (1 - baseDiscountPercent / 100) : baseMrp;

  const productImages = (raw.images ?? []).map((img, i) =>
    toFurnitureImage(img, i)
  );
  const variants = (raw.variants ?? []).map((v) => {
    const mrp = Number(v.originalPrice) || 0;
    const disc = Number(v.discount) || 0;
    const sellingPrice = mrp > 0 ? mrp * (1 - disc / 100) : mrp;
    const imgs = (v.images ?? []).map((img, i) => toFurnitureImage(img, i));
    return {
      id: v.id,
      sku: v.sku,
      colorName: v.color ?? undefined,
      stockQty: v.stockQuantity ?? 0,
      reservedQty: 0,
      mrp,
      sellingPrice,
      discountPercent: disc,
      isDefault: v.isDefault ?? false,
      isActive: v.isActive ?? true,
      images: imgs,
    };
  });

  const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0];
  const variantImages =
    defaultVariant?.images?.length ? defaultVariant.images : productImages;

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug ?? undefined,
    category: raw.category ?? "",
    description: raw.prodDetails,
    brand: raw.brand,
    deliveryTime: raw.deliveryTime,
    warranty: raw.warranty,
    returnPolicy: raw.returnPolicy ?? undefined,
    baseMrp,
    baseSellingPrice,
    baseDiscountPercent,
    images: variantImages.length ? variantImages : productImages.length ? productImages : [toFurnitureImage("", 0)],
    variants,
    otherProperties: raw.technicalSpecifications
      ? { ...raw.technicalSpecifications }
      : {},
    offers: (raw as any).offers ?? null,
    applicableCouponCodes: (raw as any).applicableCouponCodes ?? null,
    createdDate: (raw as any).createdDate,
  };
}
