import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plumbing } from './entities/plumbing.entity';
import { CreatePlumbingDto, UpdatePlumbingDto } from './dto/plumbing.dto';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';

@Injectable()
export class PlumbingService {
  constructor(
    @InjectRepository(Plumbing)
    private readonly plumbingRepository: Repository<Plumbing>,
    @InjectRepository(CBService)
    private readonly cbServiceRepository: Repository<CBService>,
  ) {}

  async create(
    customBuilderId: string,
    createPlumbingDto: CreatePlumbingDto,
  ): Promise<Plumbing> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['plumbing'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      if (service.plumbing) {
        throw new BadRequestException('This service already has plumbing.');
      }

      const plumbing = this.plumbingRepository.create(createPlumbingDto);

      service.plumbing = plumbing;
      await this.cbServiceRepository.save(service);

      return service.plumbing;
    } catch (error) {
      console.error(`Error creating plumbing: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<Plumbing[]> {
    try {
      const plumbings = await this.plumbingRepository.find({
        relations: ['service'],
      });

      console.log(`Successfully retrieved all plumbings.`);
      return plumbings;
    } catch (error) {
      console.error(`Error retrieving all plumbings: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string): Promise<Plumbing> {
    try {
      const plumbing = await this.plumbingRepository.findOne({
        where: { id },
        relations: ['service'],
      });

      if (!plumbing) {
        throw new NotFoundException(`Plumbing with ID ${id} not found.`);
      }

      console.log(`Successfully retrieved plumbing with ID ${id}.`);
      return plumbing;
    } catch (error) {
      console.error(
        `Error retrieving plumbing with ID ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  async update(
    customBuilderId: string,
    updatePlumbingDto: UpdatePlumbingDto,
  ): Promise<Plumbing> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['plumbing'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      if (!service.plumbing) {
        throw new NotFoundException(`Plumbing not found.`);
      }

      const updatedPlumbing = Object.assign(
        service.plumbing,
        updatePlumbingDto,
      );

      service.plumbing = updatedPlumbing;
      await this.cbServiceRepository.save(service);

      return updatedPlumbing;
    } catch (error) {
      console.error(`Error updating plumbing: ${error.message}`);
      throw error;
    }
  }

  async delete(customBuilderId: string): Promise<void> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['plumbing'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      const plumbing = service.plumbing;

      if (!plumbing) {
        throw new NotFoundException(`Plumbing not found.`);
      }

      service.plumbing = null;
      await this.cbServiceRepository.save(service);
      await this.plumbingRepository.delete(plumbing.id);
    } catch (error) {
      console.error(`Error deleting plumbing: ${error.message}`);
      throw error;
    }
  }
}
