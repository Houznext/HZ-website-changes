import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Project } from "./company-projects.entity";
import { Company } from "./company.entity";

@Entity()
export class Sellers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  role: string;

  @Column()
  priceRange: string;

  @Column()
  contactEmail: string;

  @Column()
  phone: string;

  @Column()
  profilePhoto: string;

}
