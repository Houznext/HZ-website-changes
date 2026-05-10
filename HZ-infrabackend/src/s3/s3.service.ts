import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private client: S3Client | null = null;

  private getClient(): S3Client {
    if (!this.client) {
      const region = process.env.AWS_REGION || 'ap-south-1';
      this.client = new S3Client({
        region,
        credentials:
          process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
            ? {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
              }
            : undefined,
      });
    }
    return this.client;
  }

  async uploadBuffer(
    keyPrefix: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<{ url: string; key: string }> {
    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket) {
      if (process.env.NODE_ENV === 'development') {
        this.logger.warn('[S3 dev bypass] returning placeholder URL');
        return { url: `https://images.unsplash.com/photo-1600596542815-ffad4b1533a9?w=1200&q=80`, key: 'dev' };
      }
      throw new InternalServerErrorException('AWS_S3_BUCKET is not set');
    }
    const key = `${keyPrefix}/${randomUUID()}`;
    await this.getClient().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
    const url = `https://${bucket}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;
    return { url, key };
  }
}
