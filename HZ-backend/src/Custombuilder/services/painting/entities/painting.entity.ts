import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { PaintBrands } from '../enum/painting.enum';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';

@Entity()
export class Painting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  typeOfWork: string;

  @Column()
  paintType: string;

  @Column({
    type: 'enum',
    enum: PaintBrands,
    default: PaintBrands.ASIAN_PAINTS,
  })
  paintBrand: PaintBrands;

  @Column('int')
  totalArea: number;

  @Column('int')
  numberOfCoats: number;

  @Column('simple-array')
  surfacePreparation: string[];

  @Column('int')
  roomCount: number;

  @Column()
  surfaceType: string;

  @Column()
  finishType: string;

  @Column({ nullable: true })
  additionalRequirement: string;

  @OneToOne(() => CBService, (service) => service.painting)
  service: CBService;
}
