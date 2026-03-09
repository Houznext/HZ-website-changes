import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('builder_leads')
export class BuilderLeads {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    phoneNumber: string;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    searchLocation: string;

    @Column({ nullable: false, type: 'float' })
    houseBuiltUpArea: number;

    @Column({ nullable: true, type: 'float' })
    balconyUtilityArea: number;

    @Column({ nullable: true, type: 'int' })
    noOfCarParking: number;
}
