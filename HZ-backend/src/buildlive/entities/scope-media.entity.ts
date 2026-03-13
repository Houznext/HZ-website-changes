import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ScopeOfWork } from './scope-of-work.entity';

export enum ScopeMediaType {
  PHOTO = 'photo',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

@Entity('bl_scope_media')
export class ScopeMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ScopeOfWork, (scope) => scope.media, {
    onDelete: 'CASCADE',
  })
  scope: ScopeOfWork;

  @Column({ type: 'varchar', length: 255, nullable: true })
  dailyUpdateId?: string | null;

  @Column({ type: 'varchar', length: 512 })
  s3Url: string;

  @Column({
    type: 'enum',
    enum: ScopeMediaType,
    default: ScopeMediaType.PHOTO,
  })
  mediaType: ScopeMediaType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  caption?: string | null;

  @Column({ type: 'varchar', length: 255 })
  uploadedBy: string;

  @Column({ type: 'date' })
  takenAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

