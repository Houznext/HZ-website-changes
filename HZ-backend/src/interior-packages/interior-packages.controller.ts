import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InteriorPackagesService } from './interior-packages.service';
import {
  CreateInteriorPackageDto,
  UpdateInteriorPackageDto,
} from './dto/interior-package.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';

@Controller('interior-packages')
export class InteriorPackagesController {
  constructor(private readonly svc: InteriorPackagesService) {}

  @Get()
  findAll(@Query('activeOnly') activeOnly?: string) {
    return this.svc.findAll(activeOnly === 'true');
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateInteriorPackageDto) {
    return this.svc.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInteriorPackageDto) {
    return this.svc.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
