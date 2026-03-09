// send-whatsapp.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WhatsAppMsgService } from 'src/whatsApp.service';
import { WhatsAppDto } from './dto/whatsappsend.dto';
import Api from 'twilio/lib/rest/Api';

@Controller('send-whatsapp')
@ApiTags('WhatsApp')
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppMsgService) {}

  @Post('/text')
  @ApiOperation({ summary: 'Send WhatsApp message' })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
  })
  async sendMessageToLead(@Body() body: WhatsAppDto) {
    const { name, phone } = body;

    const message = `Hello ${name}  👋,

    Thanks for showing interest in *DreamCasa Interiors*! 🏡✨
    
    Take a look at our latest portfolio to see how we’ve transformed homes:
    👉 https://dreamcasaimages.s3.ap-south-1.amazonaws.com/Portfoliopresenatation_compressed.pdf
    
    We’d love to help you build a space that reflects your style and comfort. 🛋️
    
    🎁 *Bonus Services You Get with DreamCasa*:
    
    🔹 *Real-time progress updates* through our advanced **online tracking system** – track every step of your interior project with complete transparency.
    
    🎁 *Free home decor items worth ₹10,000* – carefully curated to match your new interiors.
    
    🧱 *A 3D interior design* is provided after MoU signing – so you visualize your dream home before we bring it to life.
    
    📞 *For more details or personalized consultation*:
    📱 +91 86398 20425,+91 81061 20099   
    📧 dreamcasarealestate@gmail.com
    
    We’re excited to bring your dream home to life!
    
    – *OneCasa Interiors Team* 🌿`;

    return this.whatsappService.sendMessage(phone, message);
  }

  @Post('/document')
  @ApiOperation({ summary: 'Send WhatsApp message with PDF' })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
  })
  async sendWhatsApp(@Body() body: WhatsAppDto) {
    return this.whatsappService.sendMessageWithPdf(body.phone, body.name);
  }
}
