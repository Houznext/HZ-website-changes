import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity()
export class DeveloperInformation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  Name: string;

  @Column()
  PhoneNumber: string;

  @Column()
  whatsappNumber: string;

  @Column()
  officialEmail: string;
}