import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ConstructionScope } from 'src/Custombuilder/custom-property/enum/custom-property.enum';
import { Branch } from 'src/branch/entities/branch.entity';

@Entity('package')
@Unique(['name', 'branch', 'construction_scope']) // avoid duplicates per branch/scope
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 160 })
  name: string;

  @Column('int')
  ratePerSqft: number;

  @Column('jsonb')
  features: {
    title: string;
    points: string[];
  }[];

  @ManyToOne(() => Branch, { onDelete: 'CASCADE', eager: true })
  branch: Branch;

  @Column({
    type: 'enum',
    enum: ConstructionScope,
    enumName: 'construction_scope_enum',
    nullable: true, // set false if you want to enforce it
  })
  construction_scope: ConstructionScope | null;
}
