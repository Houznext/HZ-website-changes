import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentTracking } from './entities/payment-tracking.entity';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment-tracking.dto';
import { CustomBuilder } from '../entities/custom-builder.entity';

@Injectable()
export class PaymentTrackingService {
  constructor(
    @InjectRepository(PaymentTracking)
    private readonly paymentRepo: Repository<PaymentTracking>,

    @InjectRepository(CustomBuilder)
    private readonly cbRepo: Repository<CustomBuilder>,
  ) {}

  async create(
    customBuilderId: string,
    dto: CreatePaymentDto,
  ): Promise<PaymentTracking> {
    const cb = await this.cbRepo.findOne({ where: { id: customBuilderId } });
    if (!cb) throw new NotFoundException('Custom Builder not found');

    const payment = this.paymentRepo.create({
      ...dto,
      customBuilderId,
    });
    return this.paymentRepo.save(payment);
  }

  async findAllByCustomBuilder(customBuilderId: string) {
    const payments = await this.paymentRepo.find({
      where: { customBuilderId },
      order: { createdAt: 'DESC' },
    });

    const totalAmount = payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const paidAmount = payments
      .filter((p) => p.status === 'Completed')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const pendingAmount = totalAmount - paidAmount;
    const overduePayments = payments.filter(
      (p) => p.status === 'Overdue' || (p.status === 'Pending' && p.dueDate && new Date(p.dueDate) < new Date()),
    );

    return {
      payments,
      summary: {
        totalAmount,
        paidAmount,
        pendingAmount,
        overdueCount: overduePayments.length,
        totalPayments: payments.length,
      },
    };
  }

  async findOne(id: string): Promise<PaymentTracking> {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async update(id: string, dto: UpdatePaymentDto): Promise<PaymentTracking> {
    const payment = await this.findOne(id);
    Object.assign(payment, dto);
    return this.paymentRepo.save(payment);
  }

  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepo.remove(payment);
  }
}
