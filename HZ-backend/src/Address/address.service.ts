import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { LocationDetails } from 'src/property/entities/location.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(LocationDetails)
    private addressRepository: Repository<LocationDetails>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async create(userId: string, createAddressDto: CreateAddressDto): Promise<LocationDetails> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (createAddressDto.isDefault) {
      await this.addressRepository.update(
        { user: { id: userId }, isDefault: true },
        { isDefault: false }
      );
    }

    const address = this.addressRepository.create({ ...createAddressDto, user });
    return this.addressRepository.save(address);
  }

  async findAllForUser(userId: string): Promise<LocationDetails[]> {
    return this.addressRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async findOne(userId: string, addressId: string): Promise<LocationDetails> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
      relations: ['user'],
    });

    if (!address) {
      throw new NotFoundException(
        `Address with ID ${addressId} for User ID ${userId} not found`,
      );
    }

    return address;
  }

  async update(
    userId: string,
    addressId: string,
    updateAddressDto: UpdateAddressDto,
  ): Promise<LocationDetails> {


    const address = await this.addressRepository.findOne({
      where: {
        id: addressId, user: { id: userId },
      }
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} for User ID ${userId} not found`);
    }
    const userWithAddresses = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['locations'],
    });
    const existingAddress = userWithAddresses.locations.find(
      (addr) =>
        addr.country === updateAddressDto.country &&
        addr.city === updateAddressDto.city &&
        addr.state === updateAddressDto.state &&
        addr.zipCode === updateAddressDto.zipCode &&
        addr.id !== addressId
    );
    if (existingAddress) {
      throw new ConflictException(`An address with the same details already exists for user ${userId}`);
    }
    if (updateAddressDto.isDefault) {
      console.log('Resetting existing default address...');
      await this.addressRepository.update(
        { user: { id: userId }, isDefault: true },
        { isDefault: false }
      );
    }
    

    Object.assign(address, updateAddressDto);

    console.log("addressss", address);

    return this.addressRepository.save(address);
  }

  async remove(userId: string, addressId: string): Promise<void> {
    const address = await this.addressRepository.findOne({
      where: {
        id: addressId,
        user: { id: userId },
      },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found for user ${userId}`);
    }
    if (address.isDefault) {
      const otherAddress = await this.addressRepository.findOne({
        where: {
          user: { id: userId },
          id: Not(addressId),
        },
      });

      if (otherAddress) {
        await this.addressRepository.update(otherAddress.id, { isDefault: true });
      }
    }
    await this.addressRepository.remove(address);
  }
}
