import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ServicesContentService } from './services-content.service';
import { UpdateServiceContentDto } from './dto/update-service-content.dto';
import { ControllerAuthGuard } from '../guard';
import { S3Service } from '../common/s3/s3.service';

@Controller('services-content')
export class ServicesContentController {
  constructor(
    private readonly svc: ServicesContentService,
    private readonly s3: S3Service,
  ) {}

  @Get('public')
  findPublic() {
    return this.svc.findPublic();
  }

  @Get('public/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.svc.findPublicBySlug(slug);
  }

  @Get()
  @UseGuards(ControllerAuthGuard)
  findAll() {
    return this.svc.findAll();
  }

  /** Static path segment before :id avoids Express/Nest route matching issues with `:id/...` POST paths. */
  @Post('upload/card/:id')
  @UseGuards(ControllerAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 30 * 1024 * 1024 },
    }),
  )
  async uploadCardImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const buffer: Buffer = file.buffer;
    if (!buffer || !buffer.length) {
      throw new BadRequestException(
        'Empty file upload — try a smaller image or a different format',
      );
    }
    const mime = file.mimetype || 'application/octet-stream';
    const key = `services/${id}/card-${Date.now()}-${file.originalname
      .replace(/\s+/g, '-')
      .toLowerCase()}`;
    const signedUrl = await this.s3.generateUploadURL(
      key,
      mime,
      buffer.length,
    );
    const response = await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': mime,
        'Content-Length': String(buffer.length),
      },
      body: buffer,
    });
    if (!response.ok) {
      throw new BadRequestException('Failed to upload file');
    }
    const url = this.s3.generatePublicURL(key);
    return this.svc.uploadImage(id, 'cardImageUrl', url);
  }

  @Post('upload/hero/:id')
  @UseGuards(ControllerAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 30 * 1024 * 1024 },
    }),
  )
  async uploadHeroImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const buffer: Buffer = file.buffer;
    if (!buffer || !buffer.length) {
      throw new BadRequestException(
        'Empty file upload — try a smaller image or a different format',
      );
    }
    const mime = file.mimetype || 'application/octet-stream';
    const key = `services/${id}/hero-${Date.now()}-${file.originalname
      .replace(/\s+/g, '-')
      .toLowerCase()}`;
    const signedUrl = await this.s3.generateUploadURL(
      key,
      mime,
      buffer.length,
    );
    const response = await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': mime,
        'Content-Length': String(buffer.length),
      },
      body: buffer,
    });
    if (!response.ok) {
      throw new BadRequestException('Failed to upload file');
    }
    const url = this.s3.generatePublicURL(key);
    return this.svc.uploadImage(id, 'heroImageUrl', url);
  }

  @Patch(':id')
  @UseGuards(ControllerAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceContentDto,
  ) {
    return this.svc.update(id, dto);
  }
}
