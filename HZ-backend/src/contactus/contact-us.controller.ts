import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseArrayPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ContactUsService } from './contact-us.service';
import { CreateContactUsDto, UpdateContactUsDto } from './dto/contact-us.dto';
import { ControllerAuthGuard } from 'src/guard';

import { ContactUs } from './entities/contact-us.entity';
@ApiTags('Contact Us')
@Controller('contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}
  @Post()
  @ApiOperation({ summary: 'Create a new contact form entry' })
  @ApiResponse({ status: 201, type: ContactUs })
  create(@Body() dto: CreateContactUsDto) {
    return this.contactUsService.create(dto);
  }
  @Get()
  @ApiOperation({ summary: 'Get all contact form entries' })
  @ApiResponse({ status: 200, type: [ContactUs] })
  findAll() {
    return this.contactUsService.findAll();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get contact form entry by ID' })
  @ApiResponse({ status: 200, type: ContactUs })
  findOne(@Param('id') id: string) {
    return this.contactUsService.findOne(id);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Update contact form entry' })
  @ApiResponse({ status: 200, type: ContactUs })
  update(@Param('id') id: string, @Body() dto: UpdateContactUsDto) {
    return this.contactUsService.update(id, dto);
  }
  @UseGuards(ControllerAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete contact form entry' })
  @ApiResponse({ status: 200, description: 'Contact deleted successfully' })
  remove(@Param('id') id: string) {
    return this.contactUsService.remove(id);
  }
  @UseGuards(ControllerAuthGuard)
  @UseGuards(ControllerAuthGuard)
  @Delete('bulk')
  @ApiOperation({ summary: 'Delete more leads' })
  @ApiResponse({
    status: 200,
    description: 'The service leads has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'service lead not found.' })
  @ApiQuery({
    name: 'ids',
    required: true,
    type: [Number],
    description: 'Ids of leads to delete',
  })
  async deleteMoreLeads(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: string[],
  ): Promise<void> {
    return this.contactUsService.deleteMoreLeads(ids);
  }
  @Get('by-user/:userId')
  @ApiOperation({
    summary: 'Find contacts by user, filtered by roles and optional date range',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date in YYYY-MM-DD format',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date in YYYY-MM-DD format',
  })
  @ApiResponse({ status: 200, type: [ContactUs] })
  async findContactsByUser(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ContactUs[]> {
    return this.contactUsService.findContactsByUser(
      userId,
      startDate,
      endDate,
    );
  }
  @Post(':contactId/assign')
  @ApiOperation({ summary: 'Assign a contact lead to a user' })
  @ApiResponse({ status: 200, description: 'Lead assigned successfully' })
  async assignLeadToUser(
    @Param('contactId') contactId: string,
    @Body() body: { assignedToId: string },
  ) {
    return this.contactUsService.assignLeadToUser(
      contactId,
      body.assignedToId,
    );
  }
  
}
