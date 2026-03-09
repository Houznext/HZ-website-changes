import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch, UseGuards
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { LocationDetails } from 'src/property/entities/location.entity';
import { ControllerAuthGuard, } from 'src/guard';


@ApiTags('Addresses')
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  // Create a new address for a specific user
  @UseGuards(ControllerAuthGuard)
  @Post(':userId')
  @ApiOperation({ summary: 'Create a new address for a specific user' })
  @ApiResponse({
    status: 201,
    description: 'The address has been successfully created.',
    type: LocationDetails,
  })
  async create(
    @Param('userId') userId: string,
    @Body() createAddressDto: CreateAddressDto,
  ): Promise<LocationDetails> {
    return this.addressService.create(userId, createAddressDto);
  }

  // Get all addresses for a specific user
  @Get(':userId')
  @ApiOperation({ summary: 'Get all addresses for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'List of all addresses for the user',
    type: [LocationDetails],
  })
  async findAllForUser(
    @Param('userId') userId: string,
  ): Promise<LocationDetails[]> {
    return this.addressService.findAllForUser(userId);
  }

  // Get a specific address for a user by address ID
  @Get(':userId/:addressId')
  @ApiOperation({ summary: 'Get a specific address for a user by address ID' })
  @ApiResponse({
    status: 200,
    description: 'The found address',
    type: LocationDetails,
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  async findOne(
    @Param('userId') userId: string,
    @Param('addressId') addressId: string,
  ): Promise<LocationDetails> {
    return this.addressService.findOne(userId, addressId);
  }

  // Update a user's address by address ID
  @Patch(':userId/:addressId')
  @ApiOperation({
    summary: 'Update an address for a specific user by address ID',
  })
  @ApiResponse({
    status: 200,
    description: 'The updated address',
    type: LocationDetails,
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found for the specified user',
  })
  async update(
    @Param('userId') userId: string,
    @Param('addressId') addressId: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ): Promise<LocationDetails> {
    return this.addressService.update(userId, addressId, updateAddressDto);
  }

  //delete a user's address by address ID
  @UseGuards(ControllerAuthGuard)

  @Delete(':userId/:addressId')
  @ApiOperation({
    summary: 'Delete an address for a specific user by address ID',
  })
  @ApiResponse({
    status: 200,
    description: 'The address has been deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  async remove(
    @Param('userId') userId: string,
    @Param('addressId') addressId: string,
  ): Promise<void> {
    return this.addressService.remove(userId, addressId);
  }
}
