import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CustomBuilderService } from './custom-builder.service';
import { CustomBuilderController } from './custom-builder.controller';

import { CustomBuilder } from './entities/custom-builder.entity';
import { User } from 'src/user/entities/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { UserBranchMembership } from 'src/branch/entities/user-branch-membership.entity';
import { Notification } from 'src/notifications/entities/notification.entity';

import { WhatsAppMsgService } from 'src/whatsApp.service';
import { NotificationService } from 'src/notifications/notification.service';
import { MailerService } from 'src/sendEmail.service';
import { SmsService } from 'src/sms.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomBuilder,
      User,
      Branch,
      UserBranchMembership,
      Notification,
    ]),
  ],
  controllers: [CustomBuilderController],
  providers: [
    CustomBuilderService,
    NotificationService,
    MailerService,
    WhatsAppMsgService,
    SmsService,
  ],
  exports: [CustomBuilderService],
})
export class CustomBuilderModule {}
