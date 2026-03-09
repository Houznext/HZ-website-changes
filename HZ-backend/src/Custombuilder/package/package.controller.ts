import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PackageService } from './package.service';
import { CreatePackageDto, UpdatePackageDto } from './dto/package.dto';
import { ControllerAuthGuard } from 'src/guard';
import { ConstructionScope } from 'src/Custombuilder/custom-property/enum/custom-property.enum';

@ApiTags('Packages')
@Controller('packages')
export class PackageController {
  constructor(private readonly servicePackage: PackageService) {}

  // @UseGuards(ControllerAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a package (scoped to a branch)' })
  create(@Body() dto: CreatePackageDto) {
    return this.servicePackage.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all packages' })
  findAll() {
    return this.servicePackage.findAll();
  }

  @Get('branch/:branchId')
  @ApiOperation({ summary: 'Get packages by branch' })
  findByBranch(@Param('branchId') branchId: string) {
    return this.servicePackage.findByBranch(branchId);
  }

  @Get('branch/:branchId/scope/:scope')
  @ApiOperation({ summary: 'Get packages by branch and construction scope' })
  findByBranchAndScope(
    @Param('branchId') branchId: string,
    @Param('scope') scope: ConstructionScope,
  ) {
    return this.servicePackage.findByBranchAndScope(branchId, scope);
  }

  @UseGuards(ControllerAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a package by ID' })
  update(@Param('id') id: string, @Body() dto: UpdatePackageDto) {
    return this.servicePackage.update(id, dto);
  }

  @UseGuards(ControllerAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a package by ID' })
  delete(@Param('id') id: string) {
    return this.servicePackage.delete(id);
  }
}
