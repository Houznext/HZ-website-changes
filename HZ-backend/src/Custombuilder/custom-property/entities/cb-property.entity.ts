import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';

import { CustomBuilder } from 'src/Custombuilder/entities/custom-builder.entity';
import { PurposeType } from 'src/property/enums/property.enum';
import { ConstructionScope, PropertyType, CommercialPropertyType } from '../enum/custom-property.enum';
import { HouseConstruction } from './house-construction.entity';
import { InteriorInfo } from './interior-info.entity';
import { CommercialConstruction } from './commercial-construction.entity';

@Entity()
export class CBProperty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  propertyName: string;

  @Column({
    type: 'enum',
    enum: PurposeType,
    default: PurposeType.Residential,
  })
  construction_type: PurposeType;

  @Column({
    type: 'enum',
    enum: PropertyType,
    default: PropertyType.Apartment,
    nullable: true,
  })
  property_type: PropertyType;

  @Column({
    type: 'enum',
    enum: CommercialPropertyType,
    nullable: true,
  })
  commercial_property_type: CommercialPropertyType;

  @Column({
    type: 'enum',
    enum: ConstructionScope,
    default: ConstructionScope.House,
  })
  construction_scope: ConstructionScope;

  @OneToOne(
    () => HouseConstruction,
    (houseConstruction) => houseConstruction.property,
    {
      cascade: true,
    },
  )
  @JoinColumn()
  house_construction_info: HouseConstruction;

  @OneToOne(() => InteriorInfo, (interiorInfo) => interiorInfo.property, {
    cascade: true,
  })
  @JoinColumn()
  interior_info: InteriorInfo;

  @OneToOne(
    () => CommercialConstruction,
    (commercialConstruction) => commercialConstruction.property,
    {
      cascade: true,
    },
  )
  @JoinColumn()
  commercial_construction_info: CommercialConstruction;

  @OneToOne(
    () => CustomBuilder,
    (customBuilder) => customBuilder.propertyInformation,
    {
      onDelete: 'CASCADE',
    },
  )
  customBuilder: CustomBuilder;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
