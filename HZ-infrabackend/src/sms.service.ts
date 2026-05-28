import { Injectable, Logger } from '@nestjs/common';
import twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async sendSms(to: string, body: string, messagingServiceSid?: string): Promise<void> {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;

    if (!sid || !token || !from || sid.startsWith('REPLACE_')) {
      if (process.env.NODE_ENV === 'development') {
        const codeMatch = body.match(/\b(\d{6})\b/);
        this.logger.warn(
          `[SMS dev bypass] to=${to} otp=${codeMatch?.[1] ?? 'see body'} — configure TWILIO_* to send real SMS`,
        );
        return;
      }
      throw new Error('Twilio is not configured (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)');
    }

    const client = twilio(sid, token);
    await client.messages.create({
      to,
      from,
      body,
      ...(messagingServiceSid ? { messagingServiceSid } : {}),
    });
  }
}
