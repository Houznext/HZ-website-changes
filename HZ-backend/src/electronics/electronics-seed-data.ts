import { ElectronicsCategory } from './enum/electronics.enum';

const ELECTRONICS_IMAGES = [
  'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&h=600&fit=crop', // blender
  'https://images.unsplash.com/photo-1585237017125-24baf7bbd4b0?w=600&h=600&fit=crop', // toaster
  'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=600&fit=crop', // smart TV
  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop', // bluetooth speaker
  'https://images.unsplash.com/photo-1543512214-318228f07e9b?w=600&h=600&fit=crop', // echo smart speaker
  'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=600&h=600&fit=crop', // smart plug
  'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&h=600&fit=crop', // washing machine
  'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&h=600&fit=crop', // vacuum cleaner
  'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop', // microwave
  'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&h=600&fit=crop', // air purifier
  'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=600&h=600&fit=crop', // laptop on desk
  'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=600&h=600&fit=crop', // headphones
  'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=600&h=600&fit=crop', // smart watch
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=600&fit=crop', // monitor
  'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop', // kitchen appliance
];

function getElectronicsImage(index: number): string {
  return ELECTRONICS_IMAGES[index % ELECTRONICS_IMAGES.length];
}

export interface ElectronicsSeedItem {
  name: string;
  brand: string;
  modelNumber: string;
  category: ElectronicsCategory;
  prodDetails: string;
  technicalSpecifications: Record<string, string>;
  variants: Array<{ sku: string; originalPrice: number; discount: number; stockQuantity: number; color?: string }>;
}

export const SEED_ELECTRONICS: ElectronicsSeedItem[] = [
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

export function buildElectronicsDto(item: ElectronicsSeedItem, userId: string, index = 0) {
  return {
    name: item.name,
    brand: item.brand,
    modelNumber: item.modelNumber,
    category: item.category,
    prodDetails: item.prodDetails,
    technicalSpecifications: item.technicalSpecifications,
    variants: item.variants.map((v) => ({
      sku: v.sku,
      originalPrice: v.originalPrice,
      discount: v.discount,
      stockQuantity: v.stockQuantity,
      color: v.color,
      isActive: true,
      isDefault: true,
    })),
    images: [{ url: getElectronicsImage(index), alt: item.name }],
    currencyCode: 'INR',
    taxPercentage: 18,
    stockAlertThreshold: 10,
    deliveryTime: '5-7 business days',
    installationRequired: false,
    smartFeatures: item.category === ElectronicsCategory.SMART_HOME,
    isPublished: true,
    isCODAvailable: true,
    deliveryLocations: 'All India',
    warranty: '1 year manufacturer warranty',
    shippingDetails: { weight: 5, dimensions: '30x20x15 cm' },
    searchTags: [],
    createdById: userId,
  };
}
