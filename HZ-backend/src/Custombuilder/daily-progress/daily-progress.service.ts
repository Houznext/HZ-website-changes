import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyProgress } from './entities/daily-progress.entity';
import { CustomBuilder } from '../entities/custom-builder.entity';
import {
  CreateDailyProgressDto,
  UpdateDailyProgressDto,
} from './dto/daily-progress.dto';
import { NotificationService } from 'src/notifications/notification.service';
import { generateDailyProgressTemplate } from 'src/emailTemplates';
import { WhatsAppMsgService } from 'src/whatsApp.service';
import { User } from 'src/user/entities/user.entity';
import {DailyProgressStatus} from './enum/daily-progress.enum'

@Injectable()
export class DailyProgressService {
  constructor(
    @InjectRepository(DailyProgress)
    private readonly dailyProgressRepository: Repository<DailyProgress>,

    @InjectRepository(CustomBuilder)
    private readonly customBuilderRepository: Repository<CustomBuilder>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly notificationService: NotificationService,
    private readonly whatsAppMsgService: WhatsAppMsgService,
  ) {}

  async create(
    customBuilderId: string,
    createDailyProgressDto: CreateDailyProgressDto,
  ): Promise<DailyProgress> {
    try {
      const [customBuilder, uploader] = await Promise.all([
        this.customBuilderRepository.findOne({
          where: { id: customBuilderId },
          relations: ['logs', 'customer'],
        }),
        this.userRepository.findOne({
          where: { id: createDailyProgressDto.uploadedById },
        }),
      ]);

      if (!customBuilder) {
        throw new NotFoundException('Custom builder not found');
      }

      const nextDay = customBuilder.logs.length + 1;
      
      const dailyProgressData = {
        ...createDailyProgressDto,
        day: nextDay,
        customBuilder,
        uploadedBy: uploader,
        uploadedById: uploader.id,
        uploadedByName: createDailyProgressDto.uploadedByName,
        uploadedByProfile: createDailyProgressDto.uploadedByProfile,

        city: createDailyProgressDto.city ?? null,
        state: createDailyProgressDto.state ?? null,
        country: createDailyProgressDto.country ?? null,
        latitude: createDailyProgressDto.latitude ?? null,
        longitude: createDailyProgressDto.longitude ?? null,
        uploadLocation: createDailyProgressDto.uploadLocation ?? null,
        phaseId: createDailyProgressDto.phaseId ?? null,
        status:
    createDailyProgressDto.status &&
    Object.values(DailyProgressStatus).includes(
      createDailyProgressDto.status as DailyProgressStatus,
    )
      ? (createDailyProgressDto.status as DailyProgressStatus)
      : DailyProgressStatus.Pending,

        
      };
      

      const emailTemplate = generateDailyProgressTemplate(dailyProgressData);

      const dailyProgress =
        this.dailyProgressRepository.create(dailyProgressData);
      await this.customBuilderRepository.save({
        ...customBuilder,
        currentDay: nextDay,
      });

      const savedDailyProgress =
        await this.dailyProgressRepository.save(dailyProgress);

      const formattedDate = savedDailyProgress?.date.toLocaleString('default', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      this.notificationService.createNotification({
        userId: customBuilder?.customer?.id,
        message: `Your daily progress for ${savedDailyProgress?.date.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' })} (day ${nextDay}) has been uploaded successfully.`,
      });

      this.notificationService.sendEmailNotification({
        email: customBuilder?.customer?.email,
        template: emailTemplate,
      });
      // if (customBuilder.customer?.phone) {
      //   const message = `Hello ${customBuilder.customer?.fullName || ''}, your daily progress for ${formattedDate} (Day ${nextDay}) has been updated successfully. Please check your dashboard for details.`;

      //   await this.whatsAppMsgService.sendMessage(
      //     customBuilder.customer.phone,
      //     message,
      //   );
      // }

      return savedDailyProgress;
    } catch (error) {
      console.log(
        `Error creating daily progress for custom builder with ID ${customBuilderId}.`,
        error.message,
      );
      console.log('Error stack:', error.stack);
      throw error;
    }
  }
  async findAllByCustomBuilderId(
    customBuilderId: string,
  ): Promise<DailyProgress[]> {
    try {
      const dailyProgress = await this.dailyProgressRepository.find({
        where: { customBuilder: { id: customBuilderId } },
        order: { createdAt: 'ASC' },
        relations: ['uploadedBy', 'customBuilder', 'phase'],
      });
      return dailyProgress;
    } catch (error) {
      console.log(
        `Error retrieving daily progress for custom builder with ID ${customBuilderId}:`,
        error.message,
      );
      console.log('Error stack:', error.stack);
      throw error;
    }
  }

  async findById(id: string): Promise<DailyProgress> {
    try {
      const dailyProgress = await this.dailyProgressRepository.findOne({
        where: { id },
        relations: ['customBuilder', 'uploadedBy'],
      });

      if (!dailyProgress) {
        throw new NotFoundException('Daily progress not found');
      }

      console.log(`Daily progress with ID ${id} retrieved successfully.`);
      return dailyProgress;
    } catch (error) {
      console.log(
        `Error retrieving daily progress with ID ${id}:`,
        error.message,
      );
      console.log('Error stack:', error.stack);
      throw error;
    }
  }

  async findByDay(
    customBuilderId: string,
    day: number,
  ): Promise<DailyProgress> {
    try {
      const dailyProgress = await this.dailyProgressRepository.findOne({
        where: { customBuilder: { id: customBuilderId }, day },
        relations: ['uploadedBy', 'phase'],
      });

      if (!dailyProgress) {
        throw new NotFoundException('Daily progress not found');
      }

      console.log(
        `Daily progress for custom builder with ID ${customBuilderId} and day ${day} retrieved successfully.`,
      );

      return dailyProgress;
    } catch (error) {
      console.log(
        `Error retrieving daily progress for custom builder with ID ${customBuilderId} and day ${day}:`,
        error.message,
      );
      console.log('Error stack:', error.stack);
      throw error;
    }
  }

  async update(
    id: string,
    updateDailyProgressDto: UpdateDailyProgressDto,
  ): Promise<DailyProgress> {
    try {
      const dailyProgress = await this.dailyProgressRepository.findOne({
        where: { id },
        relations: ['customBuilder'],
      });

      if (!dailyProgress) {
        throw new NotFoundException(`Daily progress with ID ${id} not found`);
      }

      const updatedDailyProgress = this.dailyProgressRepository.merge(
        dailyProgress,
        updateDailyProgressDto,
      );

      const savedDailyProgress =
        await this.dailyProgressRepository.save(updatedDailyProgress);

      console.log(`Daily progress with ID ${id} updated successfully.`);
      return savedDailyProgress;
    } catch (error) {
      console.error(
        `Error updating daily progress with ID ${id}:`,
        error.message,
      );
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const dailyProgress = await this.findById(id);
      const customBuilder = await this.customBuilderRepository.findOne({
        where: { id: dailyProgress.customBuilder.id },
        relations: ['logs'],
      });

      if (!customBuilder) {
        throw new NotFoundException('Custom builder not found');
      }

      customBuilder.logs = customBuilder.logs.filter(
        (progress) => progress.id !== id,
      );
      await this.customBuilderRepository.save(customBuilder);
      await this.dailyProgressRepository.delete(id);

      console.log(`Daily progress with ID ${id} deleted successfully.`);
    } catch (error) {
      console.log(
        `Error deleting daily progress with ID ${id}:`,
        error.message,
      );
      console.log('Error stack:', error.stack);
      throw error;
    }
  }
}
