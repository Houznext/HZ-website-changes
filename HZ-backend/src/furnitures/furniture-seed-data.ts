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

const FURNITURE_IMAGES: Record<string, string> = {
  accent_chair: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&h=600&fit=crop',
  side_table: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?w=600&h=600&fit=crop',
  l_sofa: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop',
  recliner: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&h=600&fit=crop',
  coffee_table: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=600&h=600&fit=crop',
  tv_unit: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=600&h=600&fit=crop',
  dining_table: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&h=600&fit=crop',
  dining_table_6: 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=600&h=600&fit=crop',
  bed_storage: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=600&fit=crop',
  bed_hydraulic: 'https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=600&h=600&fit=crop',
  office_chair: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&h=600&fit=crop',
  study_table: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&h=600&fit=crop',
  bookshelf: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600&h=600&fit=crop',
  cabinet: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&h=600&fit=crop',
  wardrobe_custom: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=600&h=600&fit=crop',
  tv_bespoke: 'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=600&h=600&fit=crop',
  console_table: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=600&h=600&fit=crop',
  dining_chair: 'https://images.unsplash.com/photo-1551298370-9d3d08a5c127?w=600&h=600&fit=crop',
  armchair: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&h=600&fit=crop',
  tv_low: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=600&h=600&fit=crop',
  tv_floating: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&h=600&fit=crop',
  wardrobe_2door: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&h=600&fit=crop',
  wardrobe_sliding: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=600&h=600&fit=crop',
};

const IMAGE_KEYS = Object.keys(FURNITURE_IMAGES);

function getImage(index: number): string {
  return FURNITURE_IMAGES[IMAGE_KEYS[index % IMAGE_KEYS.length]];
}

type SubCat =
  | (typeof SofaSubCategory)[keyof typeof SofaSubCategory]
  | (typeof BedSubCategory)[keyof typeof BedSubCategory]
  | (typeof ChairSubCategory)[keyof typeof ChairSubCategory]
  | (typeof TableSubCategory)[keyof typeof TableSubCategory]
  | (typeof WardrobeSubCategory)[keyof typeof WardrobeSubCategory]
  | (typeof StudyRoomSubCategory)[keyof typeof StudyRoomSubCategory]
  | (typeof DiningTableSubCategory)[keyof typeof DiningTableSubCategory];

export interface FurnitureSeedItem {
  name: string;
  category: Category;
  subCategory?: SubCat;
  brand?: string;
  description: string;
  mrp: number;
  sellingPrice: number;
  stockQty: number;
  colorName?: string;
  material?: string;
}

export const SEED_FURNITURE: FurnitureSeedItem[] = [
  { name: 'Modern Accent Chair', category: Category.NewArrivals, description: 'Contemporary design for living spaces.', mrp: 12999, sellingPrice: 10999, stockQty: 15, colorName: 'Grey', brand: 'Urban Ladder' },
  { name: 'Minimalist Side Table', category: Category.NewArrivals, description: 'Sleek side table with clean lines.', mrp: 5999, sellingPrice: 4999, stockQty: 25, colorName: 'White', brand: 'HomeTown' },
  { name: 'L-Shaped Sectional Sofa', category: Category.Sofas, subCategory: SofaSubCategory.LShaped, description: 'Spacious L-shaped sectional in premium fabric.', mrp: 45999, sellingPrice: 38999, stockQty: 8, colorName: 'Charcoal', material: 'Fabric', brand: 'Nilkamal' },
  { name: 'Recliner Sofa', category: Category.Sofas, subCategory: SofaSubCategory.Recliner, description: 'Comfortable 3-seater with recliner feature.', mrp: 32999, sellingPrice: 27999, stockQty: 12, colorName: 'Brown', material: 'Leatherette', brand: 'Nilkamal' },
  { name: 'Premium Coffee Table', category: Category.LivingRoom, description: 'Solid wood coffee table for living room.', mrp: 14999, sellingPrice: 12499, stockQty: 20, colorName: 'Walnut', brand: 'Godrej' },
  { name: 'TV Console Cabinet', category: Category.LivingRoom, description: 'Modern TV unit with storage.', mrp: 18999, sellingPrice: 15999, stockQty: 10, colorName: 'White', brand: 'Durian' },
  { name: '4 Seater Dining Table', category: Category.DiningTables, subCategory: DiningTableSubCategory.FourSeater, description: 'Compact dining set for small spaces.', mrp: 21999, sellingPrice: 18499, stockQty: 14, colorName: 'Teak', material: 'Engineered Wood', brand: 'HomeTown' },
  { name: '6 Seater Dining Table', category: Category.DiningTables, subCategory: DiningTableSubCategory.SixSeater, description: 'Family dining table with chairs.', mrp: 35999, sellingPrice: 29999, stockQty: 8, colorName: 'Oak', material: 'Solid Wood', brand: 'Nilkamal' },
  { name: 'Platform Bed with Storage', category: Category.Beds, subCategory: BedSubCategory.Storage, description: 'King size bed with under-bed storage.', mrp: 24999, sellingPrice: 20999, stockQty: 10, colorName: 'Sheesham', material: 'Solid Wood', brand: 'Wakefit' },
  { name: 'Hydraulic Storage Bed', category: Category.Beds, subCategory: BedSubCategory.Hydraulic, description: 'Queen size with hydraulic lift storage.', mrp: 29999, sellingPrice: 24999, stockQty: 6, colorName: 'Walnut', brand: 'Sleepyhead' },
  { name: 'Ergonomic Office Chair', category: Category.StudyAndOffice, description: 'Adjustable height, lumbar support.', mrp: 9999, sellingPrice: 7999, stockQty: 30, colorName: 'Black', brand: 'Green Soul' },
  { name: 'Study Table with Drawers', category: Category.StudyAndOffice, subCategory: StudyRoomSubCategory.StudyTable, description: 'Spacious study table with storage.', mrp: 8999, sellingPrice: 7499, stockQty: 18, colorName: 'White', brand: 'HomeTown' },
  { name: '5 Tier Bookshelf', category: Category.Storage, description: 'Tall bookshelf for books and display.', mrp: 6999, sellingPrice: 5799, stockQty: 22, colorName: 'Natural', material: 'Engineered Wood', brand: 'Nilkamal' },
  { name: 'Storage Cabinet', category: Category.Storage, description: 'Multi-purpose storage cabinet.', mrp: 11999, sellingPrice: 9999, stockQty: 12, colorName: 'Grey', brand: 'Godrej' },
  { name: 'Custom Wardrobe Design', category: Category.CustomFurniture, description: 'Customizable wardrobe as per your space.', mrp: 49999, sellingPrice: 42999, stockQty: 5, colorName: 'Custom', brand: 'OneCasa' },
  { name: 'Bespoke TV Unit', category: Category.CustomFurniture, description: 'Made-to-order TV unit.', mrp: 34999, sellingPrice: 29999, stockQty: 5, colorName: 'Custom', brand: 'OneCasa' },
  { name: 'Coffee Table with Shelf', category: Category.Tables, subCategory: TableSubCategory.Coffee, description: 'Two-tier coffee table.', mrp: 7999, sellingPrice: 6499, stockQty: 20, colorName: 'Oak', brand: 'HomeTown' },
  { name: 'Console Table', category: Category.Tables, subCategory: TableSubCategory.Console, description: 'Elegant hallway console table.', mrp: 9499, sellingPrice: 7899, stockQty: 15, colorName: 'Black', brand: 'Urban Ladder' },
  { name: 'Dining Chair Set of 2', category: Category.Chairs, subCategory: ChairSubCategory.Dining, description: 'Set of 2 upholstered dining chairs.', mrp: 7999, sellingPrice: 6499, stockQty: 25, colorName: 'Beige', brand: 'Nilkamal' },
  { name: 'Accent Armchair', category: Category.Chairs, subCategory: ChairSubCategory.Accent, description: 'Statement armchair for corner.', mrp: 12999, sellingPrice: 10499, stockQty: 12, colorName: 'Navy Blue', brand: 'Godrej' },
  { name: 'Low Profile TV Unit', category: Category.TVUnits, description: 'Slim TV stand for 55" TVs.', mrp: 14999, sellingPrice: 12499, stockQty: 14, colorName: 'White Oak', brand: 'HomeTown' },
  { name: 'Floating TV Unit', category: Category.TVUnits, description: 'Wall-mounted TV unit with cabinets.', mrp: 22999, sellingPrice: 18999, stockQty: 8, colorName: 'Grey', brand: 'Durian' },
  { name: '2 Door Wardrobe', category: Category.Wardrobes, subCategory: WardrobeSubCategory.TwoDoor, description: 'Compact 2-door wardrobe.', mrp: 18999, sellingPrice: 15999, stockQty: 10, colorName: 'White', material: 'Engineered Wood', brand: 'Nilkamal' },
  { name: 'Sliding Wardrobe', category: Category.Wardrobes, subCategory: WardrobeSubCategory.Sliding, description: 'Space-saving sliding door wardrobe.', mrp: 34999, sellingPrice: 28999, stockQty: 6, colorName: 'Walnut', brand: 'Godrej' },
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function buildFurnitureDto(item: FurnitureSeedItem, index: number) {
  const baseSlug = slugify(item.name);
  return {
    name: item.name,
    slug: `${baseSlug}-${Math.random().toString(36).slice(2, 9)}`,
    category: item.category,
    subCategory: item.subCategory,
    description: item.description,
    brand: item.brand,
    status: FurnitureStatus.ACTIVE,
    isFeatured: false,
    variants: [{
      sku: `FURN-${baseSlug.slice(0, 8).toUpperCase()}-${Math.random().toString(36).slice(2, 6)}`,
      mrp: item.mrp,
      sellingPrice: item.sellingPrice,
      stockQty: item.stockQty,
      colorName: item.colorName,
      material: item.material,
      isDefault: true,
      isActive: true,
    }],
    images: [{ url: getImage(index), sortOrder: 0, isPrimary: true }],
    currencyCode: 'INR',
    taxPercentage: 18,
    deliveryTime: '5-7 business days',
    warranty: '1 year',
    deliveryLocations: 'All India',
  };
}
