import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Units } from './property-type-units.entity';
import { Project } from './company-projects.entity';
import { propertyTypeEnum } from '../Enum/company.enum';

@Entity()
export class PropertyType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: propertyTypeEnum,
  })
  typeName: propertyTypeEnum;

  @Column('text')
  description: string;

  @Column('json', { nullable: true })
  additionalAttributes: Record<string, any>;

  @OneToMany(() => Units, (unit) => unit.propertyType)
  units: Units[];

  @OneToOne(() => Project, (project) => project.propertyType)
  project: Project;
}
