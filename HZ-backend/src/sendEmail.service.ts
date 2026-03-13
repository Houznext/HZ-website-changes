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
import { Referral } from './Referral/entities/referral.entity';
import { ServiceCustomLead } from './servicecustomlead/entities/servicecustomlead.entity';

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
  deletedBy: { id: string;  username: string };
  estimatorFirstName?: string;
}

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587, // or 465 for secure
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'lavudyasachinchavan@gmail.com', // add default from email
        pass: 'zohoswdsdpowjagl', //add pw
      },
    });
  }

  populateTemplate(template: string, data: Record<string, string>): string {
    return template.replace(/\$\{(.*?)\}/g, (_, key) => data[key] || '');
  }

  async sendMail(to: string, subject: string, text: string, html: string) {
    const mailOptions = {
      from: 'lavudyasachinchavan@gmail.com', // add default from email
      to,
      subject,
      text,
      html,
    };

    return this.transporter.sendMail(mailOptions);
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
      // 'propertylistingadmin@dreamcasa.com',
      // 'furnitureadmin@dreamcasa.com',
      // 'interiorsadmin@dreamcasa.com',
      // 'remainingadmins@dreamcasa.com',
      ' dreamcasarealestates@gmail.com',
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

    const adminEmails = ['dreamcasarealestates@gmail.com'];
    if (lead.assignedTo?.email) {
      adminEmails.push(lead.assignedTo.email);
    }

    const uniqueEmails = Array.from(new Set(adminEmails));

    for (const email of uniqueEmails) {
      await this.sendMail(
        email,
        'New Lead Created',
        'A new lead has been created.',
        populatedTemplate,
      );
    }
  }
  async notifyAdminsAboutServiceLead(lead: ServiceCustomLead): Promise<void> {
    const populatedTemplate = this.populateTemplate(
      ADMIN_LEAD_NOTIFICATION_TEMPLATE,
      {
        leadName: lead.name || 'No Name',
        leadId: lead.id.toString(),
        phoneNumber: lead.phonenumber || 'N/A',

        service: lead.serviceType || 'N/A',
        assignedTo: lead.assignedTo?.fullName || 'Unassigned',
        currentDate: new Date().toLocaleDateString(),
      },
    );

    const adminEmails = ['dreamcasarealestates@gmail.com'];
    if (lead.assignedTo?.email) {
      adminEmails.push(lead.assignedTo.email);
    }

    const uniqueEmails = Array.from(new Set(adminEmails));

    for (const email of uniqueEmails) {
      await this.sendMail(
        email,
        'New Lead Created',
        'A new lead has been created.',
        populatedTemplate,
      );
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

    const adminEmails = ['dreamcasarealestates@gmail.com'];
    if (contact.assignedTo?.email) {
      adminEmails.push(contact.assignedTo.email);
    }

    const uniqueEmails = Array.from(new Set(adminEmails));

    for (const email of uniqueEmails) {
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

    const adminEmails = ['dreamcasarealestates@gmail.com'];

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

  async notifyAdminsAboutDeletion({
    deletedEstimatorId,
    deletedBy,
    estimatorFirstName,
  }: DeletionNotification): Promise<void> {
    const formattedDate = new Date().toLocaleDateString();

    const populatedTemplate = `
    <html>
      <body style="font-family: 'Poppins', sans-serif; font-size: 14px; color: #333; background-color: #e9edf8;">
        <div style="max-width: 680px; margin: 40px auto; padding: 40px; background-color: #bfdbfe; border-radius: 8px;">
          <h2>🗑️ Cost Estimator Deleted</h2>
          <p>Cost Estimator <strong>${estimatorFirstName}</strong>  with ID <strong>${deletedEstimatorId}</strong> was deleted by <strong>${deletedBy. username}</strong> on ${formattedDate}.</p>
        </div>
      </body>
    </html>
  `;

    const adminEmails = [
      'dreamcasarealestates@gmail.com',
      'superadmin@gmail.com',
    ];
    for (const email of adminEmails) {
      await this.sendMail(
        email,
        'Cost Estimator Deleted',
        `Estimator  ${estimatorFirstName} ID ${deletedEstimatorId} deleted by ${deletedBy.username}`,
        populatedTemplate,
      );
    }
  }
}
