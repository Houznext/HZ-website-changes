import { Transform } from 'class-transformer';
import { CustomBuilder } from 'src/Custombuilder/entities/custom-builder.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,JoinColumn
} from 'typeorm';
import { DailyProgressStatus } from '../enum/daily-progress.enum';
import { Phase } from 'src/Custombuilder/phase/entities/phase.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class DailyProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 0 })
  day: number;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  date: Date;

  @Column({
    type: 'text',
    array: true,
    nullable: true,
  })
  floor: string[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  imageOrVideo: string[];

  @Column({
    type: 'enum',
    enum: DailyProgressStatus,
    default: DailyProgressStatus.Pending,
  })
  status: DailyProgressStatus;

  @Column({ type: 'text', nullable: true, array: true, default: null })
  workType: string[];

  @Column({
    type: 'text',
    array: true,
    nullable: true,
  })
  placeType: string[];

  @Column({ type: 'text', nullable: true, default: null })
  issues: string;

  @Column('jsonb', { nullable: true })
  materials: {
    material: string;
    quantity: number;
    desc: string;
  }[];

  @Column({ type: 'int', nullable: true })
  laborCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  expensesIncurred: number;

  @Column({ type: 'text', nullable: true })
  customerNotes: string;

  @Column({ type: 'text', nullable: true })
  roomType: string;

  @Column({ type: 'text', nullable: true })
  featureType: string;

  @ManyToOne(() => CustomBuilder, (customBuilder) => customBuilder.logs, {
    onDelete: 'CASCADE',
  })
  customBuilder: CustomBuilder;

  @ManyToOne(() => Phase, (phase) => phase.logs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
   @JoinColumn({ name: 'phaseId' }) 
  phase: Phase | null;

  @Column({ type: 'int', nullable: true })
  phaseId: number | null;
   @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @Column({ type: 'uuid', nullable: true })
  uploadedById: string;

  @Column({ type: 'text', nullable: true })
  uploadedByName: string | null;

  @Column({ type: 'text', nullable: true })
  uploadedByProfile: string | null;
  // @ManyToOne(() => LocationDetails, { nullable: true, onDelete: 'SET NULL' })
  // @JoinColumn({ name: 'locationId' })
  // location: LocationDetails;

  // @Column({ type: 'int', nullable: true })
  // locationId: number | null;

 
   @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: string | null;

  @Column('jsonb', { nullable: true })
  uploadLocation: {
    locality?: string;
    subLocality?: string;
    place_id?: string;
    addressLine?: string;
    accuracyMeters?: number;
  } | null;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
