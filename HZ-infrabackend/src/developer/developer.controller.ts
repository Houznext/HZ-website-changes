import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DeveloperService } from './developer.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DeveloperGuard } from '../common/guards/developer.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/jwt.strategy';
import { CreatePropertyDto } from '../property/dto/create-property.dto';
import { UpdatePropertyDto } from '../property/dto/update-property.dto';

@ApiTags('developers')
@Controller('developers/me')
@UseGuards(JwtAuthGuard, DeveloperGuard)
@ApiBearerAuth()
export class DeveloperController {
  constructor(private readonly dev: DeveloperService) {}

  @Get('listings')
  listings(@CurrentUser() user: JwtPayload) {
    return this.dev.myListings(user.sub);
  }

  @Post('listings')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePropertyDto) {
    return this.dev.createListing(user.sub, dto);
  }

  @Patch('listings/:id')
  patch(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    return this.dev.updateListing(user.sub, id, dto);
  }

  @Get('enquiries')
  enquiries(@CurrentUser() user: JwtPayload) {
    return this.dev.myEnquiries(user.sub);
  }

  @Get('stats')
  stats(@CurrentUser() user: JwtPayload) {
    return this.dev.stats(user.sub);
  }
}
