import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TradeTemplate } from './entities/trade-template.entity';
import { QcCheckpointTemplate } from './entities/qc-checkpoint-template.entity';
import { PaymentMilestone } from './entities/payment-milestone.entity';

const TEMPLATES: Array<{
  name: string;
  slug: string;
  iconName: string;
  unit: string;
  defaultWeightage: number;
  sortOrder: number;
  checkpoints: string[];
}> = [
  {
    name: 'Modular kitchen',
    slug: 'modular-kitchen',
    iconName: 'UtensilsCrossed',
    unit: 'nos',
    defaultWeightage: 15,
    sortOrder: 1,
    checkpoints: [
      'Plywood ISI mark verified',
      'Moisture content check',
      'Carcass level check',
      'Shutter fit and alignment',
      'Hardware smooth operation',
      'Counter top level',
      'Soft close check',
    ],
  },
  {
    name: 'Wardrobes',
    slug: 'wardrobes',
    iconName: 'Columns',
    unit: 'nos',
    defaultWeightage: 12,
    sortOrder: 2,
    checkpoints: [
      'Plywood grade verified',
      'Frame squareness check',
      'Shutter alignment',
      'Locking mechanism',
      'Internal fittings',
      'Surface finish',
    ],
  },
  {
    name: 'False ceiling',
    slug: 'false-ceiling',
    iconName: 'Layout',
    unit: 'sqft',
    defaultWeightage: 10,
    sortOrder: 3,
    checkpoints: [
      'Framework level check',
      'Grid alignment',
      'Board joints',
      'Lighting cutouts',
      'Final surface finish',
      'Paint adhesion',
    ],
  },
  {
    name: 'Flooring',
    slug: 'flooring',
    iconName: 'Grid3X3',
    unit: 'sqft',
    defaultWeightage: 10,
    sortOrder: 4,
    checkpoints: [
      'Sub-floor level check',
      'Joint alignment',
      'Grout consistency',
      'Edge finishing',
      'Surface flatness',
      'Slip test',
    ],
  },
  {
    name: 'Painting',
    slug: 'painting',
    iconName: 'Paintbrush',
    unit: 'sqft',
    defaultWeightage: 8,
    sortOrder: 5,
    checkpoints: [
      'Wall putty smooth',
      'Primer coverage',
      'First coat even',
      'Second coat coverage',
      'Final finish',
      'Colour match verify',
    ],
  },
  {
    name: 'Electrical',
    slug: 'electrical',
    iconName: 'Zap',
    unit: 'points',
    defaultWeightage: 10,
    sortOrder: 6,
    checkpoints: [
      'DB box placement',
      'Conduit routing check',
      'Point wiring verify',
      'Earth leakage test',
      'Switch plate alignment',
      'Final load test',
    ],
  },
  {
    name: 'Plumbing',
    slug: 'plumbing',
    iconName: 'Droplets',
    unit: 'points',
    defaultWeightage: 8,
    sortOrder: 7,
    checkpoints: [
      'Inlet routing',
      'Outlet routing',
      'Pressure test',
      'Leak check',
      'Fixture alignment',
      'Final flow test',
    ],
  },
  {
    name: 'Bathroom remodel',
    slug: 'bathroom-remodel',
    iconName: 'Bath',
    unit: 'nos',
    defaultWeightage: 8,
    sortOrder: 8,
    checkpoints: [
      'Waterproofing coat 1',
      'Waterproofing coat 2',
      'Tile adhesion check',
      'Grout quality',
      'Fixture fit',
      'Drain flow test',
    ],
  },
  {
    name: 'TV unit',
    slug: 'tv-unit',
    iconName: 'Monitor',
    unit: 'nos',
    defaultWeightage: 5,
    sortOrder: 9,
    checkpoints: [
      'Frame level',
      'Backpanel fit',
      'Cable routing',
      'Surface finish',
      'Stability check',
    ],
  },
  {
    name: 'Pooja unit',
    slug: 'pooja-unit',
    iconName: 'Star',
    unit: 'nos',
    defaultWeightage: 5,
    sortOrder: 10,
    checkpoints: [
      'Frame level',
      'Marble/stone fit',
      'Backlit check',
      'Surface finish',
    ],
  },
  {
    name: 'Shoe rack',
    slug: 'shoe-rack',
    iconName: 'Package',
    unit: 'nos',
    defaultWeightage: 3,
    sortOrder: 11,
    checkpoints: ['Frame level', 'Shelf alignment', 'Door/shutter check'],
  },
  {
    name: 'Study unit',
    slug: 'study-unit',
    iconName: 'BookOpen',
    unit: 'nos',
    defaultWeightage: 4,
    sortOrder: 12,
    checkpoints: [
      'Frame level',
      'Desk surface level',
      'Storage fit',
      'Cable management',
    ],
  },
];

@Injectable()
export class InteriorSeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(TradeTemplate)
    private readonly tradeTemplateRepo: Repository<TradeTemplate>,
    @InjectRepository(QcCheckpointTemplate)
    private readonly checkpointRepo: Repository<QcCheckpointTemplate>,
    @InjectRepository(PaymentMilestone)
    private readonly milestoneRepo: Repository<PaymentMilestone>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const count = await this.tradeTemplateRepo.count();
    if (count > 0) return;

    for (const t of TEMPLATES) {
      const template = this.tradeTemplateRepo.create({
        name: t.name,
        slug: t.slug,
        iconName: t.iconName,
        unit: t.unit,
        defaultWeightage: t.defaultWeightage,
        sortOrder: t.sortOrder,
        isActive: true,
        isCustom: false,
      });
      const saved = await this.tradeTemplateRepo.save(template);
      const checkpoints = t.checkpoints.map((checkpointName, idx) =>
        this.checkpointRepo.create({
          tradeTemplateId: saved.id,
          checkpointName,
          isMandatory: true,
          sequence: idx,
        }),
      );
      await this.checkpointRepo.save(checkpoints);
    }
  }
}
