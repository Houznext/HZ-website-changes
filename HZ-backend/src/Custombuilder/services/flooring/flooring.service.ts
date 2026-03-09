import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';
import { Flooring } from './entities/flooring.entity';
import { CreateFlooringDto, UpdateFlooringDto } from './dto/flooring.dto';

@Injectable()
export class FlooringService {
  constructor(
    @InjectRepository(Flooring)
    private flooringRepository: Repository<Flooring>,
    @InjectRepository(CBService)
    private cbServiceRepository: Repository<CBService>,
  ) {}

  // Create a Flooring Service
  async create(
    customBuilderId: string,
    createFlooringDto: CreateFlooringDto,
  ): Promise<Flooring> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['flooring'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      if (service.flooring) {
        throw new BadRequestException('This service already has flooring.');
      }

      const flooring = this.flooringRepository.create(createFlooringDto);
      service.flooring = flooring;

      await this.cbServiceRepository.save(service);

      return service.flooring;
    } catch (error) {
      console.error(`Error creating flooring: ${error.message}`);
      throw error;
    }
  }

  // Find All Floorings
  async findAll(): Promise<Flooring[]> {
    try {
      const floorings = await this.flooringRepository.find({
        relations: ['service'],
      });

      console.log(`Successfully retrieved all floorings.`);

      return floorings;
    } catch (error) {
      console.error(`Error retrieving all floorings: ${error.message}`);
      throw error;
    }
  }

  // Find Flooring by ID
  async findById(id: string): Promise<Flooring> {
    try {
      const flooring = await this.flooringRepository.findOne({
        where: { id },
        relations: ['service'],
      });

      if (!flooring) {
        throw new NotFoundException(`Flooring with ID ${id} not found.`);
      }

      console.log(`Successfully retrieved flooring with ID ${id}.`);

      return flooring;
    } catch (error) {
      console.error(
        `Error retrieving flooring with ID ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  // Update Flooring
  async update(
    customBuilderId: string,
    updateFlooringDto: UpdateFlooringDto,
  ): Promise<Flooring> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['flooring'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      if (!service.flooring) {
        throw new NotFoundException(`Flooring not found.`);
      }

      const updatedFlooring = Object.assign(
        service.flooring,
        updateFlooringDto,
      );

      service.flooring = updatedFlooring;

      await this.cbServiceRepository.save(service);

      return updatedFlooring;
    } catch (error) {
      console.error(`Error updating flooring: ${error.message}`);
      throw error;
    }
  }

  // Delete Flooring
  async delete(customBuilderId: string): Promise<void> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['flooring'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      const flooring = service.flooring;

      if (!flooring) {
        throw new NotFoundException(`Flooring not found.`);
      }

      service.flooring = null;

      await this.cbServiceRepository.save(service);
      await this.flooringRepository.delete(flooring.id);
    } catch (error) {
      console.error(`Error deleting flooring: ${error.message}`);
      throw error;
    }
  }
}
