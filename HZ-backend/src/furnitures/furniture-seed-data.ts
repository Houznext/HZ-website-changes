import {
  Category,
  SofaSubCategory,
  BedSubCategory,
  ChairSubCategory,
  TableSubCategory,
  WardrobeSubCategory,
  StudyRoomSubCategory,
  DiningTableSubCategory,
  FurnitureStatus,
} from './enum/furniture.enum';
import { CreateFurnitureDto } from './dto/furniture.dto';

const IMG = {
  oslo_sofa_1: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop',
  oslo_sofa_2: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=800&fit=crop',
  recliner_1: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=800&fit=crop',
  lotus_bed_1: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=800&fit=crop',
  hydraulic_bed_1: 'https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=800&h=800&fit=crop',
  aria_dining_1: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&h=800&fit=crop',
  dining_4s_1: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&h=800&fit=crop',
  zenith_tv_1: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&h=800&fit=crop',
  floating_tv_1: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=800&fit=crop',
  neptune_ward_1: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800&h=800&fit=crop',
  sliding_ward_1: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=800&h=800&fit=crop',
  arc_chair_1: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&h=800&fit=crop',
  dining_chair_1: 'https://images.unsplash.com/photo-1551298370-9d3d08a5c127?w=800&h=800&fit=crop',
  office_chair_1: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&h=800&fit=crop',
  maple_study_1: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&h=800&fit=crop',
  bookshelf_1: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&h=800&fit=crop',
  cabinet_1: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&h=800&fit=crop',
  custom_ward_1: 'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=800&h=800&fit=crop',
  custom_tv_1: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800&h=800&fit=crop',
  accent_chair_1: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=800&fit=crop',
  coffee_table_1: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=800&h=800&fit=crop',
};

function disc(mrp: number, sell: number) {
  return parseFloat((((mrp - sell) / mrp) * 100).toFixed(2));
}

export function buildHznSeedProducts(userId?: string, branchId?: string): CreateFurnitureDto[] {
  const mk = (
    name: string,
    slug: string,
    category: Category,
    subCategory: any,
    image: string,
    mrp: number,
    sellingPrice: number,
    featured = false,
  ): CreateFurnitureDto => ({
    name,
    slug,
    category,
    subCategory,
    description: `${name} from Houznext Store with premium build quality and long-lasting finish.`,
    highlights: 'Premium quality | Carefully curated | Houznext branded',
    brand: 'Houznext',
    tags: [category, 'Houznext'],
    status: FurnitureStatus.ACTIVE,
    isFeatured: featured,
    isCODAvailable: true,
    deliveryTime: '5-10 business days',
    warranty: '2 years',
    assembly: 'Included where applicable',
    returnPolicy: '30-day returns',
    currencyCode: 'INR',
    taxPercentage: 18,
    gstInclusive: true,
    deliveryLocations: 'Hyderabad, Bengaluru, Chennai, Mumbai, Pune',
    variants: [
      {
        sku: `${slug.toUpperCase().replace(/-/g, '_')}_STD`,
        colorName: 'Standard',
        colorHex: '#2f80ed',
        material: 'Premium',
        sizeLabel: 'Standard',
        mrp,
        sellingPrice,
        discountPercent: disc(mrp, sellingPrice),
        stockQty: 20,
        isDefault: true,
        isActive: true,
      },
    ],
    images: [{ url: image, alt: `${name} image`, sortOrder: 0, isPrimary: true }],
  });

  return [
    mk('Oslo L-Shaped Sectional Sofa', 'oslo-l-shaped-sectional-sofa', Category.Sofas, SofaSubCategory.LShaped, IMG.oslo_sofa_1, 65000, 42999, true),
    mk('Apex 3-Seater Recliner Sofa', 'apex-3-seater-recliner-sofa', Category.Sofas, SofaSubCategory.Recliner, IMG.recliner_1, 89000, 62999),
    mk('Cleo 3-Seater Fabric Sofa', 'cleo-3-seater-fabric-sofa', Category.Sofas, SofaSubCategory.Sectional, IMG.oslo_sofa_2, 38000, 26999),
    mk('Lotus King Platform Bed with Hydraulic Storage', 'lotus-king-platform-bed-hydraulic-storage', Category.Beds, BedSubCategory.Hydraulic, IMG.lotus_bed_1, 45000, 31999, true),
    mk('Serene Upholstered Storage Bed', 'serene-upholstered-storage-bed', Category.Beds, BedSubCategory.Storage, IMG.hydraulic_bed_1, 52000, 37999),
    mk('Aria 6-Seater Solid Wood Dining Set', 'aria-6-seater-solid-wood-dining-set', Category.DiningTables, DiningTableSubCategory.SixSeater, IMG.aria_dining_1, 55000, 38500, true),
    mk('Zest 4-Seater Compact Dining Table', 'zest-4-seater-compact-dining-table', Category.DiningTables, DiningTableSubCategory.FourSeater, IMG.dining_4s_1, 28000, 19999),
    mk('Zenith Floating TV Unit 180cm', 'zenith-floating-tv-unit-180cm', Category.TVUnits, undefined, IMG.zenith_tv_1, 28000, 18499, true),
    mk('Nova Low-Profile TV Stand', 'nova-low-profile-tv-stand', Category.TVUnits, undefined, IMG.floating_tv_1, 18000, 12999),
    mk('Neptune 3-Door Wardrobe with Mirror', 'neptune-3-door-wardrobe-with-mirror', Category.Wardrobes, WardrobeSubCategory.ThreeDoor, IMG.neptune_ward_1, 36000, 24999, true),
    mk('Glide 4-Door Sliding Wardrobe', 'glide-4-door-sliding-wardrobe', Category.Wardrobes, WardrobeSubCategory.Sliding, IMG.sliding_ward_1, 48000, 34999),
    mk('Arc Velvet Accent Chair', 'arc-velvet-accent-chair', Category.Chairs, ChairSubCategory.Accent, IMG.arc_chair_1, 14000, 8999, true),
    mk('Lux Dining Chair Set of 2', 'lux-dining-chair-set-of-2', Category.Chairs, ChairSubCategory.Dining, IMG.dining_chair_1, 9000, 6499),
    mk('Ergo Pro Office Chair', 'ergo-pro-office-chair', Category.StudyAndOffice, ChairSubCategory.Office, IMG.office_chair_1, 18000, 11999, true),
    mk('Maple Study Table Set with Bookshelf', 'maple-study-table-set-with-bookshelf', Category.StudyAndOffice, StudyRoomSubCategory.StudySet, IMG.maple_study_1, 18000, 12499),
    mk('Vista 5-Tier Open Bookshelf', 'vista-5-tier-open-bookshelf', Category.Storage, undefined, IMG.bookshelf_1, 8500, 5999, true),
    mk('Cube Storage Cabinet with Doors', 'cube-storage-cabinet-with-doors', Category.Storage, undefined, IMG.cabinet_1, 13500, 9999),
    mk('Bespoke Full-Wall Wardrobe (Custom)', 'bespoke-full-wall-wardrobe-custom', Category.CustomFurniture, undefined, IMG.custom_ward_1, 42999, 42999, true),
    mk('Custom TV Wall Unit (Made-to-Order)', 'custom-tv-wall-unit-made-to-order', Category.CustomFurniture, undefined, IMG.custom_tv_1, 29999, 29999),
    mk('Como Accent Chair with Ottoman', 'como-accent-chair-with-ottoman', Category.NewArrivals, ChairSubCategory.Accent, IMG.accent_chair_1, 22000, 14999, true),
  ];
}

// Legacy compatibility for existing seed endpoint
export const SEED_FURNITURE: any[] = [];
export function buildFurnitureDto(item: any, _index: number): any {
  return item;
}
