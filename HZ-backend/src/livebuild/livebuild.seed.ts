import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  LivebuildCustomer,
  LivebuildProject,
  LivebuildWorkType,
  LivebuildRoom,
  LivebuildRoomWorkType,
  LivebuildDpr,
  LivebuildDprPhoto,
  LivebuildPayment,
  LivebuildQuery,
  LivebuildDocument,
  LivebuildMaterial,
  LivebuildPropertyInfo,
} from './entities';

@Injectable()
export class LivebuildSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(LivebuildProject)
    private readonly projectRepo: Repository<LivebuildProject>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const count = await this.projectRepo.count();
      if (process.env.LIVEBUILD_SEED === 'true' || count === 0) {
        await this.seed();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(
        `[LiveBuild seed] Skipped — run DB migrations first (db/migrations/20260521100000-livebuild-schema.sql): ${msg}`,
      );
    }
  }

  async seed(): Promise<void> {
    const existing = await this.projectRepo.count();
    if (existing > 0 && process.env.LIVEBUILD_SEED !== 'true') {
      return;
    }
    if (existing > 0 && process.env.LIVEBUILD_SEED === 'true') {
      console.log('[LiveBuild seed] LIVEBUILD_SEED=true but projects exist — skipping');
      return;
    }

    await this.dataSource.transaction(async (manager) => {
      const customerRepo = manager.getRepository(LivebuildCustomer);
      const projectRepo = manager.getRepository(LivebuildProject);
      const wtRepo = manager.getRepository(LivebuildWorkType);
      const roomRepo = manager.getRepository(LivebuildRoom);
      const paymentRepo = manager.getRepository(LivebuildPayment);
      const queryRepo = manager.getRepository(LivebuildQuery);
      const docRepo = manager.getRepository(LivebuildDocument);
      const matRepo = manager.getRepository(LivebuildMaterial);
      const propRepo = manager.getRepository(LivebuildPropertyInfo);
      const roomWtRepo = manager.getRepository(LivebuildRoomWorkType);
      const dprRepo = manager.getRepository(LivebuildDpr);
      const dprPhotoRepo = manager.getRepository(LivebuildDprPhoto);

      const customers = await customerRepo.save([
        {
          name: 'Arjun Kumar',
          mobile: '+919876543210',
          email: 'arjun@email.com',
          otpVerified: true,
        },
        {
          name: 'Priya Mehta',
          mobile: '+918765432109',
          email: 'priya@email.com',
          otpVerified: true,
        },
        {
          name: 'Rajesh Verma',
          mobile: '+917654321098',
          email: 'rajesh@email.com',
          otpVerified: true,
        },
      ]);

      await manager.query(
        `CREATE SEQUENCE IF NOT EXISTS livebuild_project_code_seq START 1`,
      );
      await manager.query(
        `SELECT setval('livebuild_project_code_seq', 1, false)`,
      );

      const projects: LivebuildProject[] = await projectRepo.save([
        {
          projectCode: 'HZLB-0001',
          name: '2BHK Modern Flat',
          customerId: customers[0].id,
          customerMobile: '+919876543210',
          propertyType: 'Interior',
          projectType: 'Execution',
          status: 'progress',
          phase: 'Execution',
          pctMethod: 'hybrid',
          overallPct: 72,
          startDate: '2025-11-01',
          dueDate: '2026-04-30',
          address: 'Gachibowli, Hyderabad',
          siteManager: 'Suresh Babu',
        },
        {
          projectCode: 'HZLB-0002',
          name: '3BHK Contemporary',
          customerId: customers[1].id,
          customerMobile: '+918765432109',
          propertyType: 'Interior',
          projectType: 'Procurement',
          status: 'progress',
          phase: 'Procurement',
          pctMethod: 'items',
          overallPct: 41,
          startDate: '2026-01-15',
          dueDate: '2026-07-15',
        },
        {
          projectCode: 'HZLB-0003',
          name: 'Villa Renovation',
          customerId: customers[2].id,
          customerMobile: '+917654321098',
          propertyType: 'Renovation',
          projectType: 'Handover',
          status: 'completed',
          phase: 'Handover',
          pctMethod: 'manual',
          overallPct: 100,
          pctOverride: 100,
          startDate: '2025-06-01',
          dueDate: '2026-02-28',
        },
      ]);

      await manager.query(`SELECT setval('livebuild_project_code_seq', 3, true)`);

      const workTypes = await wtRepo.save([
        {
          name: 'Plywood work',
          category: 'Carpentry',
          defaultRooms: ['Master Bedroom', "Children's Bedroom", 'Kitchen'],
          requiresPhotos: true,
          status: 'active',
          displayOrder: 1,
        },
        {
          name: 'Electrical work',
          category: 'Electrical',
          defaultRooms: ['Master Bedroom', 'Living Room'],
          requiresPhotos: true,
          status: 'active',
          displayOrder: 2,
        },
        {
          name: 'Painting',
          category: 'Painting',
          defaultRooms: ['Master Bedroom', "Children's Bedroom", 'Living Room'],
          requiresPhotos: true,
          status: 'active',
          displayOrder: 3,
        },
        {
          name: 'Flooring',
          category: 'Flooring',
          requiresPhotos: true,
          status: 'active',
          displayOrder: 4,
        },
        {
          name: 'False ceiling',
          category: 'False ceiling',
          defaultRooms: ['Living Room'],
          requiresPhotos: true,
          status: 'active',
          displayOrder: 5,
        },
        {
          name: 'Tiles',
          category: 'Flooring',
          defaultRooms: ['Master Bedroom', "Children's Bedroom", 'Kitchen', 'Master Bath', 'Common Bath'],
          requiresPhotos: true,
          status: 'active',
          displayOrder: 6,
        },
        {
          name: 'Plumbing',
          category: 'Plumbing',
          requiresPhotos: false,
          status: 'disabled',
          displayOrder: 7,
        },
        {
          name: 'Counter work',
          category: 'Carpentry',
          requiresPhotos: false,
          status: 'disabled',
          displayOrder: 8,
        },
      ]);

      const p1 = projects[0];
      const rooms = await roomRepo.save([
        {
          projectId: p1.id,
          name: 'Master Bedroom',
          dimensions: '14x12ft',
          lengthFt: 14,
          widthFt: 12,
          areaSqft: 168,
          ceilingHeight: '10 ft',
          flooring: 'Vitrified tiles',
          pct: 85,
          status: 'live',
          displayOrder: 1,
        },
        {
          projectId: p1.id,
          name: "Children's Bedroom",
          dimensions: '12x10ft',
          lengthFt: 12,
          widthFt: 10,
          areaSqft: 120,
          ceilingHeight: '10 ft',
          flooring: 'Vitrified tiles',
          pct: 72,
          status: 'live',
          displayOrder: 2,
        },
        {
          projectId: p1.id,
          name: 'Living Room',
          dimensions: '18x14ft',
          lengthFt: 18,
          widthFt: 14,
          areaSqft: 252,
          ceilingHeight: '10.5 ft',
          flooring: 'Italian marble',
          pct: 60,
          status: 'live',
          displayOrder: 3,
        },
        {
          projectId: p1.id,
          name: 'Kitchen',
          dimensions: '10x8ft',
          lengthFt: 10,
          widthFt: 8,
          areaSqft: 80,
          ceilingHeight: '10 ft',
          flooring: 'Anti-skid tiles',
          pct: 45,
          status: 'hold',
          holdReason: 'Awaiting granite selection',
          displayOrder: 4,
        },
        {
          projectId: p1.id,
          name: 'Master Bath',
          dimensions: '8x6ft',
          lengthFt: 8,
          widthFt: 6,
          areaSqft: 48,
          ceilingHeight: '9 ft',
          flooring: 'Anti-skid tiles',
          pct: 90,
          status: 'live',
          displayOrder: 5,
        },
        {
          projectId: p1.id,
          name: 'Common Bath',
          dimensions: '6x5ft',
          lengthFt: 6,
          widthFt: 5,
          areaSqft: 30,
          ceilingHeight: '9 ft',
          flooring: 'Anti-skid tiles',
          pct: 88,
          status: 'live',
          displayOrder: 6,
        },
      ]);

      const roomByName = Object.fromEntries(rooms.map((r) => [r.name, r]));
      const wtMapEarly = Object.fromEntries(workTypes.map((w) => [w.name, w]));

      const roomWtRows: Array<{
        roomId: number;
        workTypeId: number;
        pct: number;
        status: string;
      }> = [
        { room: 'Master Bedroom', wt: 'Plywood work', pct: 90, status: 'in_progress' },
        { room: 'Master Bedroom', wt: 'Electrical work', pct: 85, status: 'in_progress' },
        { room: 'Master Bedroom', wt: 'Tiles', pct: 80, status: 'in_progress' },
        { room: 'Master Bedroom', wt: 'Painting', pct: 85, status: 'in_progress' },
        { room: "Children's Bedroom", wt: 'Plywood work', pct: 75, status: 'in_progress' },
        { room: "Children's Bedroom", wt: 'Tiles', pct: 70, status: 'in_progress' },
        { room: "Children's Bedroom", wt: 'Painting', pct: 72, status: 'in_progress' },
        { room: 'Living Room', wt: 'False ceiling', pct: 65, status: 'in_progress' },
        { room: 'Living Room', wt: 'Electrical work', pct: 70, status: 'in_progress' },
        { room: 'Living Room', wt: 'Painting', pct: 68, status: 'in_progress' },
        { room: 'Kitchen', wt: 'Tiles', pct: 40, status: 'not_started' },
        { room: 'Kitchen', wt: 'Plywood work', pct: 50, status: 'not_started' },
        { room: 'Master Bath', wt: 'Tiles', pct: 90, status: 'completed' },
        { room: 'Common Bath', wt: 'Tiles', pct: 88, status: 'completed' },
      ].map((row) => ({
        roomId: roomByName[row.room as keyof typeof roomByName].id,
        workTypeId: wtMapEarly[row.wt as keyof typeof wtMapEarly].id,
        pct: row.pct,
        status: row.status,
      }));

      await roomWtRepo.save(roomWtRows);

      const seedPhotoUrl = (label: string) =>
        `https://placehold.co/800x600/e2e8f0/475569?text=${encodeURIComponent(label)}`;

      const dprDate = '2026-05-30';
      const dprEntries = await dprRepo.save([
        {
          projectId: p1.id,
          roomId: roomByName['Master Bedroom'].id,
          workTypeId: wtMapEarly['Plywood work'].id,
          reportDate: dprDate,
          pctToday: 90,
          doneToday: true,
          notes: 'Loft shutter installation completed',
          submittedBy: 'Suresh Babu',
        },
        {
          projectId: p1.id,
          roomId: roomByName['Master Bedroom'].id,
          workTypeId: wtMapEarly['Painting'].id,
          reportDate: dprDate,
          pctToday: 85,
          doneToday: true,
          notes: 'Final coat applied',
          submittedBy: 'Suresh Babu',
        },
        {
          projectId: p1.id,
          roomId: roomByName['Living Room'].id,
          workTypeId: wtMapEarly['False ceiling'].id,
          reportDate: dprDate,
          pctToday: 65,
          doneToday: true,
          notes: 'Gypsum board fixing in progress',
          submittedBy: 'Suresh Babu',
        },
      ]);

      await dprPhotoRepo.save([
        {
          dprId: dprEntries[0].id,
          fileUrl: seedPhotoUrl('Master BR Plywood'),
          fileName: 'master-br-plywood.jpg',
          fileSize: 245000,
          displayOrder: 0,
        },
        {
          dprId: dprEntries[0].id,
          fileUrl: seedPhotoUrl('Master BR Loft'),
          fileName: 'master-br-loft.jpg',
          fileSize: 198000,
          displayOrder: 1,
        },
        {
          dprId: dprEntries[2].id,
          fileUrl: seedPhotoUrl('Living False Ceiling'),
          fileName: 'living-ceiling.jpg',
          fileSize: 210000,
          displayOrder: 0,
        },
      ]);

      await paymentRepo.save([
        {
          projectId: p1.id,
          label: 'Advance / Mobilisation',
          pct: 20,
          status: 'paid',
          paidDate: '2025-11-05',
          displayOrder: 1,
        },
        {
          projectId: p1.id,
          label: 'Milestone 1 Design',
          pct: 10,
          status: 'paid',
          paidDate: '2025-11-20',
          displayOrder: 2,
        },
        {
          projectId: p1.id,
          label: 'Milestone 2 Procurement',
          pct: 30,
          status: 'paid',
          paidDate: '2025-12-15',
          displayOrder: 3,
        },
        {
          projectId: p1.id,
          label: 'Milestone 3 70% execution',
          pct: 21.6,
          status: 'due',
          dueDate: '2026-03-01',
          displayOrder: 4,
        },
        {
          projectId: p1.id,
          label: 'Final Handover',
          pct: 18.4,
          status: 'upcoming',
          dueDate: '2026-04-30',
          displayOrder: 5,
        },
      ]);

      await queryRepo.save([
        {
          projectId: p1.id,
          queryCode: 'Q001',
          customerName: 'Arjun Kumar',
          subject: 'Plywood quality concern',
          message:
            'The plywood delivered for the master bedroom seems to have surface defects. Please verify batch quality.',
          status: 'open',
        },
        {
          projectId: p1.id,
          queryCode: 'Q002',
          customerName: 'Arjun Kumar',
          subject: 'Tile pattern mismatch',
          message:
            'Living room tile pattern does not match the approved 3D render. Requesting correction.',
          status: 'open',
        },
        {
          projectId: p1.id,
          roomId: roomByName['Living Room'].id,
          queryCode: 'Q003',
          customerName: 'Arjun Kumar',
          subject: 'False ceiling height',
          message: 'False ceiling height in living room appears lower than agreed 9ft.',
          status: 'resolved',
          reply:
            'Site team verified height at 9ft 2in from finished floor. Photos shared on WhatsApp.',
          repliedAt: new Date('2026-02-10'),
          repliedBy: 'Site Manager',
        },
        {
          projectId: p1.id,
          roomId: roomByName['Master Bath'].id,
          queryCode: 'Q004',
          customerName: 'Arjun Kumar',
          subject: 'Tap brand confirmation',
          message: 'Please confirm Jaquar ARIA series is being used as per BOQ.',
          status: 'resolved',
          reply: 'Confirmed — Jaquar ARIA chrome finish fittings installed in master bath.',
          repliedAt: new Date('2026-01-28'),
          repliedBy: 'Procurement',
        },
      ]);

      const seedDocUrl = (name: string) =>
        `https://houznext-assets.s3.ap-south-1.amazonaws.com/livebuild/seed/${encodeURIComponent(name)}.pdf`;

      await docRepo.save([
        {
          projectId: p1.id,
          roomId: roomByName['Master Bedroom'].id,
          name: 'Greenply Gold Plywood — Warranty',
          category: 'warranty',
          relatedWorkType: 'Plywood work',
          fileUrl: seedDocUrl('greenply-warranty'),
          fileName: 'greenply-warranty.pdf',
          fileSize: 250880,
          expiryDate: '2030-01-10',
        },
        {
          projectId: p1.id,
          name: 'Legrand Arteor Switches — Warranty',
          category: 'warranty',
          relatedWorkType: 'Electrical work',
          fileUrl: seedDocUrl('legrand-warranty'),
          fileName: 'legrand-warranty.pdf',
          fileSize: 202752,
          expiryDate: '2028-01-09',
        },
        {
          projectId: p1.id,
          roomId: roomByName['Master Bath'].id,
          name: 'Jaquar ARIA Fittings — Warranty',
          category: 'warranty',
          relatedWorkType: 'Fittings',
          fileUrl: seedDocUrl('jaquar-warranty'),
          fileName: 'jaquar-warranty.pdf',
          fileSize: 319488,
          expiryDate: '2030-01-10',
        },
        {
          projectId: p1.id,
          name: 'Asian Paints Royale — Warranty',
          category: 'warranty',
          relatedWorkType: 'Painting',
          fileUrl: seedDocUrl('asian-paints-warranty'),
          fileName: 'asian-paints-warranty.pdf',
          fileSize: 159744,
          expiryDate: '2026-01-12',
        },
        {
          projectId: p1.id,
          name: 'Project BOQ — Full specification',
          category: 'boq',
          relatedWorkType: 'General',
          fileUrl: seedDocUrl('project-boq'),
          fileName: 'project-boq.pdf',
          fileSize: 1258291,
        },
        {
          projectId: p1.id,
          name: 'Interior Design Agreement',
          category: 'agreement',
          relatedWorkType: 'General',
          fileUrl: seedDocUrl('design-agreement'),
          fileName: 'design-agreement.pdf',
          fileSize: 911360,
        },
        {
          projectId: p1.id,
          name: '2BHK Floor Plan — Final',
          category: 'design',
          relatedWorkType: 'General',
          fileUrl: seedDocUrl('floor-plan'),
          fileName: 'floor-plan.pdf',
          fileSize: 3565158,
        },
        {
          projectId: p1.id,
          name: '3D Renders — All rooms',
          category: 'design',
          relatedWorkType: 'General',
          fileUrl: seedDocUrl('3d-renders'),
          fileName: '3d-renders.pdf',
          fileSize: 29360128,
        },
      ]);

      const wtMap = Object.fromEntries(workTypes.map((w) => [w.name, w]));

      await matRepo.save([
        {
          projectId: p1.id,
          roomId: roomByName['Master Bedroom'].id,
          workTypeId: wtMap['Plywood work'].id,
          name: 'Greenply Gold Plywood',
          specification: '18mm BWR',
          quantity: 24,
          unit: 'No',
          status: 'installed',
        },
        {
          projectId: p1.id,
          roomId: roomByName['Master Bedroom'].id,
          workTypeId: wtMap['Electrical work'].id,
          name: 'Legrand Arteor Switches',
          specification: '6A/16A',
          quantity: 12,
          unit: 'No',
          status: 'installed',
        },
        {
          projectId: p1.id,
          roomId: roomByName['Master Bedroom'].id,
          workTypeId: wtMap['Tiles'].id,
          name: 'Kajaria Vitrified Tiles',
          specification: '800x800mm',
          quantity: 168,
          unit: 'sqft',
          status: 'procured',
        },
        {
          projectId: p1.id,
          roomId: roomByName['Master Bedroom'].id,
          workTypeId: wtMap['Painting'].id,
          name: 'Asian Paints Royale',
          specification: '5-coat',
          quantity: 18,
          unit: 'Ltrs',
          status: 'not_started',
        },
        {
          projectId: p1.id,
          roomId: roomByName["Children's Bedroom"].id,
          workTypeId: wtMap['Plywood work'].id,
          name: 'Greenply Gold Plywood',
          specification: '18mm',
          quantity: 18,
          unit: 'No',
          status: 'installed',
        },
        {
          projectId: p1.id,
          roomId: roomByName["Children's Bedroom"].id,
          workTypeId: wtMap['Tiles'].id,
          name: 'Somany Tiles',
          specification: '600x600mm wood',
          quantity: 120,
          unit: 'sqft',
          status: 'installed',
        },
        {
          projectId: p1.id,
          roomId: roomByName['Living Room'].id,
          workTypeId: wtMap['False ceiling'].id,
          name: 'Saint-Gobain Gypsum',
          specification: '12.5mm',
          quantity: 280,
          unit: 'sqft',
          status: 'procured',
        },
        {
          projectId: p1.id,
          roomId: roomByName['Living Room'].id,
          workTypeId: wtMap['Electrical work'].id,
          name: 'Philips LED Downlights',
          specification: '6W warm white',
          quantity: 14,
          unit: 'No',
          status: 'procured',
        },
        {
          projectId: p1.id,
          roomId: roomByName['Kitchen'].id,
          workTypeId: wtMap['Tiles'].id,
          name: 'Johnson Wall Tiles',
          specification: '300x600mm',
          quantity: 210,
          unit: 'sqft',
          status: 'not_started',
        },
        {
          projectId: p1.id,
          roomId: roomByName['Kitchen'].id,
          name: 'Black Galaxy Granite',
          specification: '20mm',
          quantity: 28,
          unit: 'sqft',
          status: 'not_started',
        },
        {
          projectId: p1.id,
          roomId: roomByName['Master Bath'].id,
          workTypeId: wtMap['Tiles'].id,
          name: 'Nitco Tiles',
          specification: '300x600mm',
          quantity: 160,
          unit: 'sqft',
          status: 'installed',
        },
        {
          projectId: p1.id,
          roomId: roomByName['Master Bath'].id,
          name: 'Jaquar ARIA Fittings',
          specification: 'Chrome',
          quantity: 1,
          unit: 'Set',
          status: 'installed',
        },
        {
          projectId: p1.id,
          roomId: roomByName['Common Bath'].id,
          workTypeId: wtMap['Tiles'].id,
          name: 'RAK Tiles',
          specification: '300x300mm',
          quantity: 80,
          unit: 'sqft',
          status: 'installed',
        },
        {
          projectId: p1.id,
          roomId: roomByName['Common Bath'].id,
          name: 'Parryware Fittings',
          specification: 'Wall mount',
          quantity: 1,
          unit: 'Set',
          status: 'installed',
        },
      ]);

      await propRepo.save({
        projectId: p1.id,
        flatNumber: '904',
        tower: 'Block B',
        totalAreaSqft: 1150,
        carpetAreaSqft: 980,
        balconySqft: 85,
        superBuiltUpSqft: 1320,
        floor: '9',
        facing: 'East',
        designScope: 'Full home interior — modular kitchen, wardrobes, false ceiling, flooring, painting',
        scopeIncluded: [
          'Modular kitchen with lofts',
          'Bedroom wardrobes (2 rooms)',
          'False ceiling — all rooms',
          'Electrical & lighting',
          'Full bathroom fittings (2 baths)',
          'Painting — all rooms (5 coats)',
        ],
        specifications: [
          { label: 'Design style', value: 'Modern Minimal' },
          { label: 'Plywood grade', value: 'BWR ISI 18mm' },
          { label: 'Laminates', value: 'Greenlam / Century' },
          { label: 'Handles', value: 'CP brass, mortise' },
          { label: 'Paint brand', value: 'Asian Paints Royale' },
          { label: 'Electrical', value: 'Legrand Arteor' },
        ],
        notes: 'Premium package with soft-close hardware',
      });

      await projectRepo.update(p1.id, { overallPct: 72 });
    });

    console.log('[LiveBuild seed] Reference data inserted');
  }
}
