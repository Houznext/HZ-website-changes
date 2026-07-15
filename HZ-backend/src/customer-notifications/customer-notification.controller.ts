import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerNotificationService } from './customer-notification.service';
import {
  InteriorJwtGuard,
  InteriorJwtPayload,
} from 'src/interiors/interior-jwt.guard';

@ApiTags('customer-notifications')
@ApiBearerAuth()
@UseGuards(InteriorJwtGuard)
@Controller('customer-notifications')
export class CustomerNotificationController {
  constructor(private readonly service: CustomerNotificationService) {}

  private requireCustomer(req: { user?: InteriorJwtPayload }) {
    const user = req.user;
    if (!user?.sub || user.role !== 'customer') {
      throw new UnauthorizedException('Customer login required');
    }
    return user;
  }

  @Get()
  @ApiOperation({ summary: 'List notifications for the logged-in customer' })
  async list(
    @Req() req: { user?: InteriorJwtPayload },
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const user = this.requireCustomer(req);
    return this.service.listForCustomer(user.sub, user.mobile, {
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      unreadOnly: unreadOnly === '1' || unreadOnly === 'true',
    });
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Unread notification count' })
  async unreadCount(@Req() req: { user?: InteriorJwtPayload }) {
    const user = this.requireCustomer(req);
    return this.service.unreadCount(user.sub, user.mobile);
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@Req() req: { user?: InteriorJwtPayload }) {
    const user = this.requireCustomer(req);
    return this.service.markAllRead(user.sub, user.mobile);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark one notification as read' })
  async markRead(
    @Param('id') id: string,
    @Req() req: { user?: InteriorJwtPayload },
  ) {
    const user = this.requireCustomer(req);
    return this.service.markRead(id, user.sub, user.mobile);
  }
}
