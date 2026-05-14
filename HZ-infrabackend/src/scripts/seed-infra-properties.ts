import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { InfraProperty } from '../property/entities/infra-property.entity';
import { InfraPropertyDetails } from '../property/entities/infra-property-details.entity';
import { ConstructionStatus, ListingFor, PropertyType } from '../common/enums/infra.enums';

dotenv.config({
  path: path.resolve(__dirname, '..', '..', `.env.${process.env.NODE_ENV || 'development'}`),
});
dotenv.config();

type SeedRow = Partial<InfraProperty> & {
  title: string;
  propertyType: PropertyType;
  basePrice: string;
  city: string;
  locality: string;
  highlights?: string[];
  landArea?: string;
  plotArea?: string;
  carpetArea?: string;
  bhkType?: string;
};

const SEED_TAG = '[seed-infra]';

const rows: SeedRow[] = [
  {
    title: `${SEED_TAG} Shamshabad open land near airport`,
    propertyType: PropertyType.Land,
    listingFor: ListingFor.Buy,
    constructionStatus: ConstructionStatus.ReadyToMove,
    city: 'Hyderabad',
    locality: 'Shamshabad',
    basePrice: '4500000',
    landArea: '500',
    areaUnit: 'sqyd',
    highlights: ['HMDA', 'Corner', 'Clear title'],
    approvalAuthority: 'HMDA',
    facing: 'East',
  },
  {
    title: `${SEED_TAG} ORR growth corridor land`,
    propertyType: PropertyType.Land,
    listingFor: ListingFor.Buy,
    constructionStatus: ConstructionStatus.ReadyToMove,
    city: 'Hyderabad',
    locality: 'ORR',
    basePrice: '3200000',
    landArea: '400',
    areaUnit: 'sqyd',
    highlights: ['High growth', 'Wide road'],
    approvalAuthority: 'HMDA',
    facing: 'North',
  },
  {
    title: `${SEED_TAG} Kompally premium land parcel`,
    propertyType: PropertyType.Land,
    listingFor: ListingFor.Buy,
    constructionStatus: ConstructionStatus.ReadyToMove,
    city: 'Hyderabad',
    locality: 'Kompally',
    basePrice: '7800000',
    landArea: '600',
    areaUnit: 'sqyd',
    highlights: ['Gated layout', 'Title clear'],
    approvalAuthority: 'HMDA',
    facing: 'East',
  },
  {
    title: `${SEED_TAG} Kokapet villa with garden`,
    propertyType: PropertyType.Villa,
    listingFor: ListingFor.Buy,
    constructionStatus: ConstructionStatus.ReadyToMove,
    city: 'Hyderabad',
    locality: 'Kokapet',
    basePrice: '18000000',
    plotArea: '200',
    carpetArea: '3200',
    areaUnit: 'sqyd',
    bhkType: '4BHK',
    numberOfFloors: 'G+2',
    highlights: ['Private pool', 'Gated', 'Vastu'],
    isGatedCommunity: true,
    hasGarden: true,
  },
  {
    title: `${SEED_TAG} Gachibowli signature villa`,
    propertyType: PropertyType.Villa,
    listingFor: ListingFor.Buy,
    constructionStatus: ConstructionStatus.ReadyToMove,
    city: 'Hyderabad',
    locality: 'Gachibowli',
    basePrice: '12000000',
    plotArea: '165',
    carpetArea: '2800',
    areaUnit: 'sqyd',
    bhkType: '4BHK',
    numberOfFloors: 'G+2',
    highlights: ['IT corridor', 'Smart home'],
    hasSmartHome: true,
  },
  {
    title: `${SEED_TAG} ECR Chennai beachside villa`,
    propertyType: PropertyType.Villa,
    listingFor: ListingFor.Buy,
    constructionStatus: ConstructionStatus.ReadyToMove,
    city: 'Chennai',
    locality: 'ECR',
    basePrice: '9500000',
    plotArea: '240',
    carpetArea: '2400',
    areaUnit: 'sqyd',
    bhkType: '3BHK',
    numberOfFloors: 'G+1',
    highlights: ['Sea breeze', 'Garden'],
    hasGarden: true,
  },
  {
    title: `${SEED_TAG} Gachibowli 3BHK premium apt`,
    propertyType: PropertyType.Apartment,
    listingFor: ListingFor.Buy,
    constructionStatus: ConstructionStatus.ReadyToMove,
    city: 'Hyderabad',
    locality: 'Gachibowli',
    basePrice: '6850000',
    carpetArea: '1450',
    areaUnit: 'sqft',
    bhkType: '3BHK',
    floorNumber: 12,
    totalFloors: 22,
    facing: 'East',
    highlights: ['Clubhouse', 'Metro access', 'RERA'],
    isReraVerified: true,
  },
  {
    title: `${SEED_TAG} Madhapur compact 2BHK`,
    propertyType: PropertyType.Apartment,
    listingFor: ListingFor.Buy,
    constructionStatus: ConstructionStatus.UnderConstruction,
    city: 'Hyderabad',
    locality: 'Madhapur',
    basePrice: '4200000',
    carpetArea: '1180',
    areaUnit: 'sqft',
    bhkType: '2BHK',
    floorNumber: 8,
    totalFloors: 18,
    facing: 'West',
    highlights: ['IT hub', 'Rental yield'],
  },
  {
    title: `${SEED_TAG} Whitefield tech corridor apt`,
    propertyType: PropertyType.Apartment,
    listingFor: ListingFor.Buy,
    constructionStatus: ConstructionStatus.NewLaunch,
    city: 'Bengaluru',
    locality: 'Whitefield',
    basePrice: '8500000',
    carpetArea: '1620',
    areaUnit: 'sqft',
    bhkType: '3BHK',
    floorNumber: 6,
    totalFloors: 24,
    facing: 'North',
    highlights: ['Airport express', 'Mall nearby', 'RERA'],
    isReraVerified: true,
  },
  {
    title: `${SEED_TAG} ORR open plot scheme`,
    propertyType: PropertyType.Plot,
    listingFor: ListingFor.Buy,
    constructionStatus: ConstructionStatus.ReadyToMove,
    city: 'Hyderabad',
    locality: 'ORR',
    basePrice: '2800000',
    plotArea: '200',
    areaUnit: 'sqyd',
    highlights: ['HMDA', 'Corner', 'EB ready'],
    approvalType: 'HMDA',
    isReadyToRegister: true,
    hasEBConnection: true,
  },
  {
    title: `${SEED_TAG} Nizampet residential plot`,
    propertyType: PropertyType.Plot,
    listingFor: ListingFor.Buy,
    constructionStatus: ConstructionStatus.ReadyToMove,
    city: 'Hyderabad',
    locality: 'Nizampet',
    basePrice: '2200000',
    plotArea: '167',
    areaUnit: 'sqyd',
    highlights: ['DTCP', 'Gated layout'],
    approvalType: 'DTCP',
    isGatedLayout: true,
  },
  {
    title: `${SEED_TAG} Kompally value plot`,
    propertyType: PropertyType.Plot,
    listingFor: ListingFor.Buy,
    constructionStatus: ConstructionStatus.ReadyToMove,
    city: 'Hyderabad',
    locality: 'Kompally',
    basePrice: '1400000',
    plotArea: '150',
    areaUnit: 'sqyd',
    highlights: ['Affordable', 'Clear docs'],
    approvalType: 'HMDA',
  },
  {
    title: `${SEED_TAG} Electronic City IT plot`,
    propertyType: PropertyType.Plot,
    listingFor: ListingFor.Buy,
    constructionStatus: ConstructionStatus.ReadyToMove,
    city: 'Bengaluru',
    locality: 'Electronic City',
    basePrice: '2600000',
    plotArea: '1200',
    areaUnit: 'sqft',
    highlights: ['Near metro', 'Corner'],
    approvalType: 'BDA',
    isCornerPlot: true,
  },
  {
    title: `${SEED_TAG} OMR Chennai growth plot`,
    propertyType: PropertyType.Plot,
    listingFor: ListingFor.Buy,
    constructionStatus: ConstructionStatus.ReadyToMove,
    city: 'Chennai',
    locality: 'OMR',
    basePrice: '3100000',
    plotArea: '180',
    areaUnit: 'sqyd',
    highlights: ['CMDA', 'IT corridor'],
    approvalType: 'DTCP',
  },
];

function slugify(title: string, id: string) {
  const suffix = id.replace(/-/g, '').slice(0, 6);
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
    .replace(/(^-|-$)/g, '');
  return `${base || 'property'}-${suffix}`;
}

async function seed() {
  const { buildTypeOrmOptions } = await import('../db/datasource');
  const ds = new DataSource({ ...buildTypeOrmOptions(), synchronize: true });
  await ds.initialize();
  const repo = ds.getRepository(InfraProperty);
  const detailsRepo = ds.getRepository(InfraPropertyDetails);

  const existing = await repo
    .createQueryBuilder('p')
    .where('p.title LIKE :tag', { tag: `%${SEED_TAG}%` })
    .getCount();
  if (existing > 0) {
    console.log(`Seed properties already present (${existing}) — skipping.`);
    await ds.destroy();
    return;
  }

  const maxRow = await repo
    .createQueryBuilder('p')
    .select('MAX(p.propertySeq)', 'max')
    .getRawOne<{ max: string | null }>();
  let seq = parseInt(maxRow?.max || '0', 10) || 0;

  for (const r of rows) {
    seq += 1;
    if (seq > 99999) throw new Error('Property code limit');
    const code = `HZI-P${String(seq).padStart(5, '0')}`;
    const basePrice = r.basePrice ?? '0';
    const carpet = Number(r.carpetArea) || 0;
    const plot = Number(r.plotArea) || 0;
    const land = Number(r.landArea) || 0;
    const areaForPpu =
      r.propertyType === PropertyType.Land || r.propertyType === PropertyType.Plot
        ? plot || land
        : carpet || Number(r.builtUpArea) || 0;
    const ppu =
      areaForPpu > 0 && Number(basePrice) > 0 ? Math.round(Number(basePrice) / areaForPpu) : 0;

    const entity = repo.create({
      ...r,
      propertyCode: code,
      propertySeq: seq,
      slug: null,
      isApproved: true,
      isActive: true,
      isFeatured: true,
      isZeroBrokerage: false,
      enableWhatsappEnquiry: true,
      listedBy: 'houznext',
      pricePerUnit: String(ppu),
      gstPercent: '5',
      registrationPercent: '1',
      totalCost: String(
        Number(basePrice) * 1.06 +
          (Number(r.maintenanceDeposit) || 0) +
          (Number(r.otherCharges) || 0),
      ),
    } as InfraProperty);

    const saved = await repo.save(entity);
    saved.slug = slugify(saved.title, saved.propertyId);
    await repo.save(saved);

    const d = detailsRepo.create({ property: saved, additionalNotes: null });
    await detailsRepo.save(d);
    console.log(`✓ ${saved.propertyCode} ${saved.title}`);
  }

  console.log(`Done: ${rows.length} seed properties.`);
  await ds.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
