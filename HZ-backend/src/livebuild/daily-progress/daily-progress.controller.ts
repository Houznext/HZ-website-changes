import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DailyProgressService } from './daily-progress.service';
import {
  CreateDailyProgressDto,
  UpdateDailyProgressDto,
} from './dto/daily-progress.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ControllerAuthGuard } from 'src/guard';


@ApiTags('daily-progress')
@Controller('daily-progress')
export class DailyProgressController {
  constructor(private readonly dailyProgressService: DailyProgressService) {}
  // @UseGuards(ControllerAuthGuard)
  @Post(':customBuilderId')
  @ApiOperation({ summary: 'Create daily progress' })
  @ApiResponse({
    status: 201,
    description: 'Daily progress created successfully.',
  })
  async create(
    @Body() createDailyProgressDto: CreateDailyProgressDto,
    @Param('customBuilderId') customBuilderId: string,
  ) {
    return await this.dailyProgressService.create(
      customBuilderId,
      createDailyProgressDto,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find daily progress by ID' })
  @ApiResponse({
    status: 200,
    description: 'Daily progress found successfully.',
  })
  async findById(@Param('id') id: string) {
    return await this.dailyProgressService.findById(id);
  }

  @Get('custom-builder/:customBuilderId')
  @ApiOperation({ summary: 'Find daily progress by custom builder ID' })
  @ApiResponse({
    status: 200,
    description: 'Daily progress found successfully.',
  })
  async findAllByCustomBuilderId(
    @Param('customBuilderId') customBuilderId: string,
  ) {
    return await this.dailyProgressService.findAllByCustomBuilderId(
      customBuilderId,
    );
  }

  @Get('custom-builder/:customBuilderId/day/:day')
  @ApiOperation({ summary: 'Find daily progress by custom builder ID and day' })
  @ApiResponse({
    status: 200,
    description: 'Daily progress found successfully.',
  })
  async findByDay(
    @Param('customBuilderId') customBuilderId: string,
    @Param('day') day: number,
  ) {
    return await this.dailyProgressService.findByDay(customBuilderId, day);
  }
  // @UseGuards(ControllerAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update daily progress' })
  @ApiResponse({
    status: 200,
    description: 'Daily progress updated successfully.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDailyProgressDto: UpdateDailyProgressDto,
  ) {
    return await this.dailyProgressService.update(id, updateDailyProgressDto);
  }
  // @UseGuards(ControllerAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete daily progress' })
  @ApiResponse({
    status: 200,
    description: 'Daily progress deleted successfully.',
  })
  async delete(@Param('id') id: string) {
    return await this.dailyProgressService.delete(id);
  }
}
