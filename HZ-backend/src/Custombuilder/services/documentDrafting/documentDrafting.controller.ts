import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DocumentDraftingService } from './documentDrafting.service';
import {
  CreateDocumentDraftingDto,
  UpdateDocumentDraftingDto,
} from './dto/documentDrafting.dto';
import { DocumentDrafting } from './entities/documentDrafting.entity';
import { ControllerAuthGuard } from 'src/guard';

@ApiTags('Document Drafting')
@Controller('document-drafting')
export class DocumentDraftingController {
  constructor(
    private readonly documentDraftingService: DocumentDraftingService,
  ) {}
  @UseGuards(ControllerAuthGuard)
  @Post(':customBuilderId')
  @ApiOperation({ summary: 'Create a document drafting' })
  @ApiResponse({
    status: 201,
    description: 'Document drafting created successfully.',
    type: DocumentDrafting,
  })
  @ApiResponse({ status: 404, description: 'CBService not found.' })
  @ApiResponse({
    status: 400,
    description: 'Document drafting already exists for this service.',
  })
  async create(
    @Param('customBuilderId') customBuilderId: string,
    @Body() createDocumentDraftingDto: CreateDocumentDraftingDto,
  ): Promise<DocumentDrafting> {
    return this.documentDraftingService.create(
      customBuilderId,
      createDocumentDraftingDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all document draftings' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all document draftings.',
    type: [DocumentDrafting],
  })
  async findAll(): Promise<DocumentDrafting[]> {
    return this.documentDraftingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a document drafting by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the document drafting.',
    type: DocumentDrafting,
  })
  @ApiResponse({ status: 404, description: 'Document drafting not found.' })
  async findById(
    @Param('id') id: string,
  ): Promise<DocumentDrafting> {
    return this.documentDraftingService.findById(id);
  }
  @UseGuards(ControllerAuthGuard)
  @Put(':customBuilderId')
  @ApiOperation({ summary: 'Update a document drafting' })
  @ApiResponse({
    status: 200,
    description: 'Document drafting updated successfully.',
    type: DocumentDrafting,
  })
  @ApiResponse({
    status: 404,
    description: 'CBService or document drafting not found.',
  })
  async update(
    @Param('customBuilderId') customBuilderId: string,
    @Body() updateDocumentDraftingDto: UpdateDocumentDraftingDto,
  ): Promise<DocumentDrafting> {
    return this.documentDraftingService.update(
      customBuilderId,
      updateDocumentDraftingDto,
    );
  }
  @UseGuards(ControllerAuthGuard)
  @Delete(':customBuilderId')
  @ApiOperation({ summary: 'Delete a document drafting' })
  @ApiResponse({
    status: 200,
    description: 'Document drafting deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'CBService or document drafting not found.',
  })
  async delete(
    @Param('customBuilderId') customBuilderId: string,
  ): Promise<void> {
    return this.documentDraftingService.delete(customBuilderId);
  }
}
