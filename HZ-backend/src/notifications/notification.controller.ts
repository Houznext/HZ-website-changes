import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
  Headers,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  CreateNotificationDto,
  sendEmailNotificationDto,
  sendSmsNotificationDto,
} from './dto/notification.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ControllerAuthGuard } from 'src/guard';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('notifications')
@ApiTags('Notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  @UseGuards(ControllerAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Create a notification',
    description: 'This endpoint creates a new notification in the system.',
  })
  @ApiResponse({
    status: 201,
    description: 'Notification successfully created.',
  })
  async createNotification(
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    return await this.notificationService.createNotification(
      createNotificationDto,
    );
  }
  @UseGuards(ControllerAuthGuard)
  @Post('send-email')
  @ApiOperation({
    summary: 'Send an email notification',
    description: 'This endpoint sends an email notification to a recipient.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email notification successfully sent.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async sendEmailNotification(
    @Body() sendEmailNotificationDto: sendEmailNotificationDto,
  ) {
    return await this.notificationService.sendEmailNotification(
      sendEmailNotificationDto,
    );
  }
  @UseGuards(ControllerAuthGuard)
  @Post('send-sms')
  @ApiOperation({
    summary: 'Send an SMS notification',
    description: 'This endpoint sends an SMS notification to a recipient.',
  })
  @ApiResponse({
    status: 200,
    description: 'SMS notification successfully sent.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async sendSmsNotification(
    @Body() sendSmsNotificationDto: sendSmsNotificationDto,
  ) {
    return await this.notificationService.sendSmsNotification(
      sendSmsNotificationDto,
    );
  }

  @Get(':userId')
  @ApiOperation({
    summary: 'Get user notifications',
    description:
      'This endpoint retrieves all notifications for a specific user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications successfully retrieved.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found or no notifications available.',
  })
  async getNotifications(@Param('userId') userId: string) {
    return await this.notificationService.getNotifications(userId);
  }

  //marked as Read
  @UseGuards(ControllerAuthGuard)
  @Patch(':notificationId/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Param('notificationId') notificationId: number) {
    return await this.notificationService.markAsRead(notificationId);
  }
  @Patch('mark-all/:userId')
async markAllAsRead(@Param('userId') userId: string) {
  return this.notificationService.markAllAsRead(userId);
}

  @Post('chatbot')
  @ApiOperation({
    summary: 'Create a notification for chatbot messages',
    description:
      'Creates a notification for a specific admin user (public endpoint guarded by secret header).',
  })
  @ApiResponse({
    status: 201,
    description: 'Notification successfully created.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async createChatbotNotification(
    @Headers('x-chatbot-secret') secret: string,
    @Body() body: CreateNotificationDto,
  ) {
    const expected = process.env.CHATBOT_NOTIFICATION_SECRET;
    if (!expected || secret !== expected) {
      throw new UnauthorizedException('Invalid chatbot secret');
    }
    if (!body?.userId || !body?.message) {
      throw new BadRequestException('userId and message are required');
    }

    const notification = await this.notificationService.createNotification({
      userId: body.userId,
      message: body.message,
    });
    console.log(notification,"notification created in chatbot");

    this.eventEmitter.emit('realtime.push', {
      userId: body.userId,
      data: notification,
    });

    return notification;
  }

}
