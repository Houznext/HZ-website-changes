import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ControllerAuthGuard } from 'src/guard';
import { ShiprocketService } from './shiprocket.service';
import { Order } from 'src/orders/entities/order.entity';
import { OrderStatusEnum } from 'src/orders/enum/order.enum';
import { ShiprocketWebhookDto } from './dto/shiprocket-webhook.dto';
import { CreateShipmentDto, ServiceabilityDto } from './dto/create-shipment.dto';

@ApiTags('Shiprocket')
@Controller('shiprocket')
export class ShiprocketController {
  private readonly logger = new Logger(ShiprocketController.name);

  constructor(
    private readonly shiprocketService: ShiprocketService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Shiprocket webhook for tracking updates (public)' })
  async handleWebhook(
    @Body() dto: ShiprocketWebhookDto,
    @Headers('x-api-key') apiKey?: string,
  ) {
    const expectedToken = this.configService.get('SHIPROCKET_WEBHOOK_TOKEN', '');
    if (expectedToken && apiKey !== expectedToken) {
      throw new ForbiddenException('Invalid webhook token');
    }

    this.logger.log(`Shiprocket webhook: AWB=${dto.awb} status_id=${dto.current_status_id} status=${dto.current_status}`);

    const order = await this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.branch', 'branch')
      .where(`order."shippingDetails"::jsonb->>'trackingId' = :awb`, { awb: dto.awb })
      .getOne();

    if (!order) {
      this.logger.warn(`No order found for AWB ${dto.awb}`);
      return { status: 'ok', message: 'No matching order' };
    }

    const newStatus = this.shiprocketService.mapStatusIdToOrderStatus(dto.current_status_id);
    if (!newStatus) {
      this.logger.log(`Status ${dto.current_status_id} does not map to an order status change`);
      return { status: 'ok', message: 'Status noted' };
    }

    const oldStatus = order.status;
    if (oldStatus === newStatus) {
      return { status: 'ok', message: 'Status unchanged' };
    }

    order.status = newStatus as OrderStatusEnum;
    order.statusHistory = [
      ...(order.statusHistory ?? []),
      {
        status: newStatus,
        at: dto.current_timestamp || new Date().toISOString(),
        by: 'shiprocket_webhook',
        note: `${dto.courier_name ?? 'Courier'}: ${dto.current_status}`,
      },
    ];

    const existing = order.shippingDetails ?? {};
    order.shippingDetails = {
      ...existing,
      courierName: dto.courier_name || existing.courierName,
      lastTrackingUpdate: dto.current_status,
      lastTrackingTimestamp: dto.current_timestamp,
      etd: dto.etd || existing.etd,
      ...(newStatus === 'DELIVERED' ? { deliveredAt: dto.current_timestamp || new Date().toISOString() } : {}),
    };

    await this.orderRepo.save(order);

    this.eventEmitter.emit('order.statusChanged', {
      orderId: order.id,
      orderNo: order.orderNo,
      orderType: order.type,
      userId: order.user?.id,
      newStatus,
      oldStatus,
      branchId: order.branch?.id,
      updatedBy: 'shiprocket_webhook',
      courierName: dto.courier_name,
      trackingId: dto.awb,
      customerEmail: order.user?.email,
      customerPhone: order.user?.phone,
      timestamp: new Date().toISOString(),
    });

    return { status: 'ok', orderStatus: newStatus };
  }

  @Post('create-shipment')
  @UseGuards(ControllerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create shipment on Shiprocket for an order (admin)' })
  async createShipment(@Body() dto: CreateShipmentDto) {
    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId },
      relations: ['items', 'user', 'branch'],
    });

    if (!order) {
      throw new ForbiddenException('Order not found');
    }

    const payload = this.shiprocketService.buildShipmentPayload(order);
    const result = await this.shiprocketService.createOrder(payload);

    const existing = order.shippingDetails ?? {};
    order.shippingDetails = {
      ...existing,
      shiprocketOrderId: result.order_id,
      shiprocketShipmentId: result.shipment_id,
      courierName: result.courier_name || existing.courierName,
      trackingId: result.awb_code || existing.trackingId,
      courierCompanyId: result.courier_company_id,
    };

    if (result.awb_code) {
      order.statusHistory = [
        ...(order.statusHistory ?? []),
        {
          status: 'SHIPMENT_CREATED',
          at: new Date().toISOString(),
          by: 'shiprocket',
          note: `Shipment created: AWB ${result.awb_code}, Courier: ${result.courier_name}`,
        },
      ];
    }

    await this.orderRepo.save(order);

    return {
      success: true,
      shiprocketOrderId: result.order_id,
      shipmentId: result.shipment_id,
      awbCode: result.awb_code,
      courierName: result.courier_name,
    };
  }

  @Post('generate-awb')
  @UseGuards(ControllerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate AWB for a shipment' })
  async generateAWB(@Body() body: { shipmentId: number; courierId?: number }) {
    return this.shiprocketService.generateAWB(body.shipmentId, body.courierId);
  }

  @Post('generate-label')
  @UseGuards(ControllerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate shipping label' })
  async generateLabel(@Body() body: { shipmentIds: number[] }) {
    return this.shiprocketService.generateLabel(body.shipmentIds);
  }

  @Post('generate-manifest')
  @UseGuards(ControllerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate shipping manifest' })
  async generateManifest(@Body() body: { shipmentIds: number[] }) {
    return this.shiprocketService.generateManifest(body.shipmentIds);
  }

  @Post('schedule-pickup')
  @UseGuards(ControllerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Schedule pickup for a shipment' })
  async schedulePickup(@Body() body: { shipmentId: number }) {
    return this.shiprocketService.schedulePickup(body.shipmentId);
  }

  @Get('track/:awbCode')
  @UseGuards(ControllerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Track shipment by AWB code' })
  async trackShipment(@Param('awbCode') awbCode: string) {
    return this.shiprocketService.trackShipment(awbCode);
  }

  @Get('serviceability')
  @UseGuards(ControllerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check courier serviceability and rates' })
  @ApiQuery({ name: 'pickupPincode', required: true })
  @ApiQuery({ name: 'deliveryPincode', required: true })
  @ApiQuery({ name: 'weight', required: true })
  @ApiQuery({ name: 'cod', required: false })
  async checkServiceability(
    @Query('pickupPincode') pickupPincode: string,
    @Query('deliveryPincode') deliveryPincode: string,
    @Query('weight') weight: string,
    @Query('cod') cod?: string,
  ) {
    return this.shiprocketService.checkServiceability({
      pickup_postcode: pickupPincode,
      delivery_postcode: deliveryPincode,
      weight: parseFloat(weight),
      cod: cod ? parseInt(cod, 10) : 0,
    });
  }

  @Post('cancel')
  @UseGuards(ControllerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel shipment by AWB' })
  async cancelShipment(@Body() body: { awbs: string[] }) {
    return this.shiprocketService.cancelShipment(body.awbs);
  }
}
