import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMilestone } from './entities/payment-milestone.entity';

@Injectable()
export class InteriorSeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(PaymentMilestone)
    private readonly milestoneRepo: Repository<PaymentMilestone>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    // Legacy trade-template seeding removed.
    void this.milestoneRepo;
  }
}
