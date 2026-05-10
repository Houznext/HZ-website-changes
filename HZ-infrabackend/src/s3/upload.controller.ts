import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { S3Service } from './s3.service';

@ApiTags('upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly s3: S3Service) {}

  @Post('property-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  async propertyImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) return { url: null };
    const { url } = await this.s3.uploadBuffer('infra/property', file.buffer, file.mimetype || 'image/jpeg');
    return { url };
  }

  @Post('rera-doc')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  async reraDoc(@UploadedFile() file: Express.Multer.File) {
    if (!file) return { url: null };
    const { url } = await this.s3.uploadBuffer(
      'infra/rera',
      file.buffer,
      file.mimetype || 'application/pdf',
    );
    return { url };
  }
}
