import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomBuilderService } from '../custom-builder.service';
import { CustomBuilder } from '../entities/custom-builder.entity';
import { User } from 'src/user/entities/user.entity';
import { CustomBuilderController } from '../custom-builder.controller';
import { WhatsAppMsgService } from 'src/whatsApp.service';
import { NotificationService } from 'src/notifications/notification.service';
import { MailerService } from 'src/sendEmail.service';
import { SmsService } from 'src/sms.service';
import { Notification } from 'src/notifications/entities/notification.entity';
import { CBDocument } from '../entities/cbDocument.entity';
import { CbDocumentController } from './cbdocument.controller';
import { CbDocumentService } from './cddocument.service';
import { CustomBuilderModule } from '../custom-builder.module';
import { Branch } from 'src/branch/entities/branch.entity';
import { BranchModule } from 'src/branch/branch.module';
import { UserModule } from 'src/user/user.module';
import { S3Module } from 'src/common/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomBuilder, CBDocument, Notification, User, Branch]),
    forwardRef(() => CustomBuilderModule),
    forwardRef(() => BranchModule),
    forwardRef(() => UserModule),
    S3Module,
  ],
  controllers: [CustomBuilderController, CbDocumentController],
  providers: [
    CustomBuilderService,
    CbDocumentService,
    NotificationService,
    MailerService,
    WhatsAppMsgService,
    SmsService,
  ],
})
export class CbDocumentModule {}
