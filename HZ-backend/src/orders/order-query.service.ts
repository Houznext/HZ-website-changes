import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderQuery, OrderQueryReply, OrderQueryStatus } from './entities/order-query.entity';
import { Order } from './entities/order.entity';
import { CreateOrderQueryDto, UpdateOrderQueryDto } from './dto/order-query.dto';

type RequestUser = {
  id: string;
  userKind?: any[];
  branchMembership?: { branchRoles?: { roleName: string }[] };
};

@Injectable()
export class OrderQueryService {
  constructor(
    @InjectRepository(OrderQuery)
    private readonly queryRepo: Repository<OrderQuery>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  private isAdmin(user: RequestUser): boolean {
    if (user?.userKind?.includes('ADMIN') || user?.userKind?.includes('STAFF'))
      return true;
    const roleNames = user?.branchMembership?.branchRoles?.map((r) => r.roleName) ?? [];
    return roleNames.includes('SuperAdmin') || roleNames.includes('SUPER_ADMIN');
  }

  /** User: create a query for their order */
  async create(orderId: string, dto: CreateOrderQueryDto, userId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['user'],
    });
    if (!order) throw new NotFoundException('Order not found');
    const orderUserId = (order as any).userId ?? order.user?.id;
    if (orderUserId !== userId) {
      throw new ForbiddenException('You can only create queries for your own orders');
    }

    const q = this.queryRepo.create({
      order: { id: orderId },
      user: { id: userId },
      subject: dto.subject,
      message: dto.message,
      status: OrderQueryStatus.OPEN,
    });
    return this.queryRepo.save(q);
  }

  /** User: get their queries for an order; Admin: get all for order */
  async listByOrder(orderId: string, user: RequestUser) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['user'],
    });
    if (!order) throw new NotFoundException('Order not found');

    const qb = this.queryRepo
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.user', 'user')
      .where('q.orderId = :orderId', { orderId });

    if (!this.isAdmin(user)) {
      const orderUserId = (order as any).userId ?? order.user?.id;
      if (orderUserId !== user.id) throw new ForbiddenException('Access denied');
      qb.andWhere('q.userId = :userId', { userId: user.id });
    }

    qb.orderBy('q.createdAt', 'DESC');
    return qb.getMany();
  }

  /** Admin: list all queries with optional filters */
  async listAll(user: RequestUser, filters?: { orderId?: string; status?: OrderQueryStatus }) {
    if (!this.isAdmin(user)) throw new ForbiddenException('Admin only');

    const qb = this.queryRepo
      .createQueryBuilder('q')
      .leftJoinAndSelect('q.order', 'order')
      .leftJoinAndSelect('q.user', 'user');

    if (filters?.orderId) qb.andWhere('q.orderId = :orderId', { orderId: filters.orderId });
    if (filters?.status) qb.andWhere('q.status = :status', { status: filters.status });

    qb.orderBy('q.createdAt', 'DESC');
    return qb.getMany();
  }

  /** Admin: add reply and/or update status (ANSWERED / CLOSED) */
  async update(queryId: string, dto: UpdateOrderQueryDto, user: RequestUser) {
    if (!this.isAdmin(user)) throw new ForbiddenException('Admin only');

    const q = await this.queryRepo.findOne({
      where: { id: queryId },
      relations: ['order', 'user'],
    });
    if (!q) throw new NotFoundException('Order query not found');

    if (dto.reply) {
      const reply: OrderQueryReply = {
        byUserId: user.id,
        message: dto.reply,
        at: new Date().toISOString(),
      };
      q.adminReplies = [...(q.adminReplies ?? []), reply];
      if (q.status === OrderQueryStatus.OPEN) q.status = OrderQueryStatus.ANSWERED;
    }
    if (dto.status) q.status = dto.status;

    return this.queryRepo.save(q);
  }

  /** Get one query by id (user: own only; admin: any) */
  async getById(queryId: string, user: RequestUser) {
    const q = await this.queryRepo.findOne({
      where: { id: queryId },
      relations: ['order', 'user'],
    });
    if (!q) throw new NotFoundException('Order query not found');
    if (!this.isAdmin(user) && q.user?.id !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    return q;
  }
}
