import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';
import { Borewell } from './entities/borewell.entity';
import { CreateBorewellDto, UpdateBorewellDto } from './dto/borewell.dto';

@Injectable()
export class BorewellService {
  constructor(
    @InjectRepository(Borewell)
    private borewellRepository: Repository<Borewell>,
    @InjectRepository(CBService)
    private cbServiceRepository: Repository<CBService>,
  ) {}

  // Create a Borewell
  async create(
    customBuilderId: string,
    createBorewellDto: CreateBorewellDto,
  ): Promise<Borewell> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['borewells'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      if (service.borewells) {
        throw new BadRequestException('This service already has a borewell.');
      }

      const borewell = this.borewellRepository.create(createBorewellDto);

      service.borewells = borewell;
      await this.cbServiceRepository.save(service);

      return service.borewells;
    } catch (error) {
      console.error(`Error creating a borewell: ${error.message}`);

      throw error;
    }
  }

  // Find All Borewells
  async findAll(): Promise<Borewell[]> {
    try {
      const borewells = await this.borewellRepository.find({
        relations: ['service'],
      });

      console.log(`Successfully retrieved all borewells.`);

      return borewells;
    } catch (error) {
      console.error(`Error retrieving all borewells: ${error.message}`);

      throw error;
    }
  }

  // Find Borewell by ID
  async findById(id: string): Promise<Borewell> {
    try {
      const borewell = await this.borewellRepository.findOne({
        where: { id },
        relations: ['service'],
      });

      if (!borewell) {
        throw new NotFoundException(`Borewell with ID ${id} not found.`);
      }

      console.log(`Successfully retrieved borewell with ID ${id}.`);

      return borewell;
    } catch (error) {
      console.error(
        `Error retrieving borewell with ID ${id}: ${error.message}`,
      );

      throw error;
    }
  }

  // Update Borewell
  async update(
    customBuilderId: string,
    updateBorewellDto: UpdateBorewellDto,
  ): Promise<Borewell> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['borewells'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      if (!service.borewells) {
        throw new NotFoundException(`Borewell with  not found.`);
      }

      const updatedBorewell = Object.assign(
        service.borewells,
        updateBorewellDto,
      );

      service.borewells = updatedBorewell;

      await this.cbServiceRepository.save(service);

      return updatedBorewell;
    } catch (error) {
      console.error(`Error updating borewell: ${error.message}`);

      throw error;
    }
  }

  // Delete Borewell
  async delete(customBuilderId: string): Promise<void> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['borewells'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      const borewells = service.borewells;

      if (!borewells) {
        throw new NotFoundException(`Borewell not found.`);
      }

      service.borewells = null;

      await this.cbServiceRepository.save(service);

      await this.borewellRepository.delete(borewells.id);
    } catch (error) {
      console.error(`Error deleting borewell: ${error.message}`);

      throw error;
    }
  }
}
