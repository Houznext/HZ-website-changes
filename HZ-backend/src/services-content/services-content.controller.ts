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

  @Patch(':id')
  @UseGuards(ControllerAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceContentDto,
  ) {
    return this.svc.update(id, dto);
  }

  @Post(':id/upload-card-image')
  @UseGuards(ControllerAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadCardImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const key = `services/${id}/card-${Date.now()}-${file.originalname
      .replace(/\s+/g, '-')
      .toLowerCase()}`;
    const signedUrl = await this.s3.generateUploadURL(key, file.mimetype);
    const response = await fetch(signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.mimetype },
      body: file.buffer,
    });
    if (!response.ok) {
      throw new BadRequestException('Failed to upload file');
    }
    const url = this.s3.generatePublicURL(key);
    return this.svc.uploadImage(id, 'cardImageUrl', url);
  }

  @Post(':id/upload-hero-image')
  @UseGuards(ControllerAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadHeroImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const key = `services/${id}/hero-${Date.now()}-${file.originalname
      .replace(/\s+/g, '-')
      .toLowerCase()}`;
    const signedUrl = await this.s3.generateUploadURL(key, file.mimetype);
    const response = await fetch(signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.mimetype },
      body: file.buffer,
    });
    if (!response.ok) {
      throw new BadRequestException('Failed to upload file');
    }
    const url = this.s3.generatePublicURL(key);
    return this.svc.uploadImage(id, 'heroImageUrl', url);
  }
}
