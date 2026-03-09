import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SolarInstallationDetail } from './entities/solar-installation-detail.entity';
import { Order } from 'src/orders/entities/order.entity';
import { OrderItemType, OrderStatusEnum } from 'src/orders/enum/order.enum';

@Injectable()
export class SolarOrdersService {
    private readonly logger = new Logger(SolarOrdersService.name);

    constructor(
        @InjectRepository(SolarInstallationDetail)
        private readonly solarDetailRepo: Repository<SolarInstallationDetail>,
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async createFromOrder(order: Order): Promise<SolarInstallationDetail | null> {
        const solarItem = order.items?.find(
            (item) => item.productType === OrderItemType.SOLAR_PACKAGE,
        );

        if (!solarItem) {
            this.logger.warn(
                `No SOLAR_PACKAGE item found in order ${order.id}. Skipping solar detail creation.`,
            );
            return null;
        }

        const meta = solarItem.meta ?? {};

        const detail = this.solarDetailRepo.create({
            order,
            orderId: order.id,
            solarType: (meta.solarType as string) ?? 'residential',
            category: (meta.category as string) ?? 'rooftop',
            monthlyBill: String(meta.monthlyBill ?? 0),
            recommendedSystemSize: String(meta.systemSize ?? 0),
            annualGeneration: String(meta.annualGeneration ?? 0),
            spaceRequired: String(meta.spaceRequired ?? 0),
            systemCost: String(meta.estimatedCost ?? 0),
            subsidy: String(meta.subsidy ?? 0),
            effectiveCost: String(meta.effectiveCost ?? 0),
            estimatedAnnualSavings: String(meta.estimatedAnnualSavings ?? 0),
            emiOptions: (meta.emiOptions as any[]) ?? [],
            preferredDate: (meta.preferredDate as string) ?? undefined,
            contactName: (meta.contactName as string) ?? undefined,
            contactPhone: (meta.contactPhone as string) ?? undefined,
        });

        const saved = await this.solarDetailRepo.save(detail);
        this.logger.log(
            `Created SolarInstallationDetail ${saved.id} for order ${order.id}`,
        );
        return saved;
    }

    async findByOrderId(orderId: string): Promise<SolarInstallationDetail | null> {
        return this.solarDetailRepo.findOne({ where: { orderId }, relations: ['assignedAgent'] });
    }

    async findAll(params: {
        branchId?: string;
        status?: string;
        page?: number;
        limit?: number;
    }) {
        const { branchId, status, page = 1, limit = 20 } = params;

        const qb = this.solarDetailRepo
            .createQueryBuilder('sd')
            .leftJoinAndSelect('sd.order', 'order')
            .leftJoinAndSelect('order.user', 'customer')
            .leftJoinAndSelect('order.branch', 'branch')
            .leftJoinAndSelect('sd.assignedAgent', 'agent')
            .orderBy('sd.createdAt', 'DESC');

        if (branchId) {
            qb.andWhere('order.branchId = :branchId', { branchId });
        }
        if (status) {
            qb.andWhere('order.status = :status', { status });
        }

        const [items, total] = await qb
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async findOne(id: string) {
        const detail = await this.solarDetailRepo.findOne({
            where: { id },
            relations: ['order', 'order.user', 'order.branch', 'order.items', 'assignedAgent'],
        });
        if (!detail) throw new NotFoundException('Solar installation detail not found');
        return detail;
    }

    async assignAgent(solarDetailId: string, agentUserId: string, assignedByUserId: string) {
        const detail = await this.solarDetailRepo.findOne({
            where: { id: solarDetailId },
            relations: ['order', 'order.user', 'order.branch'],
        });
        if (!detail) throw new NotFoundException('Solar detail not found');

        detail.assignedAgentId = agentUserId;
        detail.assignedAt = new Date();
        await this.solarDetailRepo.save(detail);

        const order = detail.order;
        if (order && (order.status === OrderStatusEnum.CONFIRMED || order.status === OrderStatusEnum.CREATED)) {
            const oldStatus = order.status;
            order.status = OrderStatusEnum.ASSIGNED;
            order.statusHistory = [
                ...(order.statusHistory ?? []),
                { status: OrderStatusEnum.ASSIGNED, at: new Date().toISOString(), by: assignedByUserId, note: `Agent ${agentUserId} assigned` },
            ];
            await this.orderRepo.save(order);

            this.eventEmitter.emit('order.statusChanged', {
                orderId: order.id,
                orderNo: order.orderNo,
                orderType: order.type,
                userId: order.user?.id,
                newStatus: OrderStatusEnum.ASSIGNED,
                oldStatus,
                branchId: order.branch?.id,
                updatedBy: assignedByUserId,
                customerEmail: order.user?.email,
                customerPhone: order.user?.phone,
                timestamp: new Date().toISOString(),
            });
        }

        return this.findOne(solarDetailId);
    }

    async updateNotes(solarDetailId: string, notes: string) {
        const detail = await this.solarDetailRepo.findOne({ where: { id: solarDetailId } });
        if (!detail) throw new NotFoundException('Solar detail not found');

        detail.notes = notes;
        await this.solarDetailRepo.save(detail);
        return this.findOne(solarDetailId);
    }

    async getDashboardStats(branchId?: string) {
        const qb = this.solarDetailRepo
            .createQueryBuilder('sd')
            .leftJoin('sd.order', 'order');

        if (branchId) {
            qb.andWhere('order.branchId = :branchId', { branchId });
        }

        const totalInstalls = await qb.getCount();

        const statusCounts = await this.solarDetailRepo
            .createQueryBuilder('sd')
            .leftJoin('sd.order', 'order')
            .select('order.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .where(branchId ? 'order.branchId = :branchId' : '1=1', { branchId })
            .groupBy('order.status')
            .getRawMany();

        const revenueResult = await this.solarDetailRepo
            .createQueryBuilder('sd')
            .leftJoin('sd.order', 'order')
            .select('COALESCE(SUM(CAST(sd.effectiveCost AS NUMERIC)), 0)', 'totalRevenue')
            .where(branchId ? 'order.branchId = :branchId' : '1=1', { branchId })
            .getRawOne();

        const counts: Record<string, number> = {};
        for (const row of statusCounts) {
            counts[row.status] = parseInt(row.count, 10);
        }

        return {
            totalInstalls,
            pending: (counts['CREATED'] ?? 0) + (counts['CONFIRMED'] ?? 0),
            assigned: counts['ASSIGNED'] ?? 0,
            inProgress: counts['IN_PROGRESS'] ?? 0,
            completed: counts['COMPLETED'] ?? 0,
            cancelled: counts['CANCELLED'] ?? 0,
            totalRevenue: parseFloat(revenueResult?.totalRevenue ?? '0'),
        };
    }
}
