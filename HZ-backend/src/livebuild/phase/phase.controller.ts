import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseIntPipe,
  ParseArrayPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { PhaseService } from './phase.service';
import {
  AutoGeneratePhasesDto,
  CreatePhaseDto,
  UpdatePhaseDto,
} from './dto/phase.dto';

@ApiTags('Phases')
@Controller('phases')
export class PhaseController {
  constructor(private service: PhaseService) { }

  @Get(':cbId')
  @ApiOperation({ summary: 'List phases for a CustomBuilder' })
  @ApiParam({ name: 'cbId', type: String })
  list(@Param('cbId') cbId: string) {
    return this.service.list(cbId);
  }

  @Post(':cbId')
  @ApiOperation({ summary: 'Replace all phases for a project (bulk)' })
  @ApiParam({ name: 'cbId', type: String })
  @ApiCreatedResponse({
    description: 'Phases replaced successfully',
    type: CreatePhaseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  bulkReplace(@Param('cbId') cbId: string, @Body() raw: any) {
    const body: any[] = Array.isArray(raw) ? raw : Object.values(raw ?? {});

    if (!Array.isArray(body) || body.length === 0) {
      throw new BadRequestException('Body must be a non-empty array of phases');
    }

    const items = body.map((item) => plainToInstance(CreatePhaseDto, item));
    const errors = items.flatMap((it) =>
      validateSync(it, { whitelist: true, forbidNonWhitelisted: false }),
    );
    if (errors.length) {
      throw new BadRequestException(errors);
    }

    return this.service.bulkReplace(cbId, items);
  }
  @Post(':cbId/auto-generate')
  @ApiOperation({ summary: 'Auto-generate phases from service estimates' })
  @ApiParam({ name: 'cbId', type: String })
  autoGenerate(
    @Param('cbId') cbId: string,
    @Body() body: AutoGeneratePhasesDto,
  ) {
    return this.service.autoGenerate(cbId, body);
  }

  @Patch(':cbId/:phaseId')
  @ApiOperation({ summary: 'Update a single phase' })
  @ApiParam({ name: 'cbId', type: Number })
  @ApiParam({ name: 'phaseId', type: Number })
  @ApiOkResponse({ description: 'Phase updated', type: CreatePhaseDto })
  update(
    @Param('cbId') cbId: number,
    @Param('phaseId') phaseId: number,
    @Body() body: UpdatePhaseDto,
  ) {
    return this.service.update(+phaseId, body);
  }

  @Delete(':cbId/:phaseId')
  @ApiOperation({ summary: 'Delete a phase' })
  @ApiParam({ name: 'cbId', type: String })
  @ApiParam({ name: 'phaseId', type: Number })
  @ApiOkResponse({ description: 'Phase deleted' })
  remove(@Param('cbId') cbId: string, @Param('phaseId') phaseId: string) {
    return this.service.remove(+phaseId);
  }

  @Post(':cbId/recompute')
  @ApiOperation({
    summary: 'Recompute actualDays/actualCost from logs for all phases',
  })
  @ApiParam({ name: 'cbId', type: String })
  @ApiOkResponse({
    description: 'Recomputed successfully',
    type: CreatePhaseDto,
    isArray: true,
  })
  recompute(@Param('cbId') cbId: string) {
    return this.service.recompute(cbId);
  }
}
