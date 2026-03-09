import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { State } from 'src/geography/state/entities/state.entity';

@Entity('city')
@Unique(['name', 'state'])
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  name: string;

  @ManyToOne(() => State, { eager: true, nullable: false })
  state: State;
}
