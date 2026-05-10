import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { NewsService } from './news.service';
import { CreateNewsDto, UpdateNewsDto } from './dto/news.dto';

@ApiTags('admin-news')
@Controller('admin/news')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminNewsController {
  constructor(private readonly news: NewsService) {}

  @Get()
  list() {
    return this.news.adminList();
  }

  @Post()
  create(@Body() dto: CreateNewsDto) {
    return this.news.create(dto);
  }

  @Patch(':id')
  patch(@Param('id') id: string, @Body() dto: UpdateNewsDto) {
    return this.news.update(id, dto);
  }
}
