import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  createParamDecorator,
  ExecutionContext,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/materials.dto';
import { User } from 'src/user/entities/user.entity';

const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

@ApiTags('Materials')
@Controller('custom-builder/:cbId/materials')
export class MaterialsController {
  constructor(private readonly svc: MaterialsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new material for a custom builder' })
  @ApiResponse({
    status: 201,
    description: 'The material has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  create(
    @Param('cbId') cbId: string,
    @Body() dto: CreateMaterialDto,
    @CurrentUser() user: User,
  ) {
    return this.svc.create(cbId, dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List all materials for a custom builder' })
  @ApiResponse({
    status: 200,
    description: 'Materials successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'Custom builder not found.' })
  list(@Param('cbId') cbId: string) {
    return this.svc.list(cbId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a material' })
  @ApiResponse({
    status: 200,
    description: 'The material has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Invalid update data.' })
  @ApiResponse({ status: 404, description: 'Material not found.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMaterialDto,
    @CurrentUser() user: User,
  ) {
    return this.svc.update(id, dto, user);
  }

  @Post(':id/check')
  @ApiOperation({ summary: 'Mark material as checked' })
  @ApiResponse({
    status: 200,
    description: 'Material successfully marked as checked.',
  })
  @ApiResponse({ status: 404, description: 'Material not found.' })
  check(@Param('id') id: string, @Body('userId') userId: string) {
    return this.svc.check(id, { id: userId } as User);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get material by ID' })
  @ApiResponse({
    status: 200,
    description: 'The material has been successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'Material not found.' })
  getById(@Param('id') id: string) {
    return this.svc.getById(id);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a material' })
  @ApiResponse({
    status: 200,
    description: 'Material successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Material not found.' })
  delete(@Param('id') id: string) {
    return this.svc.delete(id);
  }
}
