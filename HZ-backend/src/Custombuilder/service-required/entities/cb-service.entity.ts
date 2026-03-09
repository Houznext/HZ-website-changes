import { CustomBuilder } from 'src/Custombuilder/entities/custom-builder.entity';
import { Borewell } from 'src/Custombuilder/services/borewell/entities/borewell.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ServiceType } from '../enum/cb-service.enum';
import { Centring } from 'src/Custombuilder/services/centring/entities/centring.entity';
import { Flooring } from 'src/Custombuilder/services/flooring/entities/flooring.entity';
import { Plumbing } from 'src/Custombuilder/services/plumbing/entities/plumbing.entity';
import { Painting } from 'src/Custombuilder/services/painting/entities/painting.entity';
import { Electricity } from 'src/Custombuilder/services/electricity/entities/electricity.entity';
import { FallCeiling } from 'src/Custombuilder/services/fallCeiling/entities/fallCeiling.entity';
import { BrickMasonry } from 'src/Custombuilder/services/brickMasonry/entities/brickMasonry.entity';
import { DocumentDrafting } from 'src/Custombuilder/services/documentDrafting/entities/documentDrafting.entity';
import { InteriorService } from 'src/Custombuilder/services/interior/entities/interior.entity';

@Entity()
export class CBService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    nullable: true,
    enum: ServiceType,
    default: ServiceType.Packages,
  })
  serviceType: ServiceType;

  @Column('text', { array: true, nullable: true })
  selectedServices: string[];

  @Column('jsonb', { nullable: true })
  package: {
    city: string | null;
    state: string | null;
    packageSelected: any | null;
  };

  @Column('jsonb', { nullable: true })
  serviceEstimates: Record<
    string,
    { estimatedDays: number; estimatedCost?: number }
  >;

  @Column('jsonb', { nullable: true })
  commercialServiceDetails: Record<string, any>;

  @OneToOne(() => CustomBuilder, (cb) => cb.servicesRequired)
  customBuilder: CustomBuilder;

  @OneToOne(() => Borewell, (borewell) => borewell.service, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  borewells: Borewell;

  @OneToOne(() => Centring, (centring) => centring.service, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  centring: Centring;

  @OneToOne(() => Flooring, (flooring) => flooring.service, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  flooring: Flooring;

  @OneToOne(() => Plumbing, (plumbing) => plumbing.service, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  plumbing: Plumbing;

  @OneToOne(() => Painting, (painting) => painting.service, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  painting: Painting;

  @OneToOne(() => Electricity, (electricity) => electricity.service, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  electricity: Electricity;

  @OneToOne(() => FallCeiling, (fallCeiling) => fallCeiling.service, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  fallCeiling: FallCeiling;

  @OneToOne(() => BrickMasonry, (brickMasonry) => brickMasonry.service, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  brickMasonry: BrickMasonry;

  @OneToOne(
    () => DocumentDrafting,
    (documentDrafting) => documentDrafting.service,
    {
      cascade: true,
      eager: true,
    },
  )
  @JoinColumn()
  documentDrafting: DocumentDrafting;

  @OneToOne(
    () => InteriorService,
    (interiorService) => interiorService.service,
    {
      cascade: true,
      eager: true,
    },
  )
  @JoinColumn()
  interiorService: InteriorService;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
