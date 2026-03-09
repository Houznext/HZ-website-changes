import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { MailerService } from 'src/sendEmail.service';
import { SmsService } from 'src/sms.service';
import {
  CreateNotificationDto,
  sendEmailNotificationDto,
  sendSmsNotificationDto,
} from './dto/notification.dto';

const notificationEmailTemplate = (
  message: string,
  date: string = new Date().toLocaleDateString(),
) => `
  <html>
  <body style="font-family: 'Poppins', sans-serif; font-size: 14px; color: #434343;">
    <div style="max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #f4f7ff;">
      <header style="display: flex; justify-content: space-between; align-items: center;">
        <img alt="OneCasa Real Estate" src="https://dreamcasa-web-gofv.vercel.app/_next/image?url=%2Fimages%2Flogomain.png&w=1920&q=75" height="30px" />
        <span style="color: #434343; font-size: 12px;">${date}</span>
      </header>
      <main style="margin-top: 20px;">
        <h1 style="font-size: 24px; color: #333;">Notification from OneCasa</h1>
       <p style="font-size: 16px; color: #666;">
          Hello, <br><br>
          We’re excited to update you on the progress of your project with <strong>OneCasa Builders</strong>. Here’s the latest update:
        </p>
        <p>${message}</p>
        <p>If you have any questions, feel free to contact our support team.</p>
      </main>
      <div style="margin-top: 25px; text-align: center;">
          <a href="#" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 5px;">
            Track Progress
          </a>
          <a href="mailto:support@dreamcasa.com" style="display: inline-block; margin-left: 10px; padding: 12px 24px; background-color: #28a745; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 5px;">
            Contact Support
          </a>
        </div>
      <footer style="text-align: center; margin-top: 40px; font-size: 12px; color: #666;">
        <p>📞 Need assistance? Contact us at <a href="mailto:support@dreamcasa.com" style="color: #007bff; text-decoration: none;">support@dreamcasa.com</a> or call (123) 456-7890</p>
        <p style="margin-top: 10px;">OneCasa Real Estate, 1234 Elm Street, City, State, ZIP</p>
        <p style="color: #999;">OneCasa &copy; ${new Date().getFullYear()} - All Rights Reserved</p>
      </footer>
    </div>
  </body>
  </html>
`;

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly mailerService: MailerService,
    private readonly smsService: SmsService,
  ) {}

  async createNotification(createNotificationDto: CreateNotificationDto) {
    try {
      const { userId, message } = createNotificationDto;

      const notification = this.notificationRepository.create({
        userId,
        message,
        isRead: false,
        createdAt: new Date(),
      });

      const savedNotification =
        await this.notificationRepository.save(notification);

      return savedNotification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw new InternalServerErrorException('Unable to create notification');
    }
  }

  async sendEmailNotification(
    sendEmailNotificationDto: sendEmailNotificationDto,
  ) {
    try {
      const { email, message, template } = sendEmailNotificationDto;

      let emailTemplate = '';

      if (template) {
        emailTemplate = template;
      } else {
        emailTemplate = notificationEmailTemplate(message);
      }

      const mailResponse = await this.mailerService.sendMail(
        email,
        'Notification',
        'New notification from DreamCasa',
        emailTemplate,
      );

      return mailResponse;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      throw new InternalServerErrorException(
        'Unable to send email notification',
      );
    }
  }

  async sendSmsNotification(sendSmsNotificationDto: sendSmsNotificationDto) {
    try {
      const { message, phone } = sendSmsNotificationDto;

      const smsMessage = `New notification from DreamCasa: ${message}`;

      await this.smsService.sendSms(phone, smsMessage);
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
      throw new InternalServerErrorException('Unable to send SMS notification');
    }
  }
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      return await this.notificationRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      console.error('Failed to get notifications:', error);
      throw new InternalServerErrorException(
        'Unable to retrieve notifications',
      );
    }
  }

  async markAsRead(notificationId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });
    if (!notification) throw new NotFoundException('Notification not found');

    notification.isRead = true;
    return await this.notificationRepository.save(notification);
  }
  async markAllAsRead(userId: string) {
  await this.notificationRepository.update(
    { userId, isRead: false },
    { isRead: true }
  );
  return { success: true, message: "All notifications marked as read" };
}

}
