import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ControllerAuthGuard } from 'src/guard';
import { OrdersService } from './order.service';
import {
  CancelOrderDto,
  CreateOrderDto,
  CreateOrderFromCartDto,
  ProcessReturnDto,
  RequestReturnDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
} from './dto/orders.dto';
import {
  OrderSummaryDto,
  PaginatedOrderResponseDto,
} from './dto/order-summary.dto';
import { FilterOrdersDto } from './dto/order-filter.dto';
import { CreateOrderQueryDto, UpdateOrderQueryDto } from './dto/order-query.dto';
import { OrderQueryService } from './order-query.service';

type RequestUser = {
  id: string;
  roles?: any[];
  userKind?: any[];
  branchMembership?: any;
};

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(ControllerAuthGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly orderQueryService: OrderQueryService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create order for store/services/legal/property premium/booking.',
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Order created' })
  async createOrder(
    @Body() dto: CreateOrderDto,
    @Req() req: { user: RequestUser },
  ): Promise<OrderSummaryDto> {
    const userId = dto.userId ?? req.user.id;
    return this.ordersService.createOrder(dto, userId, req.user);
  }

  @Post('from-cart')
  @ApiOperation({
    summary: 'Create order from cart (user)',
    description:
      'Creates order using cart items, reserves inventory, clears cart. Use body.paymentMethod: "COD" for Cash on Delivery (order marked paid and CONFIRMED).',
  })
  @ApiBody({ type: CreateOrderFromCartDto, required: false })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description:
      'Creates order using cart items, reserves inventory, clears cart.',
  })
  async createOrderFromCart(
    @Body() dto: CreateOrderFromCartDto,
    @Req() req: { user: RequestUser },
  ): Promise<OrderSummaryDto> {
    return this.ordersService.createOrderFromCart(req.user.id, req.user, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user orders' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Orders found' })
  async getMyOrders(
    @Req() req: { user: RequestUser },
    @Query() filter: FilterOrdersDto,
  ): Promise<PaginatedOrderResponseDto> {
    return this.ordersService.getOrdersForUser(req.user.id, filter);
  }

  @Get('queries/all')
  @ApiOperation({ summary: 'Admin: List all order queries (optional filters)' })
  async getAllOrderQueries(
    @Req() req: { user: RequestUser },
    @Query('orderId') orderId?: string,
    @Query('status') status?: string,
  ) {
    return this.orderQueryService.listAll(req.user, {
      orderId,
      status: status as any,
    });
  }

  @Get('queries/:queryId')
  @ApiOperation({ summary: 'Get single order query by id' })
  async getOrderQueryById(
    @Param('queryId') queryId: string,
    @Req() req: { user: RequestUser },
  ) {
    return this.orderQueryService.getById(queryId, req.user);
  }

  @Patch('queries/:queryId')
  @ApiOperation({ summary: 'Admin: Add reply and/or update status (ANSWERED, CLOSED)' })
  @ApiBody({ type: UpdateOrderQueryDto })
  async updateOrderQuery(
    @Param('queryId') queryId: string,
    @Body() dto: UpdateOrderQueryDto,
    @Req() req: { user: RequestUser },
  ) {
    return this.orderQueryService.update(queryId, dto, req.user);
  }

  @Get(':id/tracking')
  @ApiOperation({ summary: 'Get order tracking timeline (user)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tracking timeline returned' })
  async getOrderTracking(
    @Param('id') id: string,
    @Req() req: { user: RequestUser },
  ) {
    return this.ordersService.getOrderTracking(id, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single order by id (user/admin)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order found' })
  async getOrderById(
    @Param('id') id: string,
    @Req() req: { user: RequestUser },
  ): Promise<OrderSummaryDto> {
    return this.ordersService.getOrderById(id, req.user);
  }

  // -------------------- UPDATE (DETAILS) --------------------

  @Patch(':id')
  @ApiOperation({ summary: 'Update order details (user/admin)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order updated' })
  async updateOrder(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
    @Req() req: { user: RequestUser },
  ): Promise<OrderSummaryDto> {
    return this.ordersService.updateOrder(id, dto, req.user);
  }

  // -------------------- CANCEL (USER) --------------------

  @Delete(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an order (user)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order cancelled' })
  async cancelOrder(
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
    @Req() req: { user: RequestUser },
  ): Promise<OrderSummaryDto> {
    return this.ordersService.cancelOrder(id, dto, req.user);
  }

  // -------------------- RETURN FLOW (USER) --------------------

  @Post(':id/return')
  @ApiOperation({ summary: 'Request return (user)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return requested' })
  async requestReturn(
    @Param('id') id: string,
    @Body() dto: RequestReturnDto,
    @Req() req: { user: RequestUser },
  ): Promise<OrderSummaryDto> {
    return this.ordersService.requestReturn(id, dto, req.user);
  }

  // -------------------- ADMIN --------------------
  @Get()
  @ApiOperation({ summary: 'List all orders (admin/staff)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'fetched all orders' })
  async getAllOrders(
    @Query() filter: FilterOrdersDto,
    @Req() req: { user: RequestUser },
  ): Promise<PaginatedOrderResponseDto> {
    return this.ordersService.getAllOrders(filter, req.user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (admin/staff)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order status updated' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: { user: RequestUser },
  ): Promise<OrderSummaryDto> {
    return this.ordersService.updateOrderStatus(id, dto, req.user);
  }

  @Patch(':id/return/process')
  @ApiOperation({ summary: 'Approve / Reject return (admin/staff)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return processed' })
  async processReturn(
    @Param('id') id: string,
    @Body() dto: ProcessReturnDto,
    @Req() req: { user: RequestUser },
  ): Promise<OrderSummaryDto> {
    return this.ordersService.processReturn(id, dto, req.user);
  }

  @Patch(':id/assign-agent')
  @ApiOperation({ summary: 'Assign service agent to an order (admin/staff)' })
  @ApiBody({ schema: { properties: { agentUserId: { type: 'string' } } } })
  @ApiResponse({ status: HttpStatus.OK, description: 'Agent assigned' })
  async assignServiceAgent(
    @Param('id') id: string,
    @Body() body: { agentUserId: string },
    @Req() req: { user: RequestUser },
  ): Promise<OrderSummaryDto> {
    return this.ordersService.assignServiceAgent(id, body.agentUserId, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order (admin only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order deleted' })
  async deleteOrder(
    @Param('id') id: string,
    @Req() req: { user: RequestUser },
  ) {
    return this.ordersService.deleteOrder(id, req.user);
  }

  // -------------------- ORDER QUERIES (user questions / admin replies) --------------------

  @Post(':id/queries')
  @ApiOperation({ summary: 'User: Create a query about an order' })
  @ApiBody({ type: CreateOrderQueryDto })
  async createOrderQuery(
    @Param('id') id: string,
    @Body() dto: CreateOrderQueryDto,
    @Req() req: { user: RequestUser },
  ) {
    return this.orderQueryService.create(id, dto, req.user.id);
  }

  @Get(':id/queries')
  @ApiOperation({ summary: 'Get queries for an order (user: own; admin: all)' })
  async getOrderQueries(
    @Param('id') id: string,
    @Req() req: { user: RequestUser },
  ) {
    return this.orderQueryService.listByOrder(id, req.user);
  }
}
