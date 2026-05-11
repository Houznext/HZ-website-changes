import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfraCustomer } from './entities/infra-customer.entity';
import { RegisterCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { OtpService } from '../otp/otp.service';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(InfraCustomer)
    private readonly repo: Repository<InfraCustomer>,
    private readonly otpService: OtpService,
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

  async requestPhoneOtp(customerId: string, phone: string): Promise<{ message: string }> {
    const me = await this.repo.findOne({ where: { customerId } });
    if (!me) throw new NotFoundException('Customer not found');
    const owner = await this.repo.findOne({ where: { phone } });
    if (owner && owner.customerId !== customerId) {
      throw new ConflictException('This phone number is already linked to another account');
    }
    await this.otpService.send({ phone });
    return { message: 'OTP sent to your phone' };
  }

  async verifyPhoneOtp(
    customerId: string,
    phone: string,
    otp: string,
  ): Promise<InfraCustomer> {
    const me = await this.repo.findOne({ where: { customerId } });
    if (!me) throw new NotFoundException('Customer not found');
    const owner = await this.repo.findOne({ where: { phone } });
    if (owner && owner.customerId !== customerId) {
      throw new ConflictException('This phone number is already linked to another account');
    }
    await this.otpService.consumePhoneOtpIfValid(phone, otp);
    me.phone = phone;
    me.isVerified = true;
    return this.repo.save(me);
  }
}
