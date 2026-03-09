import { HouseConstruction } from 'src/Custombuilder/custom-property/entities/house-construction.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class CBFloor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  floor: number;

  @Column({ nullable: true })
  portions: number;

  @Column({ type: 'text', array: true, nullable: true })
  type_of_portions: string[];

  @Column('text', { array: true, nullable: true })
  ground_floor_details: string[];

  @Column({ type: 'jsonb', nullable: true })
  portionDetails: {
    portionType: string;
    bedrooms: number;
    bathrooms: number;
    balconies: number;
    indian_bathroom_required: boolean;
    additional_rooms: string[];
  }[];

  @ManyToOne(
    () => HouseConstruction,
    (houseConstruction) => houseConstruction.floors,
    {
      onDelete: 'CASCADE',
    },
  )
  property: HouseConstruction;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
