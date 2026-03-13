import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScopeTemplate } from './entities/scope-template.entity';
import { QcCheckpointTemplate } from './entities/qc-checkpoint-template.entity';

@Injectable()
export class BuildliveSeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(ScopeTemplate)
    private readonly scopeTemplateRepo: Repository<ScopeTemplate>,
    @InjectRepository(QcCheckpointTemplate)
    private readonly qcTemplateRepo: Repository<QcCheckpointTemplate>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.scopeTemplateRepo.count();
    if (count > 0) {
      return;
    }

    const templates: Array<{
      name: string;
      slug: string;
      iconName: string;
      unit: string;
      defaultWeightage: number;
      checkpoints: string[];
    }> = [
      {
        name: 'Painting',
        slug: 'painting',
        iconName: 'Paintbrush',
        unit: 'sqft',
        defaultWeightage: 10,
        checkpoints: [
          'Surface cleaning done',
          'Wall putty applied and dried',
          'Primer coat done',
          'First paint coat done',
          'Second coat done',
          'Edge finish checked',
          'Customer approved',
        ],
      },
      {
        name: 'Plumbing',
        slug: 'plumbing',
        iconName: 'Droplets',
        unit: 'points',
        defaultWeightage: 12,
        checkpoints: [
          'Pipe routing marked',
          'Concealed pipes laid',
          'Pressure test passed',
          'Fixtures installed',
          'Final flow test done',
          'Customer approved',
        ],
      },
      {
        name: 'Brick Masonry',
        slug: 'brick-masonry',
        iconName: 'Layers',
        unit: 'sqft',
        defaultWeightage: 15,
        checkpoints: [
          'Mix ratio verified',
          'Course alignment checked',
          'Vertical plumb OK',
          'Curing started',
          '7-day curing complete',
          'Surface quality checked',
        ],
      },
      {
        name: 'Electrical',
        slug: 'electrical',
        iconName: 'Zap',
        unit: 'points',
        defaultWeightage: 12,
        checkpoints: [
          'Conduit routing approved',
          'Wiring pulled',
          'DB box wiring done',
          'Earthing verified',
          'Load test passed',
          'Points labelled',
          'Cover plates fitted',
        ],
      },
      {
        name: 'Flooring',
        slug: 'flooring',
        iconName: 'Grid3X3',
        unit: 'sqft',
        defaultWeightage: 10,
        checkpoints: [
          'Sub-base levelled',
          'Waterproofing done in wet areas',
          'Dry run alignment done',
          'Adhesive applied',
          'Hollow tile test passed',
          'Grout completed',
          'Polish done',
        ],
      },
      {
        name: 'Fall Ceiling',
        slug: 'fall-ceiling',
        iconName: 'Layout',
        unit: 'sqft',
        defaultWeightage: 8,
        checkpoints: [
          'GI frame level verified',
          'Board fixed',
          'Joint tape applied',
          'Finish coat done',
          'Light cutouts aligned',
          'Final paint done',
        ],
      },
      {
        name: 'Modular Furniture',
        slug: 'modular-furniture',
        iconName: 'Package',
        unit: 'nos',
        defaultWeightage: 12,
        checkpoints: [
          'Design approved by customer',
          'Carcass square and level',
          'Shutter alignment OK',
          'Hinge adjusted',
          'Drawer glide smooth',
          'Handle fitted',
          'Final snag done',
        ],
      },
      {
        name: 'Doors and Windows',
        slug: 'doors-windows',
        iconName: 'DoorOpen',
        unit: 'nos',
        defaultWeightage: 8,
        checkpoints: [
          'Frame plumb and level',
          'Shutter fits flush',
          'Hardware functioning',
          'Weather seal applied',
          'Finish and paint done',
        ],
      },
      {
        name: 'Civil and Structural',
        slug: 'civil',
        iconName: 'Building2',
        unit: 'cum',
        defaultWeightage: 20,
        checkpoints: [
          'Shuttering checked',
          'Rebar spacing correct',
          'Concrete grade verified',
          'Casting done',
          'Curing in progress',
          'De-shuttering done',
          'Quality inspected',
        ],
      },
      {
        name: 'Interior Finishing',
        slug: 'interior-finish',
        iconName: 'Sparkles',
        unit: 'percent',
        defaultWeightage: 8,
        checkpoints: [
          'Wall putty sanded',
          'Texture applied',
          'Skirting fitted',
          'Corners finished',
          'Final paint done',
          'Room snag check done',
          'Customer walkthrough done',
        ],
      },
    ];

    for (const tpl of templates) {
      const scopeTemplate = this.scopeTemplateRepo.create({
        name: tpl.name,
        slug: tpl.slug,
        iconName: tpl.iconName,
        unit: tpl.unit,
        defaultWeightage: tpl.defaultWeightage,
        sortOrder: 0,
        isActive: true,
        isCustom: false,
      });
      const savedTemplate = await this.scopeTemplateRepo.save(scopeTemplate);

      const checkpoints = tpl.checkpoints.map((name, index) =>
        this.qcTemplateRepo.create({
          scopeTemplate: savedTemplate,
          checkpointName: name,
          isMandatory: true,
          sequence: index,
        }),
      );
      await this.qcTemplateRepo.save(checkpoints);
    }
  }
}

