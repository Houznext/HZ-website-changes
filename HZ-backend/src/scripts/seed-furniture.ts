/**
 * Seed script: Create 2 furniture items per category (24 total).
 * Run: npm run seed:furniture
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });
dotenv.config({ path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`) });

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { FurnitureService } from '../furnitures/furniture.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
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
} from '../furnitures/enum/furniture.enum';
import { CreateFurnitureDto } from '../furnitures/dto/furniture.dto';

const PLACEHOLDER_IMG = 'https://placehold.co/400x400/e2e8f0/64748b?text=Furniture';

type SubCat = typeof SofaSubCategory[keyof typeof SofaSubCategory] | typeof BedSubCategory[keyof typeof BedSubCategory] | typeof ChairSubCategory[keyof typeof ChairSubCategory] | typeof TableSubCategory[keyof typeof TableSubCategory] | typeof WardrobeSubCategory[keyof typeof WardrobeSubCategory] | typeof StudyRoomSubCategory[keyof typeof StudyRoomSubCategory] | typeof DiningTableSubCategory[keyof typeof DiningTableSubCategory];

const SEED_ITEMS: Array<{
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
}> = [
  // New Arrivals - 2
  { name: 'Modern Accent Chair', category: Category.NewArrivals, description: 'Contemporary design for living spaces.', mrp: 12999, sellingPrice: 10999, stockQty: 15, colorName: 'Grey', brand: 'Urban Ladder' },
  { name: 'Minimalist Side Table', category: Category.NewArrivals, description: 'Sleek side table with clean lines.', mrp: 5999, sellingPrice: 4999, stockQty: 25, colorName: 'White', brand: 'HomeTown' },
  // Sofas - 2
  { name: 'L-Shaped Sectional Sofa', category: Category.Sofas, subCategory: SofaSubCategory.LShaped, description: 'Spacious L-shaped sectional in premium fabric.', mrp: 45999, sellingPrice: 38999, stockQty: 8, colorName: 'Charcoal', material: 'Fabric', brand: 'Nilkamal' },
  { name: 'Recliner Sofa', category: Category.Sofas, subCategory: SofaSubCategory.Recliner, description: 'Comfortable 3-seater with recliner feature.', mrp: 32999, sellingPrice: 27999, stockQty: 12, colorName: 'Brown', material: 'Leatherette', brand: 'Nilkamal' },
  // Living Room - 2
  { name: 'Premium Coffee Table', category: Category.LivingRoom, description: 'Solid wood coffee table for living room.', mrp: 14999, sellingPrice: 12499, stockQty: 20, colorName: 'Walnut', brand: 'Godrej' },
  { name: 'TV Console Cabinet', category: Category.LivingRoom, description: 'Modern TV unit with storage.', mrp: 18999, sellingPrice: 15999, stockQty: 10, colorName: 'White', brand: 'Durian' },
  // Dining Tables - 2
  { name: '4 Seater Dining Table', category: Category.DiningTables, subCategory: DiningTableSubCategory.FourSeater, description: 'Compact dining set for small spaces.', mrp: 21999, sellingPrice: 18499, stockQty: 14, colorName: 'Teak', material: 'Engineered Wood', brand: 'HomeTown' },
  { name: '6 Seater Dining Table', category: Category.DiningTables, subCategory: DiningTableSubCategory.SixSeater, description: 'Family dining table with chairs.', mrp: 35999, sellingPrice: 29999, stockQty: 8, colorName: 'Oak', material: 'Solid Wood', brand: 'Nilkamal' },
  // Beds - 2
  { name: 'Platform Bed with Storage', category: Category.Beds, subCategory: BedSubCategory.Storage, description: 'King size bed with under-bed storage.', mrp: 24999, sellingPrice: 20999, stockQty: 10, colorName: 'Sheesham', material: 'Solid Wood', brand: 'Wakefit' },
  { name: 'Hydraulic Storage Bed', category: Category.Beds, subCategory: BedSubCategory.Hydraulic, description: 'Queen size with hydraulic lift storage.', mrp: 29999, sellingPrice: 24999, stockQty: 6, colorName: 'Walnut', brand: 'Sleepyhead' },
  // Study & Office - 2
  { name: 'Ergonomic Office Chair', category: Category.StudyAndOffice, description: 'Adjustable height, lumbar support.', mrp: 9999, sellingPrice: 7999, stockQty: 30, colorName: 'Black', brand: 'Green Soul' },
  { name: 'Study Table with Drawers', category: Category.StudyAndOffice, subCategory: StudyRoomSubCategory.StudyTable, description: 'Spacious study table with storage.', mrp: 8999, sellingPrice: 7499, stockQty: 18, colorName: 'White', brand: 'HomeTown' },
  // Storage - 2
  { name: '5 Tier Bookshelf', category: Category.Storage, description: 'Tall bookshelf for books and display.', mrp: 6999, sellingPrice: 5799, stockQty: 22, colorName: 'Natural', material: 'Engineered Wood', brand: 'Nilkamal' },
  { name: 'Storage Cabinet', category: Category.Storage, description: 'Multi-purpose storage cabinet.', mrp: 11999, sellingPrice: 9999, stockQty: 12, colorName: 'Grey', brand: 'Godrej' },
  // Custom Furniture - 2
  { name: 'Custom Wardrobe Design', category: Category.CustomFurniture, description: 'Customizable wardrobe as per your space.', mrp: 49999, sellingPrice: 42999, stockQty: 5, colorName: 'Custom', brand: 'OneCasa' },
  { name: 'Bespoke TV Unit', category: Category.CustomFurniture, description: 'Made-to-order TV unit.', mrp: 34999, sellingPrice: 29999, stockQty: 5, colorName: 'Custom', brand: 'OneCasa' },
  // Tables - 2
  { name: 'Coffee Table with Shelf', category: Category.Tables, subCategory: TableSubCategory.Coffee, description: 'Two-tier coffee table.', mrp: 7999, sellingPrice: 6499, stockQty: 20, colorName: 'Oak', brand: 'HomeTown' },
  { name: 'Console Table', category: Category.Tables, subCategory: TableSubCategory.Console, description: 'Elegant hallway console table.', mrp: 9499, sellingPrice: 7899, stockQty: 15, colorName: 'Black', brand: 'Urban Ladder' },
  // Chairs - 2
  { name: 'Dining Chair Set of 2', category: Category.Chairs, subCategory: ChairSubCategory.Dining, description: 'Set of 2 upholstered dining chairs.', mrp: 7999, sellingPrice: 6499, stockQty: 25, colorName: 'Beige', brand: 'Nilkamal' },
  { name: 'Accent Armchair', category: Category.Chairs, subCategory: ChairSubCategory.Accent, description: 'Statement armchair for corner.', mrp: 12999, sellingPrice: 10499, stockQty: 12, colorName: 'Navy Blue', brand: 'Godrej' },
  // TV Units - 2
  { name: 'Low Profile TV Unit', category: Category.TVUnits, description: 'Slim TV stand for 55" TVs.', mrp: 14999, sellingPrice: 12499, stockQty: 14, colorName: 'White Oak', brand: 'HomeTown' },
  { name: 'Floating TV Unit', category: Category.TVUnits, description: 'Wall-mounted TV unit with cabinets.', mrp: 22999, sellingPrice: 18999, stockQty: 8, colorName: 'Grey', brand: 'Durian' },
  // Wardrobes - 2
  { name: '2 Door Wardrobe', category: Category.Wardrobes, subCategory: WardrobeSubCategory.TwoDoor, description: 'Compact 2-door wardrobe.', mrp: 18999, sellingPrice: 15999, stockQty: 10, colorName: 'White', material: 'Engineered Wood', brand: 'Nilkamal' },
  { name: 'Sliding Wardrobe', category: Category.Wardrobes, subCategory: WardrobeSubCategory.Sliding, description: 'Space-saving sliding door wardrobe.', mrp: 34999, sellingPrice: 28999, stockQty: 6, colorName: 'Walnut', brand: 'Godrej' },
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const furnitureService = app.get(FurnitureService);
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

  const [user] = await userRepo.find({ where: {}, take: 1 });
  if (!user) {
    console.error('No user found. Please create at least one user first.');
    await app.close();
    process.exit(1);
  }

  console.log(`Seeding furniture as user: ${user.id}`);

  for (const item of SEED_ITEMS) {
    const baseSlug = slugify(item.name);
    const dto: CreateFurnitureDto = {
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
      images: [{ url: PLACEHOLDER_IMG, sortOrder: 0, isPrimary: true }],
      currencyCode: 'INR',
      taxPercentage: 18,
      deliveryTime: '5-7 business days',
      warranty: '1 year',
      deliveryLocations: 'All India',
    };

    try {
      await furnitureService.createFurniture(dto, user.id);
      console.log(`Created: ${item.name} (${item.category})`);
    } catch (err) {
      console.error(`Failed ${item.name}:`, err?.message || err);
    }
  }

  console.log('Furniture seed complete.');
  await app.close();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
