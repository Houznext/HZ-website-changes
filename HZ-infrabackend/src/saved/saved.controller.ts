import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { SavedService } from './saved.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CustomerGuard } from '../common/guards/customer.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/jwt.strategy';

class SaveBody {
  @IsUUID()
  propertyId: string;
}

@ApiTags('saved')
@Controller('saved')
export class SavedController {
  constructor(private readonly saved: SavedService) {}

  @Post()
  @UseGuards(JwtAuthGuard, CustomerGuard)
  @ApiBearerAuth()
  create(@CurrentUser() user: JwtPayload, @Body() body: SaveBody) {
    return this.saved.save(user.sub, body.propertyId);
  }

  @Delete(':propertyId')
  @UseGuards(JwtAuthGuard, CustomerGuard)
  @ApiBearerAuth()
  remove(@CurrentUser() user: JwtPayload, @Param('propertyId') propertyId: string) {
    return this.saved.unsave(user.sub, propertyId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, CustomerGuard)
  @ApiBearerAuth()
  mine(@CurrentUser() user: JwtPayload) {
    return this.saved.mine(user.sub);
  }
}
