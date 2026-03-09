import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';
import { FallCeiling } from './entities/fallCeiling.entity';
import {
  CreateFallCeilingDto,
  UpdateFallCeilingDto,
} from './dto/fallCeiling.dto';

@Injectable()
export class FallCeilingService {
  constructor(
    @InjectRepository(FallCeiling)
    private readonly fallCeilingRepository: Repository<FallCeiling>,
    @InjectRepository(CBService)
    private readonly cbServiceRepository: Repository<CBService>,
  ) {}

  // Create a Fall Ceiling Service
  async create(
    customBuilderId: string,
    createFallCeilingDto: CreateFallCeilingDto,
  ): Promise<FallCeiling> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['fallCeiling'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      if (service.fallCeiling) {
        throw new BadRequestException(
          'This service already has a fall ceiling.',
        );
      }

      const fallCeiling =
        this.fallCeilingRepository.create(createFallCeilingDto);
      service.fallCeiling = fallCeiling;

      await this.cbServiceRepository.save(service);

      return service.fallCeiling;
    } catch (error) {
      console.error(`Error creating fall ceiling: ${error.message}`);
      throw error;
    }
  }

  // Find All Fall Ceilings
  async findAll(): Promise<FallCeiling[]> {
    try {
      const fallCeilings = await this.fallCeilingRepository.find({
        relations: ['service'],
      });

      console.log(`Successfully retrieved all fall ceilings.`);

      return fallCeilings;
    } catch (error) {
      console.error(`Error retrieving fall ceilings: ${error.message}`);
      throw error;
    }
  }

  // Find Fall Ceiling by ID
  async findById(id: string): Promise<FallCeiling> {
    try {
      const fallCeiling = await this.fallCeilingRepository.findOne({
        where: { id },
        relations: ['service'],
      });

      if (!fallCeiling) {
        throw new NotFoundException(`Fall Ceiling with ID ${id} not found.`);
      }

      console.log(`Successfully retrieved fall ceiling with ID ${id}.`);

      return fallCeiling;
    } catch (error) {
      console.error(
        `Error retrieving fall ceiling with ID ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  // Update Fall Ceiling
  async update(
    customBuilderId: string,
    updateFallCeilingDto: UpdateFallCeilingDto,
  ): Promise<FallCeiling> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['fallCeiling'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      if (!service.fallCeiling) {
        throw new NotFoundException(`Fall Ceiling not found.`);
      }

      const updatedFallCeiling = Object.assign(
        service.fallCeiling,
        updateFallCeilingDto,
      );

      service.fallCeiling = updatedFallCeiling;

      await this.cbServiceRepository.save(service);

      return updatedFallCeiling;
    } catch (error) {
      console.error(`Error updating fall ceiling: ${error.message}`);
      throw error;
    }
  }

  // Delete Fall Ceiling
  async delete(customBuilderId: string): Promise<void> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['fallCeiling'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      const fallCeiling = service.fallCeiling;

      if (!fallCeiling) {
        throw new NotFoundException(`Fall Ceiling not found.`);
      }

      service.fallCeiling = null;

      await this.cbServiceRepository.save(service);
      await this.fallCeilingRepository.delete(fallCeiling.id);
    } catch (error) {
      console.error(`Error deleting fall ceiling: ${error.message}`);
      throw error;
    }
  }
}
