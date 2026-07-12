import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { Property } from './property/entities/property.entity';
import { User } from './user/entities/user.entity';
import { CRMLead } from './crm/entities/crm.entity';
import { ContactUs } from './contactus/entities/contact-us.entity';
import {
  USER_CONFIRMATION_TEMPLATE,
  ADMIN_NOTIFICATION_TEMPLATE,
  USER_NOTIFICATION_TEMPLATE,
  OWNER_LEAD_NOTIFICATION_TEMPLATE,
  ADMIN_LEAD_NOTIFICATION_TEMPLATE,
  ADMIN_REFERRAL_NOTIFICATION_TEMPLATE,
  ADMIN_CONTACT_NOTIFICATION_TEMPLATE,
} from './emailTemplates';
import { Referral } from './houznext-rewards/entities/referral.entity';

import { PropertyLead } from './property/propertyLead/property-lead.entity';
interface GenericLead {
  id: number;
  name?: string;
  Fullname?: string;
  assignedBy?: { fullName?: string };
  assignedTo?: { email?: string };
}
interface DeletionNotification {
  deletedEstimatorId: string;
  deletedBy: { id: string; username: string };
  estimatorFirstName: string;
  restoreUrl?: string;
  details?: Record<string, string | number | null | undefined>;
}

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const port = Number(process.env.SMTP_PORT) || 587;
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      auth: {
        user: process.env.SMTP_USER || 'business@houznext.com',
        pass: process.env.SMTP_PASS || '',
      },
      // Fail fast on Railway / blocked SMTP so API responses are not held open.
      connectionTimeout: 8_000,
      greetingTimeout: 8_000,
      socketTimeout: 15_000,
    });
  }

  /** Admin finance emails must never block create/update HTTP responses. */
  enqueue(task: Promise<unknown>, label: string): void {
    void task.catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[Mailer] Background ${label} failed:`, msg);
    });
  }

  populateTemplate(template: string, data: Record<string, string>): string {
    return template.replace(/\$\{(.*?)\}/g, (_, key) => data[key] || '');
  }

  private escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async sendMail(to: string, subject: string, text: string, html: string) {
    const pass = process.env.SMTP_PASS?.trim();
    if (!pass) {
      console.warn(
        `[Mailer] SMTP_PASS is not set; skipping email to ${to}. Set SMTP_USER + SMTP_PASS (e.g. Gmail app password) to enable outbound mail.`,
      );
      return;
    }

    const mailOptions = {
      from: process.env.SMTP_USER || 'business@houznext.com',
      to,
      subject,
      text,
      html,
    };

    return this.transporter.sendMail(mailOptions).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[Mailer] Failed to send mail to ${to}:`, msg);
      throw err;
    });
  }

  async sendInvoiceToCustomer(params: {
    to: string;
    subject: string;
    bodyText: string;
    pdfBuffer: Buffer;
    pdfFilename: string;
  }) {
    const pass = process.env.SMTP_PASS?.trim();
    if (!pass) {
      console.warn(
        `[Mailer] SMTP_PASS is not set; skipping invoice email to ${params.to}.`,
      );
      throw new Error(
        'Email is not configured on the server (SMTP_PASS missing).',
      );
    }

    const htmlBody = `<html><body style="font-family:system-ui,sans-serif;font-size:14px;color:#1f2933;line-height:1.6;">
<div style="max-width:640px;margin:24px auto;padding:24px;">
${params.bodyText
  .split('\n')
  .map((line) => this.escapeHtml(line))
  .join('<br/>')}
<p style="margin-top:24px;font-size:12px;color:#64748b;">— Houznext Interiors</p>
</div></body></html>`;

    const mailOptions = {
      from: process.env.SMTP_USER || 'business@houznext.com',
      to: params.to,
      subject: params.subject,
      text: params.bodyText,
      html: htmlBody,
      attachments: [
        {
          filename: params.pdfFilename,
          content: params.pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    return this.transporter.sendMail(mailOptions).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[Mailer] Failed to send invoice to ${params.to}:`, msg);
      throw err;
    });
  }

  async sendUserConfirmationEmail(property: Property, user: User) {
    if (!user) {
      throw new Error('User is not defined');
    }

    const userName = user.firstName || user.fullName || user.email || 'User';

    const populatedTemplate = this.populateTemplate(
      USER_CONFIRMATION_TEMPLATE,
      {
        userName,
        propertyTitle: property.propertyDetails.propertyName,
        currentDate: new Date().toLocaleDateString(),
      },
    );

    await this.sendMail(
      property.basicDetails.email,
      'Property Posted Successfully!',
      'Your property has been posted successfully.',
      populatedTemplate,
    );
  }

  //mail service for property leads

  async sendLeadNotificationToOwner(
    lead: PropertyLead,
    property: Property,
    owner: User,
  ) {
    const populatedTemplate = this.populateTemplate(
      OWNER_LEAD_NOTIFICATION_TEMPLATE,
      {
        ownerName: owner.fullName || 'Owner',
        propertyTitle: property.propertyDetails?.propertyName || 'Property',
        leadName: lead.name,
        leadEmail: lead.email,
        leadPhone: lead.phoneNumber,
        interestedInLoan: lead.interestedInLoan ? 'Yes' : 'No',
        currentDate: new Date().toLocaleDateString(),
      },
    );

    await this.sendMail(
      owner.email,
      `New Enquiry on your Property: ${property.propertyDetails?.propertyName}`,
      `You have received a new lead for your property.`,
      populatedTemplate,
    );
  }

  async sendUserNotification(user: User, subject: string, template: string) {
    if (!user || !user.email) {
      throw new Error('User or user.email is not defined');
    }

    const populatedTemplate = this.populateTemplate(
      USER_NOTIFICATION_TEMPLATE,
      {
        userName: user.fullName || 'User',
        currentDate: new Date().toLocaleDateString(),
      },
    );

    await this.sendMail(
      user.email,
      subject,
      'Please check your inbox for the latest update.',
      populatedTemplate,
    );
  }

  async notifyAdmins(property: Property) {
    const user = property.postedByUser;
    console.log(user); // Add this to check if the user object exists and is as expected
    const populatedTemplate = this.populateTemplate(
      ADMIN_NOTIFICATION_TEMPLATE,
      {
        propertyTitle: property.propertyDetails.propertyName,
        postedBy: property.postedByUser.fullName,
        propertyId: property.propertyId.toString(),
        currentDate: new Date().toLocaleDateString(),
      },
    );

    const adminEmails = [
      'business@houznext.com',
    ];

    for (const email of adminEmails) {
      await this.sendMail(
        email,
        'New Property Posted Notification',
        'A new property has been posted.',
        populatedTemplate,
      );
    }
  }
  async notifyAdminsAboutLead(lead: CRMLead): Promise<void> {
    const populatedTemplate = this.populateTemplate(
      ADMIN_LEAD_NOTIFICATION_TEMPLATE,
      {
        leadName: lead.Fullname || 'No Name',
        leadId: lead.id.toString(),
        phoneNumber: lead.Phonenumber || 'N/A',
        email: lead.email || 'N/A',
        service: lead.serviceType || 'N/A',
        assignedTo: lead.assignedTo?.fullName || 'Unassigned',
        currentDate: new Date().toLocaleDateString(),
      },
    );

    const adminEmails = ['business@houznext.com'];

    for (const email of adminEmails) {
      await this.sendMail(
        email,
        'New Lead Created',
        'A new lead has been created.',
        populatedTemplate,
      );
    }
  }

  /**
   * Sent after a CRM lead is deleted from the admin app.
   * Recipients: `CRM_LEAD_DELETE_NOTIFY_EMAIL` (comma-separated), else `SMTP_USER`, else business@houznext.com.
   */
  async notifyCrmLeadDeleted(
    lead: CRMLead,
    deletedBy: { email?: string; fullName?: string },
  ): Promise<void> {
    const raw =
      process.env.CRM_LEAD_DELETE_NOTIFY_EMAIL?.trim() ||
      process.env.SMTP_USER?.trim() ||
      'business@houznext.com';
    const recipients = Array.from(
      new Set(
        raw
          .split(/[,;]+/)
          .map((e) => e.trim())
          .filter(Boolean),
      ),
    );

    const assignee =
      lead.assignedTo && typeof (lead.assignedTo as User).fullName === 'string'
        ? (lead.assignedTo as User).fullName
        : '—';

    const cityState = [lead.city, lead.state].filter(Boolean).join(', ') || '—';

    const rows: [string, string][] = [
      ['Name', lead.Fullname || '—'],
      ['Lead ID', String(lead.id)],
      ['Phone', lead.Phonenumber || '—'],
      ['Email', lead.email || '—'],
      ['Status', String(lead.leadstatus || '—')],
      ['Service', String(lead.serviceType || '—')],
      ['Property type', String(lead.propertytype || '—')],
      ['BHK', lead.bhk || '—'],
      ['City / State', cityState],
      ['Platform', String(lead.platform || '—')],
      ['Assigned to', assignee],
    ];

    const tableHtml = rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:8px;border-bottom:1px solid #f1f5f9;font-weight:600;width:140px;">${this.escapeHtml(k)}</td><td style="padding:8px;border-bottom:1px solid #f1f5f9;">${this.escapeHtml(v)}</td></tr>`,
      )
      .join('');

    const who = deletedBy.fullName || deletedBy.email || 'an admin user';
    const html = `<html><body style="font-family:system-ui,sans-serif;font-size:14px;color:#1f2933;">
<div style="max-width:640px;margin:24px auto;padding:24px;border:1px solid #e2e8f0;border-radius:10px;">
<h2 style="margin:0 0 12px;">CRM lead deleted</h2>
<p style="margin:0 0 16px;">The following lead was removed from the CRM by <strong>${this.escapeHtml(who)}</strong>.</p>
<table style="border-collapse:collapse;width:100%;">${tableHtml}</table>
<p style="margin:16px 0 0;font-size:12px;color:#64748b;">${this.escapeHtml(
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    )}</p>
</div></body></html>`;

    const subject = `CRM lead deleted: ${lead.Fullname || lead.id}`;
    const text = `Lead deleted: ${lead.Fullname} (ID ${lead.id}). Phone: ${lead.Phonenumber}. Deleted by: ${who}.`;

    for (const email of recipients) {
      await this.sendMail(email, subject, text, html);
    }
  }

  async notifyAdminsAboutContactLead(contact: ContactUs): Promise<void> {
    const populatedTemplate = this.populateTemplate(
      ADMIN_CONTACT_NOTIFICATION_TEMPLATE,
      {
        leadName: `${contact.firstName} ${contact.lastName}`,
        leadId: contact.id.toString(),
        phoneNumber: contact.contactNumber || 'N/A',
        email: contact.emailAddress || 'N/A',
        service: contact.tellUsMore || 'N/A',
        assignedTo: contact.assignedTo?.fullName || 'Unassigned',
        currentDate: new Date().toLocaleDateString(),
      },
    );

    const adminEmails = ['business@houznext.com'];

    for (const email of adminEmails) {
      await this.sendMail(
        email,
        'New Contact Us Submission',
        'A new Contact Us form has been submitted.',
        populatedTemplate,
      );
    }
  }

  async notifyAdminsAboutReferral(referral: Referral): Promise<void> {
    const formattedDate = referral.createdAt.toLocaleDateString('en-IN', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const populatedTemplate = this.populateTemplate(
      ADMIN_REFERRAL_NOTIFICATION_TEMPLATE,
      {
        friendName: referral.friendName || 'N/A',
        friendPhone: referral.friendPhone || 'N/A',
        referralCode: referral.referralCode,
        referrerName: referral.referrer?.fullName || 'Unknown Referrer',
        createdAt: formattedDate,
      },
    );

    const adminEmails = ['business@houznext.com'];

    const uniqueEmails = Array.from(new Set(adminEmails));

    for (const email of uniqueEmails) {
      await this.sendMail(
        email,
        'New Referral Submitted',
        'A new referral has been submitted on Houznext.',
        populatedTemplate,
      );
    }
  }

  private financeNotifyRecipients(): string[] {
    const raw =
      process.env.FINANCE_NOTIFY_EMAIL?.trim() ||
      process.env.SMTP_USER?.trim() ||
      'business@houznext.com';
    return Array.from(
      new Set(
        raw
          .split(/[,;]+/)
          .map((e) => e.trim())
          .filter(Boolean),
      ),
    );
  }

  private publicApiBase(): string {
    return (
      process.env.PUBLIC_API_URL?.trim() ||
      process.env.API_PUBLIC_URL?.trim() ||
      process.env.BACKEND_PUBLIC_URL?.trim() ||
      'http://localhost:4000'
    ).replace(/\/$/, '');
  }

  buildInvoiceRestoreUrl(id: string, token: string): string {
    return `${this.publicApiBase()}/invoices/${id}/restore?token=${encodeURIComponent(token)}`;
  }

  buildQuotationRestoreUrl(id: string, token: string): string {
    return `${this.publicApiBase()}/cost-estimator/${id}/restore?token=${encodeURIComponent(token)}`;
  }

  /**
   * Notify business@houznext.com (or FINANCE_NOTIFY_EMAIL) about invoice/quotation
   * create, update, or delete. Delete emails include a restore button when restoreUrl is set.
   */
  async notifyFinanceAdminEvent(params: {
    kind: 'invoice' | 'quotation';
    action: 'created' | 'updated' | 'deleted';
    title: string;
    rows: [string, string][];
    restoreUrl?: string;
    actorName?: string;
  }): Promise<void> {
    const when = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const kindLabel = params.kind === 'invoice' ? 'Invoice' : 'Quotation';
    const actionLabel =
      params.action === 'created'
        ? 'created'
        : params.action === 'updated'
          ? 'updated'
          : 'deleted';

    const tableHtml = params.rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:8px;border-bottom:1px solid #f1f5f9;font-weight:600;width:160px;color:#475569;">${this.escapeHtml(k)}</td><td style="padding:8px;border-bottom:1px solid #f1f5f9;color:#1f2933;">${this.escapeHtml(v || '—')}</td></tr>`,
      )
      .join('');

    const restoreBlock = params.restoreUrl
      ? `<div style="margin:20px 0 8px;padding:16px;background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;">
           <p style="margin:0 0 12px;font-size:13px;color:#92400e;"><strong>This ${kindLabel.toLowerCase()} was soft-deleted.</strong> Click below to restore it.</p>
           <a href="${this.escapeHtml(params.restoreUrl)}" style="display:inline-block;padding:10px 18px;background:#2f80ed;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:13px;">Restore ${kindLabel}</a>
           <p style="margin:12px 0 0;font-size:11px;color:#78716c;word-break:break-all;">Or open: ${this.escapeHtml(params.restoreUrl)}</p>
         </div>`
      : '';

    const html = `<html><body style="font-family:Inter,system-ui,sans-serif;font-size:14px;color:#1f2933;background:#f5f7fa;">
<div style="max-width:640px;margin:24px auto;padding:24px;background:#fff;border:1px solid #dde8f5;border-radius:12px;">
  <h2 style="margin:0 0 8px;font-family:Montserrat,sans-serif;font-size:18px;">${this.escapeHtml(params.title)}</h2>
  <p style="margin:0 0 16px;color:#5a6a7e;">A ${kindLabel.toLowerCase()} was <strong>${actionLabel}</strong>${
      params.actorName ? ` by <strong>${this.escapeHtml(params.actorName)}</strong>` : ''
    }.</p>
  <table style="border-collapse:collapse;width:100%;">${tableHtml}</table>
  ${restoreBlock}
  <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">${this.escapeHtml(when)} (IST)</p>
</div></body></html>`;

    const subject = params.title;
    const text = `${kindLabel} ${actionLabel}: ${params.rows
      .map(([k, v]) => `${k}: ${v}`)
      .join(' | ')}${params.restoreUrl ? ` Restore: ${params.restoreUrl}` : ''}`;

    for (const email of this.financeNotifyRecipients()) {
      await this.sendMail(email, subject, text, html);
    }
  }

  async notifyAdminsAboutDeletion({
    deletedEstimatorId,
    deletedBy,
    estimatorFirstName,
    restoreUrl,
    details,
  }: DeletionNotification): Promise<void> {
    const rows: [string, string][] = [
      ['Customer', estimatorFirstName || '—'],
      ['Record ID', deletedEstimatorId],
      ['Deleted by', deletedBy?.username || '—'],
      ...Object.entries(details || {}).map(
        ([k, v]) => [k, v == null ? '—' : String(v)] as [string, string],
      ),
    ];
    await this.notifyFinanceAdminEvent({
      kind: 'quotation',
      action: 'deleted',
      title: `Quotation deleted: ${estimatorFirstName || deletedEstimatorId}`,
      rows,
      restoreUrl,
      actorName: deletedBy?.username,
    });
  }

  async notifyAdminsQuotationCreated(params: {
    id: string;
    quotationNumber: number | null | undefined;
    customerFirstName?: string | null;
    customerLastName?: string | null;
    customerEmail?: string | null;
    customerPhone?: string | number | null;
    subTotal?: number | null;
    postedByName?: string | null;
  }): Promise<void> {
    const qn =
      params.quotationNumber != null
        ? `QT-${String(params.quotationNumber).padStart(4, '0')}`
        : '—';
    await this.notifyFinanceAdminEvent({
      kind: 'quotation',
      action: 'created',
      title: `New quotation ${qn}`,
      actorName: params.postedByName || undefined,
      rows: [
        ['Quotation #', qn],
        ['Record ID', params.id],
        [
          'Customer',
          [params.customerFirstName, params.customerLastName].filter(Boolean).join(' ') ||
            '—',
        ],
        ['Email', params.customerEmail || '—'],
        ['Phone', params.customerPhone != null ? String(params.customerPhone) : '—'],
        [
          'Subtotal',
          params.subTotal != null
            ? `₹${Number(params.subTotal).toLocaleString('en-IN')}`
            : '—',
        ],
        ['Created by', params.postedByName || '—'],
      ],
    });
  }

  async notifyAdminsQuotationUpdated(params: {
    id: string;
    quotationNumber: number | null | undefined;
    customerFirstName?: string | null;
    customerLastName?: string | null;
    customerEmail?: string | null;
    customerPhone?: string | number | null;
    subTotal?: number | null;
    postedByName?: string | null;
  }): Promise<void> {
    const qn =
      params.quotationNumber != null
        ? `QT-${String(params.quotationNumber).padStart(4, '0')}`
        : '—';
    await this.notifyFinanceAdminEvent({
      kind: 'quotation',
      action: 'updated',
      title: `Quotation updated ${qn}`,
      actorName: params.postedByName || undefined,
      rows: [
        ['Quotation #', qn],
        ['Record ID', params.id],
        [
          'Customer',
          [params.customerFirstName, params.customerLastName].filter(Boolean).join(' ') ||
            '—',
        ],
        ['Email', params.customerEmail || '—'],
        ['Phone', params.customerPhone != null ? String(params.customerPhone) : '—'],
        [
          'Subtotal',
          params.subTotal != null
            ? `₹${Number(params.subTotal).toLocaleString('en-IN')}`
            : '—',
        ],
        ['Updated by', params.postedByName || '—'],
      ],
    });
  }

  async notifyAdminsInvoiceEvent(params: {
    action: 'created' | 'updated' | 'deleted';
    id: string;
    invoiceNumber?: string | null;
    billToName?: string | null;
    billToEmail?: string | null;
    billToMobile?: string | null;
    status?: string | null;
    grandTotal?: number | null;
    actorName?: string | null;
    restoreUrl?: string;
  }): Promise<void> {
    const invNo = params.invoiceNumber || '—';
    const titleVerb =
      params.action === 'created'
        ? 'New invoice'
        : params.action === 'updated'
          ? 'Invoice updated'
          : 'Invoice deleted';
    await this.notifyFinanceAdminEvent({
      kind: 'invoice',
      action: params.action,
      title: `${titleVerb}: ${invNo}`,
      actorName: params.actorName || undefined,
      restoreUrl: params.restoreUrl,
      rows: [
        ['Invoice #', invNo],
        ['Record ID', params.id],
        ['Customer', params.billToName || '—'],
        ['Email', params.billToEmail || '—'],
        ['Phone', params.billToMobile || '—'],
        ['Status', params.status || '—'],
        [
          'Grand total',
          params.grandTotal != null
            ? `₹${Number(params.grandTotal).toLocaleString('en-IN')}`
            : '—',
        ],
        [
          params.action === 'deleted' ? 'Deleted by' : params.action === 'updated' ? 'Updated by' : 'Created by',
          params.actorName || '—',
        ],
      ],
    });
  }

  async notifyLivebuildRoomRemoved(params: {
    projectCode: string;
    projectName: string;
    customerName: string;
    customerEmail?: string | null;
    siteManager?: string | null;
    projectAddress?: string | null;
    roomName: string;
    roomType?: string | null;
    dimensions?: string | null;
    progressPct: number;
    status: string;
    workTypeNames: string[];
    removedBy?: string | null;
  }): Promise<void> {
    const raw =
      process.env.LIVEBUILD_ROOM_DELETE_NOTIFY_EMAIL?.trim() ||
      process.env.SMTP_USER?.trim() ||
      'business@houznext.com';
    const adminRecipients = Array.from(
      new Set(
        raw
          .split(/[,;]+/)
          .map((e) => e.trim())
          .filter(Boolean),
      ),
    );

    const when = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const wtList =
      params.workTypeNames.length > 0
        ? params.workTypeNames.map((n) => this.escapeHtml(n)).join(', ')
        : '—';

    const row = (label: string, value: string) =>
      `<tr><td style="padding:6px 12px 6px 0;color:#5a6a7e;font-weight:600;vertical-align:top;">${label}</td><td style="padding:6px 0;">${this.escapeHtml(value)}</td></tr>`;

    const html = `
    <html>
      <body style="font-family: system-ui, sans-serif; font-size: 14px; color: #1f2933;">
        <div style="max-width: 640px; margin: 24px auto; padding: 24px; border: 1px solid #dbe4f1; border-radius: 10px;">
          <h2 style="margin: 0 0 12px; color: #dc2626;">Room removed from LiveBuild project</h2>
          <p style="margin: 0 0 16px;">A room was removed from an active Houznext LiveBuild project.</p>
          <table style="border-collapse: collapse; width: 100%; font-size: 13px;">
            ${row('Project', `${params.projectName} (${params.projectCode})`)}
            ${row('Customer', params.customerName)}
            ${row('Site manager', params.siteManager || '—')}
            ${row('Address', params.projectAddress || '—')}
            ${row('Room removed', params.roomName)}
            ${row('Room type', params.roomType || '—')}
            ${row('Dimensions', params.dimensions || '—')}
            ${row('Progress at removal', `${params.progressPct}%`)}
            ${row('Status', params.status)}
            ${row('Work types', wtList)}
            ${row('Removed by', params.removedBy || 'Admin')}
            ${row('Time', `${when} (IST)`)}
          </table>
        </div>
      </body>
    </html>`;

    const subject = `LiveBuild: Room "${params.roomName}" removed — ${params.projectCode}`;
    const text = [
      `Room removed from LiveBuild project`,
      `Project: ${params.projectName} (${params.projectCode})`,
      `Customer: ${params.customerName}`,
      `Room: ${params.roomName}`,
      `Work types: ${params.workTypeNames.join(', ') || '—'}`,
      `Removed by: ${params.removedBy || 'Admin'}`,
      `Time: ${when} (IST)`,
    ].join('\n');

    const sendTo = new Set(adminRecipients);
    if (params.customerEmail?.trim()) {
      sendTo.add(params.customerEmail.trim());
    }

    for (const email of sendTo) {
      await this.sendMail(email, subject, text, html);
    }
  }

  async notifyLivebuildProjectDeleted(params: {
    projectCode: string;
    projectName: string;
    customerName: string;
    customerEmail?: string | null;
    customerMobile?: string | null;
    siteManager?: string | null;
    address?: string | null;
    propertyType?: string | null;
    projectType?: string | null;
    status: string;
    phase?: string | null;
    progressPct: number;
    progressMethod?: string | null;
    startDate?: string | null;
    dueDate?: string | null;
    roomCount: number;
    paymentCount: number;
    queryCount: number;
    materialCount: number;
    deletedBy?: string | null;
  }): Promise<void> {
    const raw =
      process.env.LIVEBUILD_PROJECT_DELETE_NOTIFY_EMAIL?.trim() ||
      process.env.LIVEBUILD_ROOM_DELETE_NOTIFY_EMAIL?.trim() ||
      process.env.SMTP_USER?.trim() ||
      'business@houznext.com';
    const adminRecipients = Array.from(
      new Set(
        raw
          .split(/[,;]+/)
          .map((e) => e.trim())
          .filter(Boolean),
      ),
    );

    const when = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const row = (label: string, value: string) =>
      `<tr><td style="padding:6px 12px 6px 0;color:#5a6a7e;font-weight:600;vertical-align:top;">${label}</td><td style="padding:6px 0;">${this.escapeHtml(value)}</td></tr>`;

    const html = `
    <html>
      <body style="font-family: system-ui, sans-serif; font-size: 14px; color: #1f2933;">
        <div style="max-width: 640px; margin: 24px auto; padding: 24px; border: 1px solid #dbe4f1; border-radius: 10px;">
          <h2 style="margin: 0 0 12px; color: #dc2626;">LiveBuild project deleted</h2>
          <p style="margin: 0 0 16px;">A Houznext LiveBuild project and all related data were permanently removed from the admin panel.</p>
          <table style="border-collapse: collapse; width: 100%; font-size: 13px;">
            ${row('Project', `${params.projectName} (${params.projectCode})`)}
            ${row('Customer', params.customerName)}
            ${row('Customer mobile', params.customerMobile || '—')}
            ${row('Customer email', params.customerEmail || '—')}
            ${row('Site manager', params.siteManager || '—')}
            ${row('Address', params.address || '—')}
            ${row('Property type', params.propertyType || '—')}
            ${row('Project type', params.projectType || '—')}
            ${row('Status', params.status)}
            ${row('Phase', params.phase || '—')}
            ${row('Progress', `${params.progressPct}%`)}
            ${row('Progress method', params.progressMethod || '—')}
            ${row('Start date', params.startDate || '—')}
            ${row('Due date', params.dueDate || '—')}
            ${row('Rooms removed', String(params.roomCount))}
            ${row('Payment milestones', String(params.paymentCount))}
            ${row('Queries', String(params.queryCount))}
            ${row('BOQ / materials', String(params.materialCount))}
            ${row('Deleted by', params.deletedBy || 'Admin')}
            ${row('Time', `${when} (IST)`)}
          </table>
        </div>
      </body>
    </html>`;

    const subject = `LiveBuild: Project deleted — ${params.projectCode} (${params.projectName})`;
    const text = [
      'LiveBuild project deleted',
      `Project: ${params.projectName} (${params.projectCode})`,
      `Customer: ${params.customerName}`,
      `Progress: ${params.progressPct}% · Status: ${params.status}`,
      `Related records: ${params.roomCount} rooms, ${params.paymentCount} payments, ${params.queryCount} queries, ${params.materialCount} materials`,
      `Deleted by: ${params.deletedBy || 'Admin'}`,
      `Time: ${when} (IST)`,
    ].join('\n');

    const sendTo = new Set(adminRecipients);
    if (params.customerEmail?.trim()) {
      sendTo.add(params.customerEmail.trim());
    }

    for (const email of sendTo) {
      await this.sendMail(email, subject, text, html);
    }
  }

  async notifyAdminsInvoiceAdminPanel(params: {
    action: 'created' | 'deleted';
    invoiceId: string;
    invoiceNumber: string;
    billToName: string;
    actorName?: string | null;
  }): Promise<void> {
    const when = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const verb =
      params.action === 'created'
        ? 'created'
        : 'deleted';
    const html = `
    <html>
      <body style="font-family: system-ui, sans-serif; font-size: 14px; color: #1f2933;">
        <div style="max-width: 640px; margin: 24px auto; padding: 24px; border: 1px solid #dbe4f1; border-radius: 10px;">
          <h2 style="margin: 0 0 12px;">Invoice ${verb} (admin)</h2>
          <ul style="margin: 0; padding-left: 18px;">
            <li><strong>Action:</strong> ${verb}</li>
            <li><strong>Invoice #:</strong> ${params.invoiceNumber}</li>
            <li><strong>Bill to:</strong> ${params.billToName}</li>
            <li><strong>Record ID:</strong> ${params.invoiceId}</li>
            <li><strong>Admin user:</strong> ${params.actorName ?? '—'}</li>
            <li><strong>Time:</strong> ${when} (IST)</li>
          </ul>
        </div>
      </body>
    </html>`;
    const adminEmails = ['business@houznext.com'];
    const subject =
      params.action === 'created'
        ? `New invoice ${params.invoiceNumber} — admin`
        : `Invoice deleted ${params.invoiceNumber} — admin`;
    for (const email of adminEmails) {
      await this.sendMail(
        email,
        subject,
        `Invoice ${params.invoiceNumber} (${params.invoiceId}) ${verb}.`,
        html,
      );
    }
  }
}
