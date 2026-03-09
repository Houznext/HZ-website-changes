import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CareerResponseDto,
  CreateCareerDto,
  CreateJobDepartmentDto,
  CreateJobRoleDto,
  DepartmentResponseDto,
  RoleResponseDto,
  UpdateCareerDto,
} from '../dto/career.dto';
import { Career } from '../entities/career.entity';
import { JobDepartment } from '../entities/jobDepartment.entity';
import { JobRole } from '../entities/jobRole.entity';
import { Applicant } from '../entities/applicant.entity';
import { ApplicationStatus } from '../enum/applicationStatus.enum';

@Injectable()
export class CareerAdminService {
  constructor(
    @InjectRepository(Career)
    private readonly careerRepository: Repository<Career>,
    @InjectRepository(JobDepartment)
    private readonly jobDepartmentRepository: Repository<JobDepartment>,
    @InjectRepository(JobRole)
    private readonly jobRoleRepository: Repository<JobRole>,
    @InjectRepository(Applicant)
    private readonly applicantRepository: Repository<Applicant>,
  ) { }

  async create(createCareerDto: CreateCareerDto): Promise<CareerResponseDto> {
    const { jobDepartmentId, jobRoleId, ...rest } = createCareerDto;

    const jobDepartment = await this.jobDepartmentRepository.findOne({
      where: { id: jobDepartmentId },
    });

    const jobRole = await this.jobRoleRepository.findOne({
      where: { id: jobRoleId },
      relations: ['jobDepartment'],
    });

    // Ensure the JobRole belongs to the provided JobDepartment
    if (!jobRole || jobRole.jobDepartment.id !== jobDepartmentId) {
      throw new Error(
        'The job role does not belong to the specified department',
      );
    }

    const posted = new Date();

    const career = this.careerRepository.create({
      ...rest,
      jobDepartment,
      jobRole,
      posted,
    });

    const savedCareer = await this.careerRepository.save(career);

    return {
      id: savedCareer.id,
      jobTitle: savedCareer.jobTitle,
      location: savedCareer.location,
      posted: savedCareer.posted,
      openings: savedCareer.openings,
      jobDescription: savedCareer.jobDescription,
      experience: savedCareer.experience,
      skills: savedCareer.skills,
      qualification: savedCareer.qualification,
      jobType: savedCareer.jobType,
      jobHighlights: savedCareer.jobHighlights,
      createdAt: savedCareer.createdAt,
      updatedAt: savedCareer.updatedAt,
      jobDepartment: {
        id: savedCareer.jobDepartment.id,
        name: savedCareer.jobDepartment.name,
        description: savedCareer.jobDepartment.description,
      },
      jobRole: {
        id: savedCareer.jobRole.id,
        title: savedCareer.jobRole.title,
        description: savedCareer.jobRole.description,
      },
    };
  }

  async createJobDepartment(createJobDepartmentDto: CreateJobDepartmentDto) {
    const { name, description } = createJobDepartmentDto;
    const jobDepartment = this.jobDepartmentRepository.create({
      name,
      description,
    });

    return this.jobDepartmentRepository.save(jobDepartment);
  }

  async createJobRole(createJobRoleDto: CreateJobRoleDto) {
    const { title, description, jobDepartmentId } = createJobRoleDto;

    // Find the associated JobDepartment
    const jobDepartment = await this.jobDepartmentRepository.findOne({
      where: { id: jobDepartmentId },
    });

    if (!jobDepartment) {
      throw new NotFoundException('JobDepartment not found');
    }

    // Create the JobRole with the associated JobDepartment
    const jobRole = this.jobRoleRepository.create({
      title,
      description,
      jobDepartment,
    });

    return this.jobRoleRepository.save(jobRole);
  }

  async updateCareer(updateCareerDto: UpdateCareerDto) {
    const { id, jobDepartmentId, jobRoleId, ...updateFields } = updateCareerDto;

    const career = await this.careerRepository.findOne({
      where: { id },
      relations: ['jobDepartment', 'jobRole'],
    });

    if (!career) {
      throw new Error('Career not found');
    }
    // If jobDepartmentId is provided, fetch and assign the department
    if (jobDepartmentId) {
      const jobDepartment = await this.jobDepartmentRepository.findOne({
        where: { id: jobDepartmentId },
      });

      if (!jobDepartment) {
        throw new Error('Job Department not found');
      }
      career.jobDepartment = jobDepartment;
    }

    // If jobRoleId is provided, fetch and assign the role
    if (jobRoleId) {
      const jobRole = await this.jobRoleRepository.findOne({
        where: { id: jobRoleId },
      });

      if (!jobRole) {
        throw new Error('Job Role not found');
      }

      if (jobDepartmentId && jobRole.jobDepartment.id !== jobDepartmentId) {
        throw new Error(
          'The Job Role does not belong to the specified Job Department',
        );
      }
      career.jobRole = jobRole;
    }

    // Update the remaining fields
    Object.assign(career, updateFields);

    // Save the updated entity
    return this.careerRepository.save(career);
  }

  async deleteCareer(id: number) {
    return this.careerRepository.delete(id);
  }

  async viewAllCareers(): Promise<CareerResponseDto[]> {
    const careers = await this.careerRepository.find({
      relations: ['jobDepartment', 'jobRole'],
    });

    if (!careers) {
      throw new Error(`No Careers found`);
    }

    return careers.map((savedCareer) => ({
      id: savedCareer.id,
      jobTitle: savedCareer.jobTitle,
      location: savedCareer.location,
      posted: savedCareer.posted,
      openings: savedCareer.openings,
      jobDescription: savedCareer.jobDescription,
      experience: savedCareer.experience,
      skills: savedCareer.skills,
      qualification: savedCareer.qualification,
      jobType: savedCareer.jobType,
      jobHighlights: savedCareer.jobHighlights,
      createdAt: savedCareer.createdAt,
      updatedAt: savedCareer.updatedAt,
      jobDepartment: {
        id: savedCareer.jobDepartment.id,
        name: savedCareer.jobDepartment.name,
        description: savedCareer.jobDepartment.description,
      },
      jobRole: {
        id: savedCareer.jobRole.id,
        title: savedCareer.jobRole.title,
        description: savedCareer.jobRole.description,
      },
    }));
  }

  async getCareer(careerId: number): Promise<CareerResponseDto> {
    const savedCareer = await this.careerRepository.findOne({
      where: { id: careerId },
      relations: ['jobRole', 'jobDepartment'],
    });

    if (!savedCareer) {
      throw new Error(`Career with ID ${careerId} not found`);
    }

    return {
      id: savedCareer.id,
      jobTitle: savedCareer.jobTitle,
      location: savedCareer.location,
      posted: savedCareer.posted,
      openings: savedCareer.openings,
      jobDescription: savedCareer.jobDescription,
      experience: savedCareer.experience,
      skills: savedCareer.skills,
      qualification: savedCareer.qualification,
      jobType: savedCareer.jobType,
      jobHighlights: savedCareer.jobHighlights,
      createdAt: savedCareer.createdAt,
      updatedAt: savedCareer.updatedAt,
      jobDepartment: {
        id: savedCareer.jobDepartment.id,
        name: savedCareer.jobDepartment.name,
        description: savedCareer.jobDepartment.description,
      },
      jobRole: {
        id: savedCareer.jobRole.id,
        title: savedCareer.jobRole.title,
        description: savedCareer.jobRole.description,
      },
    };
  }

  async viewAllDepartments(): Promise<DepartmentResponseDto[]> {
    const departments = await this.jobDepartmentRepository.find({});
    return departments.map((department) => ({
      id: department.id,
      name: department.name,
      description: department.description
    }));
  }

  async viewAllRoles(): Promise<RoleResponseDto[]> {
    const roles = await this.jobRoleRepository.find();
    if (!roles.length) {
      throw new NotFoundException(`No roles found`);
    }
    return roles.map((role) => ({
      id: role.id,
      title: role.title,
      description: role.description
    }))
  }

  async viewAllRolesByDepartment(departmentId: number): Promise<RoleResponseDto[]> {
    const roles = await this.jobRoleRepository.find(
      { where: { jobDepartment: { id: departmentId } } }
    );
    if (!roles.length) {
      throw new NotFoundException(`No roles found for department ID ${departmentId}`);
    }
    return roles.map((role) => ({
      id: role.id,
      title: role.title,
      description: role.description
    }))
  }

  async getAllApplications() {
    return this.applicantRepository.find({ relations: ['career'] });
  }

  async getApplicationsByEmail(email: string) {
    return this.applicantRepository.find({
      where: { email },
      relations: ['career'],
    });
  }

  async getApplicationsByStatus(status: ApplicationStatus) {
    return this.applicantRepository.find({
      where: { status },
      relations: ['career'],
    });
  }

  async updateApplicationStatus(id: number, status: ApplicationStatus) {
    const applicant = await this.applicantRepository.findOne({ where: { id } });
    if (!applicant) {
      throw new Error('Applicant not found');
    }

    applicant.status = status;
    return this.applicantRepository.save(applicant);
  }
}
