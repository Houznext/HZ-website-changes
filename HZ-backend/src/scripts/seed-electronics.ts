/**
 * Seed script: Create 2 electronics per category for 4 categories (8 total).
 * Run: npm run seed:electronics
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });
dotenv.config({ path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`) });

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ElectronicsService } from '../electronics/electronics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { ElectronicsCategory } from '../electronics/enum/electronics.enum';
import { CreateElectronicsDto } from '../electronics/dto/electronics.dto';

const SEED_PRODUCTS: Array<{
  name: string;
  brand: string;
  modelNumber: string;
  category: ElectronicsCategory;
  prodDetails: string;
  technicalSpecifications: Record<string, string>;
  variants: Array<{ sku: string; originalPrice: number; discount: number; stockQuantity: number; color?: string }>;
}> = [
  // Kitchen Appliances - 2
  {
    name: 'Philips Daily Collection Blender',
    brand: 'Philips',
    modelNumber: 'HR2115/01',
    category: ElectronicsCategory.KITCHEN_APPLIANCES,
    prodDetails: 'Powerful 700W motor. 2L BPA-free jar. Multi-level blade for smooth blending. Perfect for smoothies, soups, and dips.',
    technicalSpecifications: { applianceType: 'Blender', capacity: 'Medium' },
    variants: [{ sku: 'PHI-BL-700-BLK', originalPrice: 2999, discount: 10, stockQuantity: 25, color: 'Black' }],
  },
  {
    name: 'Bajaj GX-1 Toaster 2 Slice',
    brand: 'Bajaj',
    modelNumber: 'GX-1',
    category: ElectronicsCategory.KITCHEN_APPLIANCES,
    prodDetails: '830W power. 6 browning levels. Removable crumb tray. Durable stainless steel finish.',
    technicalSpecifications: { applianceType: 'Toaster', capacity: 'Small' },
    variants: [{ sku: 'BAJ-TST-830-SIL', originalPrice: 1499, discount: 5, stockQuantity: 40, color: 'Silver' }],
  },
  // Entertainment - 2
  {
    name: 'Sony Bravia 43" Full HD Smart TV',
    brand: 'Sony',
    modelNumber: 'KDL-43W6603',
    category: ElectronicsCategory.ENTERTAINMENT,
    prodDetails: 'Full HD display. Android TV. Google Assistant built-in. Chromecast. USB & HDMI connectivity.',
    technicalSpecifications: { deviceType: 'TV', screenSize: '40 inches', resolution: 'Full HD (1080p)' },
    variants: [{ sku: 'SNY-TV-43FHD-BLK', originalPrice: 34990, discount: 12, stockQuantity: 15 }],
  },
  {
    name: 'JBL Flip 6 Portable Bluetooth Speaker',
    brand: 'JBL',
    modelNumber: 'FLIP6',
    category: ElectronicsCategory.ENTERTAINMENT,
    prodDetails: 'Waterproof IP67. 12 hours playback. PartyBoost for stereo sound. Bold sound with deep bass.',
    technicalSpecifications: { deviceType: 'Speaker', screenSize: '32 inches', resolution: 'HD (720p)' },
    variants: [
      { sku: 'JBL-F6-BLK', originalPrice: 12999, discount: 8, stockQuantity: 30, color: 'Black' },
      { sku: 'JBL-F6-BLU', originalPrice: 12999, discount: 8, stockQuantity: 20, color: 'Blue' },
    ],
  },
  // Smart Home - 2
  {
    name: 'Amazon Echo Dot (5th Gen) Smart Speaker',
    brand: 'Amazon',
    modelNumber: 'ECHO-DOT-5',
    category: ElectronicsCategory.SMART_HOME,
    prodDetails: 'Alexa built-in. Voice control for smart home. Improved audio quality. Compact design.',
    technicalSpecifications: { deviceType: 'Smart Speaker', connectivity: 'Wi-Fi, Bluetooth' },
    variants: [{ sku: 'AMZ-ECHO-DOT-5-BLK', originalPrice: 4499, discount: 15, stockQuantity: 50 }],
  },
  {
    name: 'TP-Link Kasa Smart Plug HS100',
    brand: 'TP-Link',
    modelNumber: 'HS100',
    category: ElectronicsCategory.SMART_HOME,
    prodDetails: 'Voice control with Alexa & Google Assistant. Schedule on/off. Away mode. No hub required.',
    technicalSpecifications: { deviceType: 'Smart Plug', connectivity: 'Wi-Fi' },
    variants: [{ sku: 'TPL-KASA-HS100-WHT', originalPrice: 999, discount: 5, stockQuantity: 80, color: 'White' }],
  },
  // Cleaning & Laundry - 2
  {
    name: 'IFB 6.5 kg Fully Automatic Front Load Washing Machine',
    brand: 'IFB',
    modelNumber: 'Neo Diva',
    category: ElectronicsCategory.CLEANING_LAUNDRY,
    prodDetails: 'Cresecendo Inverter motor. Aqua Energie. Allergy Protect. Steam wash. 15 programs.',
    technicalSpecifications: { applianceType: 'Washing Machine', motorType: 'Inverter' },
    variants: [{ sku: 'IFB-NEO6.5-SIL', originalPrice: 24990, discount: 10, stockQuantity: 12, color: 'Silver' }],
  },
  {
    name: 'Eureka Forbes DX 2000 Vacuum Cleaner',
    brand: 'Eureka Forbes',
    modelNumber: 'DX 2000',
    category: ElectronicsCategory.CLEANING_LAUNDRY,
    prodDetails: '2000W suction power. 10L dust capacity. HEPA filter. 7m cable. Compact & portable.',
    technicalSpecifications: { applianceType: 'Vacuum Cleaner', motorType: 'Direct Drive' },
    variants: [{ sku: 'EF-DX2000-RED', originalPrice: 5490, discount: 12, stockQuantity: 35, color: 'Red' }],
  },
];

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const electronicsService = app.get(ElectronicsService);
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

  const [user] = await userRepo.find({ where: {}, take: 1 });
  if (!user) {
    console.error('No user found in database. Please create at least one user first.');
    await app.close();
    process.exit(1);
  }

  console.log(`Seeding electronics as user: ${user.id} (${user.fullName || user.username})`);

  for (const p of SEED_PRODUCTS) {
    const dto = {
      name: p.name,
      brand: p.brand,
      modelNumber: p.modelNumber,
      category: p.category,
      prodDetails: p.prodDetails,
      technicalSpecifications: p.technicalSpecifications,
      variants: p.variants.map((v) => ({
        sku: v.sku,
        originalPrice: v.originalPrice,
        discount: v.discount,
        stockQuantity: v.stockQuantity,
        color: v.color,
        isActive: true,
        isDefault: true,
      })),
      currencyCode: 'INR',
      taxPercentage: 18,
      stockAlertThreshold: 10,
      deliveryTime: '5-7 business days',
      installationRequired: false,
      smartFeatures: p.category === ElectronicsCategory.SMART_HOME,
      isPublished: true,
      isCODAvailable: true,
      deliveryLocations: 'All India',
      warranty: '1 year manufacturer warranty',
      shippingDetails: { weight: 5, dimensions: '30x20x15 cm' },
      searchTags: [],
      createdById: user.id,
    } as CreateElectronicsDto;

    try {
      const created = await electronicsService.createElectronics(dto);
      console.log(`Created: ${created.name} (${p.category})`);
    } catch (err) {
      console.error(`Failed to create ${p.name}:`, err?.message || err);
    }
  }

  console.log('Seed complete.');
  await app.close();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
