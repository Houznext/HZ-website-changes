import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';
import { InteriorService } from './entities/interior.entity';
import {
  CreateInteriorServiceDto,
  UpdateInteriorServiceDto,
} from './dto/interior.dto';

@Injectable()
export class InteriorServiceService {
  constructor(
    @InjectRepository(InteriorService)
    private readonly interiorServiceRepository: Repository<InteriorService>,

    @InjectRepository(CBService)
    private readonly cbServiceRepository: Repository<CBService>,
  ) {}

  async create(
    customBuilderId: string,
    createDto: CreateInteriorServiceDto,
  ): Promise<InteriorService> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['interiorService'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      if (service.interiorService) {
        throw new BadRequestException(
          'This service already has an interior service.',
        );
      }

      const interiorService = this.interiorServiceRepository.create(createDto);

      service.interiorService = interiorService;
      await this.cbServiceRepository.save(service);

      return service.interiorService;
    } catch (error) {
      console.error(`Error creating InteriorService: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<InteriorService[]> {
    try {
      const interiorServices = await this.interiorServiceRepository.find({
        relations: ['service'],
      });

      return interiorServices;
    } catch (error) {
      console.error(`Error retrieving all InteriorServices: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string): Promise<InteriorService> {
    try {
      const interiorService = await this.interiorServiceRepository.findOne({
        where: { id },
        relations: ['service'],
      });

      if (!interiorService) {
        throw new NotFoundException(`InteriorService with ID ${id} not found.`);
      }

      return interiorService;
    } catch (error) {
      console.error(
        `Error retrieving InteriorService with ID ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  // async update(
  //   customBuilderId: string,
  //   updateDto: UpdateInteriorServiceDto,
  // ): Promise<InteriorService> {
  //   try {
  //     const service = await this.cbServiceRepository.findOne({
  //       where: { customBuilder: { id: customBuilderId } },
  //       relations: ['interiorService'],
  //     });

  //     if (!service) {
  //       throw new NotFoundException(
  //         `CBService with customBuilderId ${customBuilderId} not found.`,
  //       );
  //     }

  //     if (!service.interiorService) {
  //       throw new NotFoundException(
  //         `InteriorService not found for this CBService.`,
  //       );
  //     }

  //     const updatedInteriorService = Object.assign(
  //       service.interiorService,
  //       updateDto,
  //     );

  //     service.interiorService = updatedInteriorService;
  //     await this.cbServiceRepository.save(service);

  //     return updatedInteriorService;
  //   } catch (error) {
  //     console.error(`Error updating InteriorService: ${error.message}`);
  //     throw error;
  //   }
  // }
  async update(
    customBuilderId: string,
  dto: UpdateInteriorServiceDto,
): Promise<InteriorService> {
  const service = await this.cbServiceRepository.findOne({
    where: { customBuilder: { id: customBuilderId } },
    relations: ['interiorService'],
  });

  if (!service) {
    throw new NotFoundException(
      `CBService with customBuilderId ${customBuilderId} not found.`,
    );
  }

  if (!service.interiorService) {
    const newInteriorService = this.interiorServiceRepository.create(dto);
    service.interiorService = newInteriorService;
  } else {
    Object.assign(service.interiorService, dto);
  }

  await this.cbServiceRepository.save(service);
  return service.interiorService;
}

  async delete(customBuilderId: string): Promise<void> {
    try {
      const service = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: ['interiorService'],
      });

      if (!service) {
        throw new NotFoundException(
          `CBService with customBuilderId ${customBuilderId} not found.`,
        );
      }

      const interiorService = service.interiorService;

      if (!interiorService) {
        throw new NotFoundException(`InteriorService not found.`);
      }

      service.interiorService = null;
      await this.cbServiceRepository.save(service);

      await this.interiorServiceRepository.delete(interiorService.id);
    } catch (error) {
      console.error(`Error deleting InteriorService: ${error.message}`);
      throw error;
    }
  }
}

