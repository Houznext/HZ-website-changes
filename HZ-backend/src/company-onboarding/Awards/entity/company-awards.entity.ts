import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Company } from '../../entities/company.entity';

@Entity()
export class Award {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  awardTitle: string;

  @Column()
  awardCategory: string;

  @Column()
  issuingOrganization: string;

  @Column()
  yearReceived: number;

  @Column('text')
  description: string;

  @ManyToOne(() => Company, (company) => company.awards,{ onDelete: 'CASCADE',})
  company: Company;
}
