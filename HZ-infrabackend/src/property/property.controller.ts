import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PropertyService } from './property.service';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { SearchPropertyDto } from './dto/search-property.dto';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/jwt.strategy';
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard';

@ApiTags('properties')
@Controller('properties')
export class PropertyController {
  constructor(private readonly properties: PropertyService) {}

  @Get()
  list(@Query() q: FilterPropertyDto) {
    return this.properties.list(q, true);
  }

  @Get('search')
  search(@Query() dto: SearchPropertyDto) {
    return this.properties.searchPublic(dto.q, {
      hintType: dto.hintType,
      limit: dto.limit ?? 12,
      page: 1,
    });
  }

  @Get('by-slugs/list')
  bulkBySlugs(@Query('slugs') slugs?: string) {
    const list = (slugs ?? '')
      .split(',')
      .map((s) => decodeURIComponent(s.trim()))
      .filter(Boolean);
    return this.properties.findBySlugs(list);
  }

  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.properties.findBySlug(slug);
  }

  @Post()
  @UseGuards(OptionalJwtGuard)
  @ApiBearerAuth()
  create(@Body() dto: CreatePropertyDto, @Req() req: Request & { user?: JwtPayload }) {
    const user = req.user;
    if (user && (user.kind === 'customer' || user.kind === 'developer')) {
      return this.properties.create(dto, user);
    }
    return this.properties.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  patch(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.properties.update(id, dto, user);
  }
}
