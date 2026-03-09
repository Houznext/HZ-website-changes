import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import {
  CeilingMaterials,
  CeilingDesigns,
  FinishOptions,
  RoomTypes,
} from '../enum/fallCeiling.enum';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';

@Entity()
export class FallCeiling {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int')
  numberOfRooms: number;

  @Column({
    type: 'enum',
    enum: CeilingMaterials,
    default: CeilingMaterials.Gypsum,
  })
  ceilingMaterial: CeilingMaterials;

  @Column({
    type: 'enum',
    enum: CeilingDesigns,
    default: CeilingDesigns.PlainCeiling,
  })
  ceilingDesign: CeilingDesigns;

  @Column('simple-array')
  lightingOptions: string[];

  @Column({
    type: 'enum',
    enum: FinishOptions,
    default: FinishOptions.Matte,
  })
  ceilingFinish: FinishOptions;

  @Column({
    type: 'enum',
    enum: RoomTypes,
  })
  roomType: RoomTypes;

  @Column('int')
  totalArea: number;

  @Column('text')
  additionalRequirement: string;

  @OneToOne(() => CBService, (cbService) => cbService.fallCeiling)
  service: CBService;
}
