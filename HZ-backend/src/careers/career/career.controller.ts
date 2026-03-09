import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ApplyCareerDto } from '../dto/applyCareer.dto';
import { CareerService } from './career.service';
import { ControllerAuthGuard } from 'src/guard';

@ApiTags('Careers') // Group the controller under the "Careers" tag in Swagger UI
@Controller('careers')
export class CareerController {
  constructor(private readonly careerService: CareerService) {}

  @ApiOperation({ summary: 'Retrieve all career opportunities' }) // Description for the endpoint
  @Get()
  findAll() {
    return this.careerService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve a specific career by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'The ID of the career' }) // Document the `id` parameter
  @Get('/:id')
  findOne(@Param('id') id: number) {
    return this.careerService.findOne(id);
  }
  @UseGuards(ControllerAuthGuard)
  @ApiOperation({ summary: 'Apply for a specific career' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the career to apply for',
  })
  @ApiBody({ description: 'Details of the application', type: ApplyCareerDto }) // Document the request body
  @Post('/:id/apply')
  applyForCareer(
    @Param('id') id: number,
    @Body() applyCareerDto: ApplyCareerDto,
  ) {
    return this.careerService.apply(id, applyCareerDto);
  }

  @ApiOperation({ summary: 'Get all applications for a user by email' })
  @ApiQuery({
    name: 'email',
    type: String,
    description: 'Email of the user',
    required: true,
  }) // Document the query parameter
  @Get('/my-applications')
  async getMyApplications(@Query('email') email: string) {
    if (!email) {
      throw new Error('Email is required');
    }
    return this.careerService.getApplicationsByUser(email);
  }
}
