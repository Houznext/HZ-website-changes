import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export type PropertyAlertAction = 'created' | 'updated' | 'deleted' | 'approved' | 'rejected';

@Injectable()
export class InfraMailService {
  private readonly log = new Logger(InfraMailService.name);

  constructor(private readonly config: ConfigService) {}

  private transporter(): nodemailer.Transporter | null {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    if (!host || !user || !pass) {
      return null;
    }
    const port = Number(this.config.get<string>('SMTP_PORT') || 587);
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  private alertTo(): string {
    return this.config.get<string>('PROPERTY_ALERT_EMAIL') || 'business@houznext.com';
  }

  private fromAddress(): string {
    return this.config.get<string>('SMTP_FROM') || this.config.get<string>('SMTP_USER') || 'noreply@houznext.com';
  }

  async sendPropertyAlert(params: {
    action: PropertyAlertAction;
    propertyId: string;
    propertyCode?: string | null;
    title?: string | null;
    propertyType?: string | null;
    city?: string | null;
    locality?: string | null;
    basePrice?: string | null;
    isApproved?: boolean;
    isActive?: boolean;
    listedBy?: string | null;
    ownerName?: string | null;
    ownerPhone?: string | null;
    actorEmail?: string | null;
    actorKind?: string | null;
    actorId?: string | null;
  }): Promise<void> {
    const transport = this.transporter();
    if (!transport) {
      this.log.warn('SMTP not configured — skipping property alert email');
      return;
    }

    const to = this.alertTo();
    const statusParts: string[] = [];
    if (params.isApproved === true) statusParts.push('approved');
    else if (params.isApproved === false) statusParts.push('not approved');
    if (params.isActive === true) statusParts.push('active');
    else if (params.isActive === false) statusParts.push('inactive');
    const listingStatus = statusParts.length ? statusParts.join(', ') : '—';

    const subject = `[Infra] Property ${params.action}: ${params.propertyCode || params.propertyId} — ${params.title || '(no title)'}`;

    const lines = [
      `Action: ${params.action.toUpperCase()}`,
      `Property ID: ${params.propertyId}`,
      `Property code: ${params.propertyCode ?? '—'}`,
      `Title: ${params.title ?? '—'}`,
      `Type: ${params.propertyType ?? '—'}`,
      `City / locality: ${params.city ?? '—'} / ${params.locality ?? '—'}`,
      `Base price: ${params.basePrice ?? '—'}`,
      `Listed by: ${params.listedBy ?? '—'}`,
      `Listing status: ${listingStatus}`,
      `Owner: ${params.ownerName ?? '—'} (${params.ownerPhone ?? '—'})`,
      '',
      'Actor:',
      `  Kind: ${params.actorKind ?? '—'}`,
      `  ID: ${params.actorId ?? '—'}`,
      `  Email: ${params.actorEmail ?? '—'}`,
    ];

    const text = lines.join('\n');

    try {
      await transport.sendMail({
        from: this.fromAddress(),
        to,
        subject,
        text,
      });
      this.log.log(`Property alert (${params.action}) sent to ${to}`);
    } catch (e) {
      this.log.error(`Failed to send property alert: ${(e as Error).message}`);
    }
  }
}
