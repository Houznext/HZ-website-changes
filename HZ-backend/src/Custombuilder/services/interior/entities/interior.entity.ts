import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';

@Entity()
export class InteriorService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  bhkType: string;

  @Column({ default: false })
  modularKitchen: boolean;

  @Column({ default: false,nullable: true })
  plywood:string

  @Column({ type: 'jsonb', nullable: true })
  rooms: {
    livingRoom: number;
    kitchen: number;
    bedroom: number;
    bathroom: number;
    dining: number;
  };

  @Column({
    type:'json',nullable:true
  })
  featureBreakDown:{
    roomType:string;
    featureType:string;
    area?:number;
   materialDetails?:string
  }[]

  @Column({ default: false })
  wardrobes: boolean;

  @Column({ nullable: true })
  cabinetry: string;

  @Column({ nullable: true })
  furnitureDesign: string;

  @Column({ default: false })
  wallPaneling: boolean;

  @Column({ nullable: true })
  decorStyle: string;


  @Column({ default: false })
  soundProofing: boolean;

  @Column({ default: false })
  smartHomeFeatures: boolean;

  @Column({ type: 'text', nullable: true })
  storageSolutions: string;

  @Column({ type: 'text', nullable: true })
  additionalRequirements: string;

  @Column({ default: false })
  furnitureLayout: boolean;

  @Column({ default: false })
  ecoFriendlyMaterials: boolean;

  @Column({ default: false })
  childPetFriendly: boolean;

  @Column('text', { array: true, nullable: true })
  materialPreferences: string[];

  @OneToOne(() => CBService, (service) => service.interiorService, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  service: CBService;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
