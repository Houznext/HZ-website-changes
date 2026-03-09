import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DailyProgress } from 'src/Custombuilder/daily-progress/entities/daily-progress.entity';
import { CustomBuilder } from 'src/Custombuilder/entities/custom-builder.entity';
import { generateDailyProgressSummaryTemplate } from 'src/emailTemplates';
import { NotificationService } from 'src/notifications/notification.service';
import { Between, Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(CustomBuilder)
    private readonly customBuilderRepository: Repository<CustomBuilder>,

    @InjectRepository(DailyProgress)
    private readonly dailyProgressRepository: Repository<DailyProgress>,

    private readonly notificationService: NotificationService,
  ) {}

  @Cron('1 1 8 * * 0')
  async handleCron() {
    try {
      const allCustomBuilders = await this.customBuilderRepository.find({
        relations: ['user', 'propertyInformation', 'logs'],
      });

      for (const customBuilder of allCustomBuilders) {
        try {
          const emailOfUser = customBuilder.customer.email;

          const today = new Date();
          const previousSunday = new Date(today);
          previousSunday.setDate(today.getDate() - today.getDay());

          const logsOfTheWeek = await this.dailyProgressRepository.find({
            where: {
              createdAt: Between(previousSunday, today),
            },
          });

          const emailTemplate =
            generateDailyProgressSummaryTemplate(logsOfTheWeek);

          await this.notificationService.sendEmailNotification({
            email: emailOfUser,
            template: emailTemplate,
          });
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}