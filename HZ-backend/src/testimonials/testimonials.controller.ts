import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Testimonials } from './entity/testimonials.entity';
import { ControllerAuthGuard } from 'src/guard';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
} from './dto/testimonials.dto';
import { TestimonialService } from './testimonial.service';

@ApiTags('Testimonials')
@Controller('testimonials')
export class TestimonialController {
  constructor(private readonly testimonialService: TestimonialService) {}
  @UseGuards(ControllerAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new testimonial' })
  @ApiResponse({
    status: 201,
    description: 'The testimonial has been successfully created.',
  })
  async create(
    @Body() createTestimonialDto: CreateTestimonialDto,
  ): Promise<Testimonials> {
    return this.testimonialService.create(createTestimonialDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all testimonials' })
  @ApiResponse({ status: 200, description: 'Return all testimonials.' })
  async findAll(): Promise<Testimonials[]> {
    return this.testimonialService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a testimonial by ID' })
  @ApiResponse({ status: 200, description: 'Return the testimonial.' })
  @ApiResponse({ status: 404, description: 'Testimonial not found.' })
  async findOne(@Param('id') id: number): Promise<Testimonials> {
    return this.testimonialService.findOne(id);
  }
  @UseGuards(ControllerAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a testimonial' })
  @ApiResponse({
    status: 200,
    description: 'The testimonial has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Testimonial not found.' })
  async update(
    @Param('id') id: number,
    @Body() updateTestimonialDto: UpdateTestimonialDto,
  ): Promise<Testimonials> {
    return this.testimonialService.update(id, updateTestimonialDto);
  }
  // @UseGuards(ControllerAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a testimonial' })
  @ApiResponse({
    status: 200,
    description: 'The testimonial has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Testimonial not found.' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.testimonialService.remove(id);
  }
}
