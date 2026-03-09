import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { JobType } from '../enum/jobType.enum';
import { Applicant } from './applicant.entity';
import { JobDepartment } from './jobDepartment.entity';
import { JobRole } from './jobRole.entity';

@Entity()
export class Career {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    jobTitle: string;

    @Column()
    location: string;

    @Column()
    posted: Date;

    @Column({ default: 0 })
    openings: number;

    @OneToMany(() => Applicant, (applicant) => applicant.career)
    applicants: Applicant[];

    @Column()
    jobDescription: string;

    @ManyToOne(() => JobDepartment, (jobDepartment) => jobDepartment.careers)
    jobDepartment: JobDepartment;

    @ManyToOne(() => JobRole, (jobRole) => jobRole.id)
    jobRole: JobRole;

    @Column()
    experience: string;

    @Column("simple-array")
    skills: string[];

    @Column()
    qualification: string;

    @Column({
        type: "enum",
        enum: JobType,
    })
    jobType: JobType;

    @Column({ nullable: true })
    jobHighlights: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}