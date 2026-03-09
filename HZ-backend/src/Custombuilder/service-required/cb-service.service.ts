import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CBService } from './entities/cb-service.entity';
import { CustomBuilder } from 'src/Custombuilder/entities/custom-builder.entity';
import { CreateCBServiceDto, UpdateCBServiceDto } from './dto/cb-service.dto';
import { NotificationService } from 'src/notifications/notification.service';
import { CreateNotificationDto } from 'src/notifications/dto/notification.dto';

@Injectable()
export class CBServiceService {
  constructor(
    @InjectRepository(CBService)
    private readonly cbServiceRepository: Repository<CBService>,
    @InjectRepository(CustomBuilder)
    private readonly customBuilderRepository: Repository<CustomBuilder>,
    private readonly notificationService: NotificationService,
  ) {}

  async create(customBuilderId: string, data: CreateCBServiceDto) {
    try {
      const customBuilder = await this.customBuilderRepository.findOne({
        where: { id: customBuilderId },
        relations: ['servicesRequired', 'customer'],
      });
      if (!customBuilder) {
        throw new BadRequestException('Custom Builder not found');
      }

      if (customBuilder.servicesRequired) {
        throw new BadRequestException('Custom Builder already has a service');
      }

      const cbService = this.cbServiceRepository.create(data);
      customBuilder.servicesRequired = cbService;
      await this.customBuilderRepository.save(customBuilder);

      // create a notification
      const notificationData: CreateNotificationDto = {
        userId: customBuilder.customer.id,
        message: `Your custom builder has successfully created`,
      };

      await this.notificationService.createNotification(notificationData);
      // send email notification

      await this.notificationService.sendEmailNotification({
        email: customBuilder.customer.email,
        message: notificationData.message,
      });

      console.log(`CB Service created successfully`);
      return cbService;
    } catch (error) {
      console.log('Error creating CB Service', error.message);
      console.log('Error stack', error.stack);
      throw error;
    }
  }

  async findAll() {
    try {
      const cbServices = await this.cbServiceRepository.find();
      console.log(`CB Services retrieved successfully`);
      return cbServices;
    } catch (error) {
      console.log('Error retrieving CB Services', error.message);
      console.log('Error stack', error.stack);
      throw error;
    }
  }

  async findById(id: string) {
    try {
      const cbService = await this.cbServiceRepository.findOne({
        where: { id },
        relations: [
          'customBuilder',
          'borewells',
          'centring',
          'flooring',
          'plumbing',
          'painting',
          'electricity',
          'fallCeiling',
          'brickMasonry',
          'documentDrafting',
        ],
      });
      if (!cbService) {
        throw new BadRequestException('CB Service not found');
      }
      console.log(`CB Service with id ${id} retrieved successfully`);
      return cbService;
    } catch (error) {
      console.log('Error retrieving CB Service', error.message);
      console.log('Error stack', error.stack);
      throw error;
    }
  }

  async findByCustomBuilderId(customBuilderId: string) {
    try {
      const cbService = await this.cbServiceRepository.findOne({
        where: { customBuilder: { id: customBuilderId } },
        relations: [
          'customBuilder',
          'borewells',
          'centring',
          'flooring',
          'plumbing',
          'painting',
          'electricity',
          'fallCeiling',
          'brickMasonry',
          'documentDrafting',
        ],
      });
      if (!cbService) {
        throw new BadRequestException('CB Service not found');
      }
      console.log(
        `CB Service for custom builder with id ${customBuilderId} retrieved successfully`,
      );
      return cbService;
    } catch (error) {
      console.log('Error retrieving CB Service', error.message);
      console.log('Error stack', error.stack);
      throw error;
    }
  }

  async update(id: string, data: UpdateCBServiceDto) {
    try {
      const cbService = await this.cbServiceRepository.findOne({
        where: { id },
        relations: ['customBuilder','customBuilder.customer'],
      });

      if (!cbService) {
        throw new BadRequestException('CB Service not found');
      }

      const customBuilder = await this.customBuilderRepository.findOne({
        where: { id: cbService.customBuilder.id },
        relations: ['servicesRequired'],
      });
      if (!customBuilder) {
        throw new BadRequestException('Custom Builder not found');
      }

      const updatedCBService = Object.assign(cbService, data);

      customBuilder.servicesRequired = updatedCBService;
      await this.customBuilderRepository.save(customBuilder);
      console.log(`CB Service with id ${id} updated successfully`);
      return cbService;
    } catch (error) {
      console.log('Error updating CB Service', error.message);
      console.log('Error stack', error.stack);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const cbService = await this.cbServiceRepository.findOne({
        where: { id },
        relations: ['customBuilder'],
      });

      if (!cbService) {
        throw new BadRequestException('CB Service not found');
      }

      const customBuilder = await this.customBuilderRepository.findOne({
        where: { id: cbService.customBuilder.id },
        relations: ['servicesRequired'],
      });
      if (!customBuilder) {
        throw new BadRequestException('Custom Builder not found');
      }

      customBuilder.servicesRequired = null;
      await this.customBuilderRepository.save(customBuilder);
      await this.cbServiceRepository.delete(id);
      console.log(`CB Service with id ${id} deleted successfully`);
    } catch (error) {
      console.log('Error deleting CB Service', error.message);
      console.log('Error stack', error.stack);
      throw error;
    }
  }
  async getSelectedServicesByCustomBuilderId(
    customBuilderId: string,
  ): Promise<string[]> {
    const cbService = await this.cbServiceRepository.findOne({
      where: { customBuilder: { id: customBuilderId } },
      select: ['selectedServices'],
    });

    if (!cbService) {
      throw new BadRequestException(
        'CB Service not found for given Custom Builder ID',
      );
    }

    return cbService.selectedServices || [];
  }
  async updateServiceEstimates(
    customBuilderId: string,
    updatedEstimates: Record<
      string,
      { estimatedDays: number; estimatedCost?: number }
    >,
  ) {
    const cbService = await this.cbServiceRepository.findOne({
      where: { customBuilder: { id: customBuilderId } },
    });

    if (!cbService) {
      throw new BadRequestException(
        'CB Service not found for given Custom Builder ID',
      );
    }

    cbService.serviceEstimates = {
      ...(cbService.serviceEstimates || {}),
      ...updatedEstimates,
    };

    await this.cbServiceRepository.save(cbService);

    return cbService.serviceEstimates;
  }
}
