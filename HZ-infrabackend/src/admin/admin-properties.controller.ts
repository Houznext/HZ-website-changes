import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/jwt.strategy';
import { PropertyService } from '../property/property.service';
import { CreatePropertyDto } from '../property/dto/create-property.dto';
import { UpdatePropertyDto } from '../property/dto/update-property.dto';
import { FilterPropertyDto } from '../property/dto/filter-property.dto';

@ApiTags('admin-properties')
@Controller('admin/properties')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminPropertiesController {
  constructor(private readonly properties: PropertyService) {}

  @Get('pending')
  pending() {
    return this.properties.pendingList();
  }

  @Get()
  list(@Query() q: FilterPropertyDto) {
    return this.properties.adminList(q);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.properties.findByIdForAdmin(id);
  }

  @Post()
  create(@Body() dto: CreatePropertyDto, @CurrentUser() user: JwtPayload) {
    return this.properties.adminCreate(dto, user.sub);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.properties.approve(id, user.sub);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.properties.reject(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePropertyDto, @CurrentUser() user: JwtPayload) {
    return this.properties.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.properties.adminDelete(id);
  }
}
