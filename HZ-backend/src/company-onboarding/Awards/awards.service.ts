import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '../entities/company.entity';
import { Award } from './entity/company-awards.entity';
import { AwardsDto } from '../dto/company-onboarding.dto';

@Injectable()
export class AwardService {
  constructor(
    @InjectRepository(Award)
    private readonly awardRepository: Repository<Award>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async addAwardToCompany(
    companyId: string,
    awardDto: AwardsDto,
  ): Promise<Award> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    const award = this.awardRepository.create({ ...awardDto, company });
    return this.awardRepository.save(award);
  }

  async getAwardsOfCompanies(companyId: string): Promise<Award[]> {
    return this.awardRepository.find({ where: { company: { id: companyId } } });
  }

  async updateAward(
    companyId: string,
    awardId: string,
    awardDto: Partial<AwardsDto>,
  ): Promise<Award> {
    const award = await this.awardRepository.findOne({
      where: { id: awardId, company: { id: companyId } },
    });

    if (!award) {
      throw new NotFoundException(`Award not found`);
    }

    Object.assign(award, awardDto);
    return this.awardRepository.save(award);
  }

  async deleteAward(companyId: string, awardId: string): Promise<void> {
    const award = await this.awardRepository.findOne({
      where: { id: awardId, company: { id: companyId } },
    });

    if (!award) {
      throw new NotFoundException(`Award not found`);
    }

    await this.awardRepository.remove(award);
  }
}
