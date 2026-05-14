import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfraMailService } from '../common/mail/infra-mail.service';
import type { InfraCrmLead } from './entities/infra-crm-lead.entity';

export type CrmNotifyAction =
  | 'created'
  | 'updated'
  | 'stage_changed'
  | 'priority_changed'
  | 'deleted'
  | 'activity_logged'
  | 'site_visit_scheduled'
  | 'site_visit_updated'
  | 'site_visit_completed'
  | 'token_paid'
  | 'registered';

@Injectable()
export class CrmNotificationService {
  constructor(
    private readonly mail: InfraMailService,
    private readonly config: ConfigService,
  ) {}

  private crmTo(): string {
    return (
      this.config.get<string>('CRM_NOTIFY_EMAIL') ||
      this.config.get<string>('ENQUIRY_NOTIFY_EMAIL') ||
      this.config.get<string>('PROPERTY_ALERT_EMAIL') ||
      'business@houznext.com'
    );
  }

  async notifyCrmAction(
    action: CrmNotifyAction,
    lead: Pick<
      InfraCrmLead,
      | 'fullName'
      | 'phone'
      | 'email'
      | 'stage'
      | 'priority'
      | 'propertyType'
      | 'bhkPreference'
      | 'budgetRange'
      | 'assignedTo'
    > &
      Partial<InfraCrmLead>,
    extra?: { previousStage?: string; newStage?: string; agentName?: string; note?: string },
  ): Promise<void> {
    const subject = this.getEmailSubject(action, lead);
    const html = this.getEmailHtml(action, lead, extra);
    await this.mail.sendHtmlMail({ to: this.crmTo(), subject, html });
  }

  private getEmailSubject(
    action: CrmNotifyAction,
    lead: Pick<InfraCrmLead, 'fullName' | 'phone' | 'stage' | 'propertyType' | 'budgetRange' | 'priority'>,
  ): string {
    const map: Record<CrmNotifyAction, string> = {
      created: `🆕 New CRM lead: ${lead.fullName} — ${lead.propertyType} ${lead.budgetRange || ''}`,
      updated: `✏️ Lead updated: ${lead.fullName}`,
      stage_changed: `🔄 Stage change: ${lead.fullName} → ${lead.stage}`,
      priority_changed: `⚡ Priority change: ${lead.fullName} (${lead.priority})`,
      deleted: `🗑️ Lead deleted: ${lead.fullName} (${lead.phone})`,
      activity_logged: `📌 Activity logged: ${lead.fullName}`,
      site_visit_scheduled: `📅 Site visit scheduled: ${lead.fullName}`,
      site_visit_updated: `📋 Site visit updated: ${lead.fullName}`,
      site_visit_completed: `✅ Site visit completed: ${lead.fullName}`,
      token_paid: `💰 TOKEN PAID: ${lead.fullName} — ${lead.propertyType}`,
      registered: `🎉 REGISTERED: ${lead.fullName} — Deal closed!`,
    };
    return `[Houznext Infra CRM] ${map[action] || 'CRM Update'}`;
  }

  private getEmailHtml(
    action: CrmNotifyAction,
    lead: Pick<
      InfraCrmLead,
      'fullName' | 'phone' | 'email' | 'stage' | 'priority' | 'propertyType' | 'bhkPreference' | 'budgetRange' | 'assignedTo'
    > &
      Partial<InfraCrmLead>,
    extra?: { previousStage?: string; newStage?: string; agentName?: string; note?: string },
  ): string {
    const title = this.getEmailSubject(action, lead);
    const stageLabel = (lead.stage || 'new').replace(/_/g, ' ');
    const pri =
      lead.priority === 'hot' ? '🔥 Hot' : lead.priority === 'warm' ? '🟡 Warm' : '🔵 Cold';
    const ts = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const esc = (s: string | null | undefined) =>
      String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    return `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#0f2a44;padding:16px 24px;border-radius:10px 10px 0 0">
        <h2 style="color:#fff;margin:0;font-family:Montserrat,sans-serif;font-size:18px">
          Houznext <span style="color:#f2994a">Infra</span> CRM
        </h2>
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;padding:24px;border-radius:0 0 10px 10px">
        <h3 style="font-family:Montserrat,sans-serif;font-size:16px;color:#1f2933;margin:0 0 16px">${esc(title.replace(/^\[Houznext Infra CRM\] /, ''))}</h3>
        <p style="font-size:12px;color:#64748b;margin:0 0 12px"><strong>Action:</strong> ${esc(action)}</p>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#5a6a7e;font-size:13px;width:140px">Lead name</td><td style="padding:8px 0;font-weight:600;font-size:13px">${esc(lead.fullName)}</td></tr>
          <tr><td style="padding:8px 0;color:#5a6a7e;font-size:13px">Phone</td><td style="padding:8px 0;font-size:13px">${esc(lead.phone)}</td></tr>
          <tr><td style="padding:8px 0;color:#5a6a7e;font-size:13px">Stage</td><td style="padding:8px 0;font-size:13px"><strong>${esc(stageLabel)}</strong></td></tr>
          <tr><td style="padding:8px 0;color:#5a6a7e;font-size:13px">Priority</td><td style="padding:8px 0;font-size:13px">${pri}</td></tr>
          <tr><td style="padding:8px 0;color:#5a6a7e;font-size:13px">Property type</td><td style="padding:8px 0;font-size:13px">${esc(lead.propertyType)} ${esc(lead.bhkPreference || '')}</td></tr>
          <tr><td style="padding:8px 0;color:#5a6a7e;font-size:13px">Budget</td><td style="padding:8px 0;font-size:13px">${esc(lead.budgetRange || '—')}</td></tr>
          <tr><td style="padding:8px 0;color:#5a6a7e;font-size:13px">Assigned to</td><td style="padding:8px 0;font-size:13px">${esc(lead.assignedTo || 'Unassigned')}</td></tr>
          ${
            extra?.previousStage
              ? `<tr><td style="padding:8px 0;color:#5a6a7e;font-size:13px">Stage change</td><td style="padding:8px 0;font-size:13px">${esc(extra.previousStage)} → ${esc(extra.newStage || '')}</td></tr>`
              : ''
          }
          ${extra?.agentName ? `<tr><td style="padding:8px 0;color:#5a6a7e;font-size:13px">Agent</td><td style="padding:8px 0;font-size:13px">${esc(extra.agentName)}</td></tr>` : ''}
          ${extra?.note ? `<tr><td style="padding:8px 0;color:#5a6a7e;font-size:13px">Note</td><td style="padding:8px 0;font-size:13px">${esc(extra.note)}</td></tr>` : ''}
          <tr><td style="padding:8px 0;color:#5a6a7e;font-size:13px">Time</td><td style="padding:8px 0;font-size:12px;color:#5a6a7e">${esc(ts)}</td></tr>
        </table>
      </div>
    </div>`;
  }
}
