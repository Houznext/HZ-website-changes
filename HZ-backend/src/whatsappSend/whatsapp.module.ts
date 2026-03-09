import { Module } from '@nestjs/common';
import { WhatsAppMsgService } from 'src/whatsApp.service';
import { WhatsAppController } from './whatsapp.controller';

@Module({
  providers: [WhatsAppMsgService],
  exports: [WhatsAppMsgService], 
  controllers:[WhatsAppController]

})
export class WhatsAppModule {}
