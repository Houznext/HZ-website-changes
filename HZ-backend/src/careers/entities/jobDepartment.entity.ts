import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Career } from "./career.entity";
import { JobRole } from "./jobRole.entity";

@Entity()
export class JobDepartment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => JobRole, (jobRole) => jobRole.jobDepartment)
    roles: JobRole[]; 

    @OneToMany(() => Career, (career) => career.jobDepartment)
    careers: Career[];
}