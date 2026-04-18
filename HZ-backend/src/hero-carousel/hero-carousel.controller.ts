import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { HeroCarouselService } from './hero-carousel.service';
import { CreateSlideDto } from './dto/create-slide.dto';
import { UpdateSlideDto } from './dto/update-slide.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ControllerAuthGuard } from '../guard';
import { S3Service } from '../common/s3/s3.service';

@Controller('hero-carousel')
export class HeroCarouselController {
  constructor(
    private readonly service: HeroCarouselService,
    private readonly s3: S3Service,
  ) {}

  @Get('public')
  getPublic() {
    return this.service.getPublicSlides();
  }

  @Get()
  @UseGuards(ControllerAuthGuard)
  getAll() {
    return this.service.getAllSlides();
  }

  @Get('settings')
  @UseGuards(ControllerAuthGuard)
  getSettings() {
    return this.service.getOrCreateSettings();
  }

  @Post()
  @UseGuards(ControllerAuthGuard)
  create(@Body() dto: CreateSlideDto) {
    return this.service.createSlide(dto);
  }

  @Post('upload')
  @UseGuards(ControllerAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 30 * 1024 * 1024 },
    }),
  )
  async uploadImage(@UploadedFile() file: any) {
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

    const key = `hero-carousel/${Date.now()}-${file.originalname
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

    return { url: this.s3.generatePublicURL(key) };
  }

  @Patch('settings')
  @UseGuards(ControllerAuthGuard)
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.service.updateSettings(dto);
  }

  @Patch('reorder')
  @UseGuards(ControllerAuthGuard)
  reorder(@Body() body: { orderedIds: number[] }) {
    return this.service.reorderSlides(body.orderedIds);
  }

  @Patch(':id')
  @UseGuards(ControllerAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSlideDto,
  ) {
    return this.service.updateSlide(id, dto);
  }

  @Delete(':id')
  @UseGuards(ControllerAuthGuard)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteSlide(id);
  }
}
