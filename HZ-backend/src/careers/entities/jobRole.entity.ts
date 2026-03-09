import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { JobDepartment } from "./jobDepartment.entity";
import { Career } from "./career.entity";

@Entity()
export class JobRole {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @ManyToOne(() => JobDepartment, (jobDepartment) => jobDepartment.id)
    jobDepartment: JobDepartment;

}
