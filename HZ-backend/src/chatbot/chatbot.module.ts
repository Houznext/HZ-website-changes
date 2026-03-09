import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { BotConversation } from './entities/bot-conversation.entity';
import { BotMessage } from './entities/bot-message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BotConversation, BotMessage]),
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService],
  exports: [ChatbotService],
})
export class ChatbotModule {}
