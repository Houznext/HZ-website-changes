import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Centring } from './entities/centring.entity';
import { CreateCentringDto, UpdateCentringDto } from './dto/centring.dto';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';

@Injectable()
export class CentringService {
  constructor(
    @InjectRepository(Centring)
    private readonly centringRepository: Repository<Centring>,
    @InjectRepository(CBService)
    private readonly cbServiceRepository: Repository<CBService>,
  ) {}

  async create(
    customBuilderId: string,
    createCentringDto: CreateCentringDto,
  ): Promise<Centring> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['centring'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      if (service.centring) {
        throw new BadRequestException('This service already has a centring.');
      }

      const centring = this.centringRepository.create(createCentringDto);

      service.centring = centring;
      await this.cbServiceRepository.save(service);

      return service.centring;
    } catch (error) {
      console.error(`Error creating centring: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<Centring[]> {
    try {
      const centrings = await this.centringRepository.find({
        relations: ['service'],
      });

      console.log(`Successfully retrieved all centrings.`);
      return centrings;
    } catch (error) {
      console.error(`Error retrieving all centrings: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string): Promise<Centring> {
    try {
      const centring = await this.centringRepository.findOne({
        where: { id },
        relations: ['service'],
      });

      if (!centring) {
        throw new NotFoundException(`Centring with ID ${id} not found.`);
      }

      console.log(`Successfully retrieved centring with ID ${id}.`);
      return centring;
    } catch (error) {
      console.error(
        `Error retrieving centring with ID ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  async update(
    customBuilderId: string,
    updateCentringDto: UpdateCentringDto,
  ): Promise<Centring> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['centring'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      if (!service.centring) {
        throw new NotFoundException(`Centring not found.`);
      }

      const updatedCentring = Object.assign(
        service.centring,
        updateCentringDto,
      );

      service.centring = updatedCentring;
      await this.cbServiceRepository.save(service);
      return updatedCentring;
    } catch (error) {
      console.error(`Error updating centring: ${error.message}`);
      throw error;
    }
  }

  async delete(customBuilderId: string): Promise<void> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['centring'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      const centring = service.centring;
      if (!centring) {
        throw new NotFoundException(`Centring not found.`);
      }

      service.centring = null;
      await this.cbServiceRepository.save(service);
      await this.centringRepository.delete(centring.id);
    } catch (error) {
      console.error(`Error deleting centring: ${error.message}`);
      throw error;
    }
  }
}
