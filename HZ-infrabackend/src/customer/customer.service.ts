import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfraCustomer } from './entities/infra-customer.entity';
import { RegisterCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(InfraCustomer)
    private readonly repo: Repository<InfraCustomer>,
  ) {}

  async register(customerId: string, dto: RegisterCustomerDto): Promise<InfraCustomer> {
    const c = await this.repo.findOne({ where: { customerId } });
    if (!c) throw new NotFoundException('Customer not found');
    if (dto.name) c.name = dto.name;
    return this.repo.save(c);
  }

  async me(customerId: string): Promise<InfraCustomer> {
    const c = await this.repo.findOne({ where: { customerId } });
    if (!c) throw new NotFoundException('Customer not found');
    return c;
  }

  async updateMe(customerId: string, dto: UpdateCustomerDto): Promise<InfraCustomer> {
    const c = await this.repo.findOne({ where: { customerId } });
    if (!c) throw new NotFoundException('Customer not found');
    if (dto.name !== undefined) c.name = dto.name;
    if (dto.email !== undefined) c.email = dto.email;
    return this.repo.save(c);
  }
}
