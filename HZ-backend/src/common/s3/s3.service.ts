import { Injectable } from '@nestjs/common';
import { S3Client, DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { RequestChecksumCalculation } from '@aws-sdk/middleware-flexible-checksums';

@Injectable()
export class S3Service {
  // If you have AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_REGION in env, it will pick them up automatically.
  private readonly s3 = new S3Client({
    region: process.env.AWS_REGION,
    requestChecksumCalculation: RequestChecksumCalculation.WHEN_REQUIRED,
  });

  async generateUploadURL(fileName: string, fileType: string): Promise<string> {
    const bucket = process.env.S3_BUCKET_NAME;
    if (!bucket) {
      throw new Error('S3_BUCKET_NAME is not set');
    }

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileName,
      ContentType: fileType,
    });

    // v3 expects expiresIn in seconds
    return getSignedUrl(this.s3, command, { expiresIn: 60 });
  }

  generatePublicURL(key: string): string {
    const bucket = process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION || 'ap-south-1';
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  async generateSignedReadURL(fileUrl: string, expiresIn = 3600): Promise<string> {
    const bucket = process.env.S3_BUCKET_NAME;
    if (!bucket) throw new Error('S3_BUCKET_NAME is not set');

    let key = fileUrl;
    if (/^https?:\/\//i.test(fileUrl)) {
      const url = new URL(fileUrl);
      key = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
    }

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  async deleteFile(fileName: string): Promise<void> {
    const bucket = process.env.S3_BUCKET_NAME;
    if (!bucket) {
      throw new Error('S3_BUCKET_NAME is not set');
    }

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: fileName,
      }),
    );
  }

  async deleteFileByUrl(fileUrl: string): Promise<void> {
    if (!fileUrl) return;

    const trimmed = fileUrl.trim();
    if (!trimmed) return;

    try {
      if (/^https?:\/\//i.test(trimmed)) {
        const url = new URL(trimmed);
        const key = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
        if (!key) return;
        await this.deleteFile(key);
        return;
      }

      await this.deleteFile(trimmed);
    } catch (err) {
      console.error("Failed to delete file from S3:", err);
    }
  }
}
