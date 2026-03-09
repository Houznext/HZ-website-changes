import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('state')
@Unique(['name'])
export class State {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, default: 'India' })
  country: string;
}
