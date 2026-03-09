import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';
import { BrickMasonry } from './entities/brickMasonry.entity';
import {
  CreateBrickMasonryDto,
  UpdateBrickMasonryDto,
} from './dto/brickMasonry.dto';

@Injectable()
export class BrickMasonryService {
  constructor(
    @InjectRepository(BrickMasonry)
    private brickMasonryRepository: Repository<BrickMasonry>,
    @InjectRepository(CBService)
    private cbServiceRepository: Repository<CBService>,
  ) {}

  async create(
    customBuilderId: string,
    createBrickMasonryDto: CreateBrickMasonryDto,
  ): Promise<BrickMasonry> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['brickMasonry'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      if (service.brickMasonry) {
        throw new BadRequestException(
          'This service already has a brick masonry.',
        );
      }

      const brickMasonry = this.brickMasonryRepository.create(
        createBrickMasonryDto,
      );
      service.brickMasonry = brickMasonry;
      await this.cbServiceRepository.save(service);

      return service.brickMasonry;
    } catch (error) {
      console.error(`Error creating brick masonry: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<BrickMasonry[]> {
    try {
      const brickMasonries = await this.brickMasonryRepository.find({
        relations: ['service'],
      });
      console.log(`Successfully retrieved all brick masonries.`);
      return brickMasonries;
    } catch (error) {
      console.error(`Error retrieving all brick masonries: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string): Promise<BrickMasonry> {
    try {
      const brickMasonry = await this.brickMasonryRepository.findOne({
        where: { id },
        relations: ['service'],
      });

      if (!brickMasonry) {
        throw new NotFoundException(`BrickMasonry with ID ${id} not found.`);
      }

      console.log(`Successfully retrieved brick masonry with ID ${id}.`);
      return brickMasonry;
    } catch (error) {
      console.error(
        `Error retrieving brick masonry with ID ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  async update(
    customBuilderId: string,
    updateBrickMasonryDto: UpdateBrickMasonryDto,
  ): Promise<BrickMasonry> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['brickMasonry'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      if (!service.brickMasonry) {
        throw new NotFoundException(`BrickMasonry not found.`);
      }

      const updatedBrickMasonry = Object.assign(
        service.brickMasonry,
        updateBrickMasonryDto,
      );
      service.brickMasonry = updatedBrickMasonry;
      await this.cbServiceRepository.save(service);

      return updatedBrickMasonry;
    } catch (error) {
      console.error(`Error updating brick masonry: ${error.message}`);
      throw error;
    }
  }

  async delete(customBuilderId: string): Promise<void> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['brickMasonry'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      const brickMasonry = service.brickMasonry;
      if (!brickMasonry) {
        throw new NotFoundException(`BrickMasonry not found.`);
      }

      service.brickMasonry = null;
      await this.cbServiceRepository.save(service);
      await this.brickMasonryRepository.delete(brickMasonry.id);
    } catch (error) {
      console.error(`Error deleting brick masonry: ${error.message}`);
      throw error;
    }
  }
}
