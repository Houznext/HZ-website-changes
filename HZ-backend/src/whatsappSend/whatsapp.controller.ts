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
import {
  HOUZNEXT_COMPANY_NAME,
  HOUZNEXT_PORTFOLIO_PDF_URL,
  HOUZNEXT_PUBLIC_EMAIL,
  HOUZNEXT_PUBLIC_PHONE_DISPLAY,
} from 'src/common/houznext-public-contact';

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

    const portfolioLine = HOUZNEXT_PORTFOLIO_PDF_URL
      ? `\n    Take a look at our latest portfolio:\n    👉 ${HOUZNEXT_PORTFOLIO_PDF_URL}\n`
      : '\n';

    const message = `Hello ${name}  👋,

    Thanks for showing interest in *${HOUZNEXT_COMPANY_NAME} Interiors*! 🏡✨
    ${portfolioLine}
    We’d love to help you build a space that reflects your style and comfort. 🛋️

    🎁 *What you can expect when you work with ${HOUZNEXT_COMPANY_NAME}*:

    🔹 *Transparent progress* through our online tracking where available.

    🎁 *Curated offers and decor benefits* — shared when you speak with our team.

    🧱 *Design milestones* such as visualizations after agreement — tailored to your project.

    📞 *For more details or personalized consultation*:
    📱 ${HOUZNEXT_PUBLIC_PHONE_DISPLAY}
    📧 ${HOUZNEXT_PUBLIC_EMAIL}

    We’re excited to bring your dream home to life!

    – *${HOUZNEXT_COMPANY_NAME} Interiors Team* 🌿`;

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
