import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { S3Service } from './s3.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GenerateUploadUrlDto } from './dto/s3.dto';
import { ControllerAuthGuard } from '../../guard';

@Controller('s3bucket')
@ApiTags('s3bucket')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) { }

  @Post('upload')
  @UseGuards(ControllerAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 35 * 1024 * 1024 },
    }),
  )
  @ApiOperation({
    summary:
      'Upload file through API to S3 (avoids CORS on direct browser → S3 uploads)',
  })
  @ApiResponse({ status: 201, description: 'File stored; returns publicUrl.' })
  async uploadThroughApi(
    @UploadedFile() file: { buffer?: Buffer; mimetype?: string; size?: number },
    @Body('fileName') fileName: string,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('File is required');
    }
    const key = this.s3Service.normalizeObjectKey(fileName);
    return this.s3Service.uploadObject(
      key,
      file.buffer,
      file.mimetype || 'application/octet-stream',
    );
  }

  @Post('generate-upload-url')
  @ApiOperation({ summary: 'Generate S3 Signed Upload URL' })
  @ApiResponse({
    status: 200,
    description: 'Signed URL generated successfully.',
  })
  async getUploadURL(@Body() body: GenerateUploadUrlDto) {
    const url = await this.s3Service.generateUploadURL(
      body.fileName,
      body.fileType,
    );
    return { uploadURL: url };
  }

  @Get('signed-read-url')
  @ApiOperation({ summary: 'Generate a signed read URL for an S3 object' })
  @ApiResponse({ status: 200, description: 'Signed read URL generated.' })
  async getSignedReadURL(
    @Query('fileUrl') fileUrl: string,
    @Query('expiresIn') expiresIn?: string,
  ) {
    const ttl = expiresIn ? parseInt(expiresIn, 10) : 3600;
    const signedUrl = await this.s3Service.generateSignedReadURL(fileUrl, ttl);
    return { signedUrl };
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Delete File from S3 Bucket' })
  @ApiResponse({ status: 200, description: 'File deleted successfully.' })
  async deleteFile(@Query('fileName') fileName: string) {
    await this.s3Service.deleteFile(fileName);
    return { message: 'File deleted successfully' };
  }
}
