import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FurnitureLeads } from "./entities/furniture-leads.entity";
import { createFurnitureLeadsDto } from "./dtos/furniture-lead.dto"


@Injectable()
export class FurnitureLeadService {
    constructor(
        @InjectRepository(FurnitureLeads)
        private furnitureLeadsRepository: Repository<FurnitureLeads>,
    ) { }

    async create(createFurnitureLeadsDto: createFurnitureLeadsDto): Promise<FurnitureLeads> {
        const { email, phone, bhkType, rooms, package: pkg, name, propertyName } = createFurnitureLeadsDto;

        const existingLead = await this.furnitureLeadsRepository.findOne({
            where: {
                email,
                phone,
                bhkType,
                rooms,
                package: pkg,
                name,
                propertyName,
            },
        });

        if (existingLead) {
            throw new ConflictException('A lead with the provided details already exists.');
        }

        return await this.furnitureLeadsRepository.save(createFurnitureLeadsDto);
    }


    async findAll(): Promise<FurnitureLeads[]> {
        return await this.furnitureLeadsRepository.find();
    }

    async findOne(id: number): Promise<FurnitureLeads> {
        const formData = await this.furnitureLeadsRepository.findOne({ where: { id } });
        if (!formData) {
            throw new NotFoundException(`Form data with ID ${id} not found`);
        }
        return formData;
    }



    async remove(id: number): Promise<{ message: string }> {
        const deleteResult = await this.furnitureLeadsRepository.delete(id);
        if (!deleteResult.affected) {
            throw new NotFoundException(`Form data with ID ${id} not found`);
        }
        return { message: 'Form data deleted successfully' };
    }
}