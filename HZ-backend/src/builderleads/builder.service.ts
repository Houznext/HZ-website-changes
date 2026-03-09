import { InjectRepository } from "@nestjs/typeorm";
import { CreateBuilderLeadDto } from "./dtos/builderleads.dto";
import { BuilderLeads } from "./Entity/builderlead.entity";
import { Repository } from "typeorm";
import { BadRequestException } from "@nestjs/common";

export class BuilderLeadsService {
    constructor(
        @InjectRepository(BuilderLeads)
        private readonly builderLeadsRepository: Repository<BuilderLeads>,
    ) { }


    async createBuilderLeads(createBuilderLeadDto: CreateBuilderLeadDto): Promise<BuilderLeads> {

        const existingLead = await this.builderLeadsRepository.findOne({
            where: {
                phoneNumber: createBuilderLeadDto.phoneNumber
            }
        })

        if (existingLead) {
            throw new BadRequestException('Lead with this phone number already exists');
        }
        const newLead = this.builderLeadsRepository.create(createBuilderLeadDto);
        return await this.builderLeadsRepository.save(newLead);
    }


    async findAllBuilderLeads(): Promise<BuilderLeads[]> {
        return await this.builderLeadsRepository.find();
    }

}