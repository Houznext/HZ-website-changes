import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

import { ChatThread } from './entities/chat-thread.entity';
import { ChatThreadMember } from './entities/chat-thread-member.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatReadReceipt } from './entities/chat-read-receipt.entity';
import { User } from '../user/entities/user.entity';
import { ChatAttachment } from './entities/chat-attachment.entity';
import { ChatRealtimeAdapter } from './chat.realtime.adapter';
import { NotificationModule } from '../notifications/notification.module';
import { S3Module } from '../common/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatThread,
      ChatThreadMember,
      ChatMessage,
      ChatReadReceipt,
      User,
      ChatAttachment,
    ]),
    NotificationModule,
    S3Module,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatRealtimeAdapter],
  exports: [ChatService, ChatRealtimeAdapter],
})
export class ChatModule {}
