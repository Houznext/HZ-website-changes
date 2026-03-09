import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Career } from '../entities/career.entity';
import { Applicant } from '../entities/applicant.entity';
import { ApplyCareerDto } from '../dto/applyCareer.dto';
import { CareerResponseDto } from '../dto/career.dto';
import { ApplicationStatus } from '../enum/applicationStatus.enum';

@Injectable()
export class CareerService {
  constructor(
    @InjectRepository(Career) private careerRepository: Repository<Career>,
    @InjectRepository(Applicant)
    private applicantRepository: Repository<Applicant>,
  ) {}

  async findAll(): Promise<CareerResponseDto[]> {
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
  async findOne(id: number) {
    return this.careerRepository.findOne({
      where: { id },
      relations: ['applicants'],
    });
  }

  async apply(careerId: number, applyCareerDto: ApplyCareerDto) {
    const career = await this.careerRepository.findOne({
      where: { id: careerId },
    });
    if (!career) throw new Error('Career not found');

    const applicant = this.applicantRepository.create({
      ...applyCareerDto,
      career, // Link the applicant to the career
      status: ApplicationStatus.PENDING, // Explicitly set the status to 'PENDING'
    });

    this.applicantRepository.save(applicant);
    return 'Applied Successfully';
  }

  async getApplicationsByUser(email: string) {
    return this.applicantRepository.find({
      where: { email },
      relations: ['career'], // Include the related Career details
    });
  }
  
}
