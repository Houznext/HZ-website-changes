import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WhatsAppMsgService {
  private readonly instanceId = process.env.ULTRAMSG_INSTANCE_ID;
  private readonly token = process.env.ULTRAMSG_TOKEN;
  private readonly baseURL = 'https://api.ultramsg.com';

  // Send regular chat/text message
  async sendMessage(to: string, message: string) {
    const url = `${this.baseURL}/${this.instanceId}/messages/chat`;
    const payload = {
      token: this.token,
      to,
      body: message,
    };

    try {
      const response = await axios.post(url, payload);
      return response.data;
    } catch (error) {
      console.error(
        'UltraMsg send error:',
        error?.response?.data || error.message,
      );
      throw new Error('Failed to send WhatsApp message via UltraMsg');
    }
  }

  // Send a PDF document
  async sendPdf(to: string, pdfUrl: string, fileName: string) {
    const url = `${this.baseURL}/${this.instanceId}/messages/document`;
    const payload = {
      token: this.token,
      to,
      document: pdfUrl,
      filename: fileName,
    };

    try {
      const response = await axios.post(url, payload);
      return response.data;
    } catch (error) {
      console.error(
        'UltraMsg PDF send error:',
        error?.response?.data || error.message,
      );
      throw new Error('Failed to send PDF via UltraMsg');
    }
  }

  async sendMessageWithPdf(to: string, name: string) {
    const message = `Hello ${name} 👋,

Thanks for showing interest in OneCasa Interiors! 🏡✨

🛠️ We're your one-stop solution for everything your dream home needs – from design to execution – now proudly serving Andhra Pradesh, Telangana, and Maharashtra.

🎁 Bonus Services You Get: 🔹 Real-time updates via our online tracking system
🎁 Free home decor items worth ₹10,000
🧱 A 3D interior design after MoU signing

📞 Contact us:
📱 +91 86398 20425, +91 87902 90948
📧 dreamcasarealestate@gmail.com

We’d love to bring your dream home to life!

– OneCasa Interiors Team 🌿

Take a look at our latest portfolio to see how we’ve transformed homes:`;


    await this.sendMessage(to, message);

    return await this.sendPdf(
      to,
      'https://dreamcasaimages.s3.ap-south-1.amazonaws.com/Portfoliopresenatation_compressed.pdf',
      'DreamCasa_Interior_Portfolio.pdf',
    );
  }
}
