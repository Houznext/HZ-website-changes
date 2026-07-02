import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  HOUZNEXT_COMPANY_NAME,
  HOUZNEXT_PORTFOLIO_PDF_URL,
  HOUZNEXT_PUBLIC_EMAIL,
  HOUZNEXT_PUBLIC_PHONE_DISPLAY,
} from 'src/common/houznext-public-contact';

@Injectable()
export class WhatsAppMsgService {
  private readonly instanceId = process.env.ULTRAMSG_INSTANCE_ID;
  private readonly token = process.env.ULTRAMSG_TOKEN;
  private readonly baseURL = 'https://api.ultramsg.com';

  /** True when UltraMsg env vars are present (API may still reject bad token). */
  isConfigured(): boolean {
    return Boolean(this.instanceId?.trim() && this.token?.trim());
  }

  // Send regular chat/text message
  async sendMessage(to: string, message: string) {
    if (!this.isConfigured()) {
      throw new Error(
        'WhatsApp is not configured. Set ULTRAMSG_INSTANCE_ID and ULTRAMSG_TOKEN in the backend .env file.',
      );
    }

    const url = `${this.baseURL}/${this.instanceId}/messages/chat`;
    const payload = {
      token: this.token,
      to,
      body: message,
    };

    try {
      const response = await axios.post(url, payload);
      const data = response.data as Record<string, unknown>;
      if (data?.error || data?.sent === 'false' || data?.sent === false) {
        const detail =
          typeof data.error === 'string'
            ? data.error
            : JSON.stringify(data.error ?? data);
        throw new Error(detail || 'UltraMsg rejected the message');
      }
      return data;
    } catch (error) {
      const axiosData = (error as { response?: { data?: unknown } })?.response
        ?.data;
      console.error('UltraMsg send error:', axiosData || (error as Error).message);
      if (error instanceof Error && error.message.includes('WhatsApp is not configured')) {
        throw error;
      }
      const detail =
        typeof axiosData === 'string'
          ? axiosData
          : axiosData
            ? JSON.stringify(axiosData)
            : (error as Error).message;
      throw new Error(`Failed to send WhatsApp message: ${detail}`);
    }
  }

  // Send a PDF document
  async sendPdf(to: string, pdfUrl: string, fileName: string) {
    if (!this.isConfigured()) {
      throw new Error(
        'WhatsApp is not configured. Set ULTRAMSG_INSTANCE_ID and ULTRAMSG_TOKEN in the backend .env file.',
      );
    }
    const url = `${this.baseURL}/${this.instanceId}/messages/document`;
    const payload = {
      token: this.token,
      to,
      document: pdfUrl,
      filename: fileName,
    };

    try {
      const response = await axios.post(url, payload);
      const data = response.data as Record<string, unknown>;
      if (data?.error || data?.sent === 'false' || data?.sent === false) {
        const detail =
          typeof data.error === 'string'
            ? data.error
            : JSON.stringify(data.error ?? data);
        throw new Error(detail || 'UltraMsg rejected the document');
      }
      return data;
    } catch (error) {
      const axiosData = (error as { response?: { data?: unknown } })?.response
        ?.data;
      console.error('UltraMsg PDF send error:', axiosData || (error as Error).message);
      const detail =
        typeof axiosData === 'string'
          ? axiosData
          : axiosData
            ? JSON.stringify(axiosData)
            : (error as Error).message;
      throw new Error(`Failed to send PDF via WhatsApp: ${detail}`);
    }
  }

  async sendMessageWithPdf(to: string, name: string) {
    const message = `Hello ${name} 👋,

Thanks for showing interest in ${HOUZNEXT_COMPANY_NAME} Interiors! 🏡✨

🛠️ We're your one-stop solution for everything your dream home needs – from design to execution.

🎁 Bonus services may include: real-time updates via our tracking system, curated offers, and design milestones after agreement — details shared when you connect with our team.

📞 Contact us:
📱 ${HOUZNEXT_PUBLIC_PHONE_DISPLAY}
📧 ${HOUZNEXT_PUBLIC_EMAIL}

We’d love to bring your dream home to life!

– ${HOUZNEXT_COMPANY_NAME} Interiors Team 🌿

Take a look at our latest portfolio to see how we’ve transformed homes:`;

    await this.sendMessage(to, message);

    if (!HOUZNEXT_PORTFOLIO_PDF_URL) {
      console.warn(
        'HOUZNEXT_PORTFOLIO_PDF_URL is not set; WhatsApp text sent without portfolio PDF.',
      );
      return;
    }

    return await this.sendPdf(
      to,
      HOUZNEXT_PORTFOLIO_PDF_URL,
      'Houznext_Interior_Portfolio.pdf',
    );
  }
}
