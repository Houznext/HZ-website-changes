import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '../entities/company.entity';
import { AddressDto } from '../dto/company-onboarding.dto';
import { LocationDetails } from 'src/property/entities/location.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(LocationDetails)
    private readonly addressRepository: Repository<LocationDetails>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async addAddressToCompany(
    companyId: string,
    addressDto: AddressDto,
  ): Promise<LocationDetails> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    const address = this.addressRepository.create({ ...addressDto, company });
    return this.addressRepository.save(address);
  }

  async getAddressesOfCompany(companyId: string): Promise<LocationDetails[]> {
    return this.addressRepository.find({
      where: { company: { id: companyId } },
    });
  }

  async updateAddress(
    companyId: string,
    addressId: string,
    addressDto: Partial<AddressDto>,
  ): Promise<LocationDetails> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, company: { id: companyId } },
    });

    if (!address) {
      throw new NotFoundException(`Address not found`);
    }

    Object.assign(address, addressDto);
    return this.addressRepository.save(address);
  }

  async deleteAddress(companyId: string, addressId: string): Promise<void> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, company: { id: companyId } },
    });

    if (!address) {
      throw new NotFoundException(`Address not found`);
    }

    await this.addressRepository.remove(address);
  }
}
