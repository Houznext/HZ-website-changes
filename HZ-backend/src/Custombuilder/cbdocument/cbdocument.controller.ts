import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards,Patch,Delete } from '@nestjs/common';
import { ApiTags, ApiOperation,ApiResponse } from '@nestjs/swagger';
import { CbDocumentService } from './cddocument.service';
import { CreateCBDocumentDto, UpdateCBDocumentDto } from '../dto/cb-document.dto';
import { ControllerAuthGuard } from 'src/guard';

@ApiTags('cb-documents')

@Controller('custom-builder/:cbId/documents')
export class CbDocumentController {
  constructor(private readonly cbDocumentService: CbDocumentService) {}
  // @UseGuards(ControllerAuthGuard)

  @Post()
  @ApiOperation({ summary: 'Upload a document for a Custom Builder' })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async uploadDocument(
    @Param('cbId') cbId: string,
    @Body() createCBDocumentDto: CreateCBDocumentDto,
  ) {
    return this.cbDocumentService.uploadDocument(cbId, createCBDocumentDto);
  }

  @Get(':cbId')
  @ApiOperation({ summary: 'Get all documents for a Custom Builder' })
  async getDocuments(@Param('cbId') cbId: string) {
    return this.cbDocumentService.getDocuments(cbId);
  }
  
@Patch(':docId')
@ApiOperation({ summary: 'Update a document' })
async updateDocument(
  @Param('cbId') cbId: string,
  @Param('docId') docId: string,
  @Body() dto: UpdateCBDocumentDto,
) {
  return this.cbDocumentService.updateDocument(cbId, docId, dto);
}

@Delete(':docId')
@ApiOperation({ summary: 'Delete a document' })
async deleteDocument(
  @Param('cbId') cbId: string,
  @Param('docId') docId: string,
) {
  return this.cbDocumentService.deleteDocument(cbId, docId);
}

}