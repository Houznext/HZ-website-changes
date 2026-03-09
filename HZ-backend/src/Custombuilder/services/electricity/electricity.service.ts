import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';
import { Electricity } from './entities/electricity.entity';
import {
  CreateElectricityDto,
  UpdateElectricityDto,
} from './dto/electricity.dto';

@Injectable()
export class ElectricityService {
  constructor(
    @InjectRepository(Electricity)
    private readonly electricityRepository: Repository<Electricity>,
    @InjectRepository(CBService)
    private readonly cbServiceRepository: Repository<CBService>,
  ) {}

  // Create an Electricity Service
  async create(
    customBuilderId: string,
    createElectricityDto: CreateElectricityDto,
  ): Promise<Electricity> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['electricity'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      if (service.electricity) {
        throw new BadRequestException('This service already has electricity.');
      }

      const electricity =
        this.electricityRepository.create(createElectricityDto);
      service.electricity = electricity;

      await this.cbServiceRepository.save(service);

      return service.electricity;
    } catch (error) {
      console.error(`Error creating electricity: ${error.message}`);
      throw error;
    }
  }

  // Find All Electricity Records
  async findAll(): Promise<Electricity[]> {
    try {
      const electricityRecords = await this.electricityRepository.find({
        relations: ['service'],
      });

      console.log(`Successfully retrieved all electricity records.`);

      return electricityRecords;
    } catch (error) {
      console.error(`Error retrieving electricity records: ${error.message}`);
      throw error;
    }
  }

  // Find Electricity by ID
  async findById(id: string): Promise<Electricity> {
    try {
      const electricity = await this.electricityRepository.findOne({
        where: { id },
        relations: ['service'],
      });

      if (!electricity) {
        throw new NotFoundException(`Electricity with ID ${id} not found.`);
      }

      console.log(`Successfully retrieved electricity with ID ${id}.`);

      return electricity;
    } catch (error) {
      console.error(
        `Error retrieving electricity with ID ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  // Update Electricity
  async update(
    customBuilderId: string,
    updateElectricityDto: UpdateElectricityDto,
  ): Promise<Electricity> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['electricity'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      if (!service.electricity) {
        throw new NotFoundException(`Electricity not found.`);
      }

      const updatedElectricity = Object.assign(
        service.electricity,
        updateElectricityDto,
      );

      service.electricity = updatedElectricity;

      await this.cbServiceRepository.save(service);

      return updatedElectricity;
    } catch (error) {
      console.error(`Error updating electricity: ${error.message}`);
      throw error;
    }
  }

  // Delete Electricity
  async delete(customBuilderId: string): Promise<void> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['electricity'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      const electricity = service.electricity;

      if (!electricity) {
        throw new NotFoundException(`Electricity not found.`);
      }

      service.electricity = null;

      await this.cbServiceRepository.save(service);
      await this.electricityRepository.delete(electricity.id);
    } catch (error) {
      console.error(`Error deleting electricity: ${error.message}`);
      throw error;
    }
  }
}
