import { User } from 'src/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class FurnitureLeads {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    bhkType: string;

    @Column('jsonb')
    rooms: {
        livingRoom: number;
        kitchen: number;
        bedroom: number;
        bathroom: number;
        dining: number;
    };

    @Column()
    package: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    phone: string;

    @Column()
    propertyName: string;

    @ManyToOne(() => User, (user) => user.furnitureLeads)
    user: User;
}
