import { Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/jwt.strategy';
import { PropertyService } from '../property/property.service';

@ApiTags('admin-properties')
@Controller('admin/properties')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminPropertiesController {
  constructor(private readonly properties: PropertyService) {}

  @Get()
  list() {
    return this.properties.adminList();
  }

  @Get('pending')
  pending() {
    return this.properties.pendingList();
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.properties.approve(id, user.sub);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.properties.reject(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.properties.adminDelete(id);
  }
}
