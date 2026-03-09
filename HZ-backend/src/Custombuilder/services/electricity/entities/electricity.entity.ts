import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { SwitchBrands, WireBrands } from '../enum/electricity.enum';

@Entity()
export class Electricity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  typeOfWork: string;

  @Column()
  wiringType: string;

  @Column({
    type: 'enum',
    enum: WireBrands,
    default: WireBrands.Havells,
  })
  wireBrand: WireBrands;

  @Column({
    type: 'enum',
    enum: SwitchBrands,
    default: SwitchBrands.Anchor,
  })
  switchBrand: SwitchBrands;

  @Column('int')
  totalPowerPoints: number;

  @Column('int')
  totalLights: number;

  @Column('int')
  totalFans: number;

  @Column('simple-array')
  safetyEquipment: string[];

  @Column()
  additionalRequirement: string;

  @OneToOne(() => CBService, (cbService) => cbService.electricity, {
    onDelete: 'CASCADE',
  })
  service: CBService;
}
