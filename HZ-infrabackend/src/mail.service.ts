import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private transporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !user || !pass) {
      return null;
    }
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
    const t = this.transporter();
    const from = process.env.SMTP_FROM || 'noreply@infra.houznext.com';
    if (!t) {
      if (process.env.NODE_ENV === 'development') {
        this.logger.warn(`[Mail dev bypass] to=${to} subject=${subject}`);
        return;
      }
      throw new Error('SMTP is not configured');
    }
    await t.sendMail({ from, to, subject, text, html });
  }
}
