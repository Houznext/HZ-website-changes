import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';

@Entity()
export class DocumentDrafting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  combinationTypes: string;

  @Column('text')
  additionalRequirement: string;

  @OneToOne(() => CBService, (cbService) => cbService.documentDrafting, {
    onDelete: 'CASCADE',
  })
  service: CBService;
}
