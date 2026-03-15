import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { InteriorProject } from './interior-project.entity';

@Entity('int_reps')
export class Rep extends BaseEntity {
  @Column({ type: 'varchar', nullable: true, default: '' })
  fullName: string | null;

  @Column({ type: 'varchar', nullable: true, default: 'Interior Designer' })
  designation: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  mobile: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true, default: '' })
  passwordHash: string | null;

  @Column({ type: 'boolean', nullable: true, default: true })
  isActive: boolean | null;

  @OneToMany(() => InteriorProject, (project) => project.rep)
  projects: InteriorProject[];
}
