import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Painting } from './entities/painting.entity';
import { CreatePaintingDto, UpdatePaintingDto } from './dto/painting.dto';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class PaintingService {
  constructor(
    @InjectRepository(Painting)
    private readonly paintingRepository: Repository<Painting>,
    @InjectRepository(CBService)
    private readonly cbServiceRepository: Repository<CBService>,
  ) {}

  // Create a Painting
  async create(
    customBuilderId: string,
    createPaintingDto: CreatePaintingDto,
  ): Promise<Painting> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['painting'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      if (service.painting) {
        throw new BadRequestException('This service already has painting.');
      }

      const painting = this.paintingRepository.create(createPaintingDto);
      service.painting = painting;

      await this.cbServiceRepository.save(service);

      return service.painting;
    } catch (error) {
      console.error(`Error creating painting: ${error.message}`);
      throw error;
    }
  }

  // Find All Paintings
  async findAll(): Promise<Painting[]> {
    try {
      const paintings = await this.paintingRepository.find({
        relations: ['service'],
      });

      console.log(`Successfully retrieved all paintings.`);
      return paintings;
    } catch (error) {
      console.error(`Error retrieving paintings: ${error.message}`);
      throw error;
    }
  }

  // Find Painting by ID
  async findOne(id: string): Promise<Painting> {
    try {
      const painting = await this.paintingRepository.findOne({
        where: { id },
        relations: ['service'],
      });

      if (!painting) {
        throw new NotFoundException(`Painting with ID ${id} not found.`);
      }

      console.log(`Successfully retrieved painting with ID ${id}.`);
      return painting;
    } catch (error) {
      console.error(
        `Error retrieving painting with ID ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  // Update Painting
  async update(
    customBuilderId: string,
    updatePaintingDto: UpdatePaintingDto,
  ): Promise<Painting> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['painting'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      if (!service.painting) {
        throw new NotFoundException(`Painting not found.`);
      }

      const updatedPainting = Object.assign(
        service.painting,
        updatePaintingDto,
      );

      service.painting = updatedPainting;

      await this.cbServiceRepository.save(service);

      return updatedPainting;
    } catch (error) {
      console.error(`Error updating painting: ${error.message}`);
      throw error;
    }
  }

  // Delete Painting
  async delete(customBuilderId: string): Promise<void> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['painting'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      const painting = service.painting;

      if (!painting) {
        throw new NotFoundException(`Painting not found.`);
      }

      service.painting = null;

      await this.cbServiceRepository.save(service);
      await this.paintingRepository.delete(painting.id);
    } catch (error) {
      console.error(`Error deleting painting: ${error.message}`);
      throw error;
    }
  }
}
