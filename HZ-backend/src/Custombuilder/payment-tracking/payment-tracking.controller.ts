import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { PaymentTrackingService } from './payment-tracking.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment-tracking.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Payment Tracking')
@Controller('payment-tracking')
export class PaymentTrackingController {
  constructor(private readonly service: PaymentTrackingService) { }

  @Post(':customBuilderId')
  @ApiOperation({ summary: 'Create a payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 404, description: 'Custom builder not found' })
  async create(
    @Param('customBuilderId') customBuilderId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.service.create(customBuilderId, dto);
  }

  @Get('custom-builder/:customBuilderId')
  @ApiOperation({ summary: 'Get all payments for a custom builder' })
  @ApiResponse({ status: 200, description: 'Returns an array of payments' })
  @ApiResponse({ status: 404, description: 'Custom builder not found' })
  async findAll(@Param('customBuilderId') customBuilderId: string) {
    return this.service.findAllByCustomBuilder(customBuilderId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment by ID' })
  @ApiResponse({ status: 200, description: 'Returns the payment' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a payment' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a payment' })
  @ApiResponse({ status: 200, description: 'Payment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
