
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomBuilder } from '../../../Custombuilder/entities/custom-builder.entity';
import { User } from 'src/user/entities/user.entity'; 
import { MaterialCategoryEnum, MaterialUnitEnum } from '../enums/materials.enum';

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CustomBuilder, cb => cb.materials, { onDelete: 'CASCADE' })
  cb: CustomBuilder;

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  unit: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;
   @Column({ type: 'float', nullable: true })
  quantity?: number;

 
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  uploadedBy?: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  checkedBy?: User;

  @Column({ type: 'timestamp', nullable: true })
  checkedAt?: Date;

  
  @Column('text', { array: true, default: '{}' })
  images: string[];

  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
