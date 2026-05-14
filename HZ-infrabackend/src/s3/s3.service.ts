import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

function bucketName(): string | undefined {
  const b = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME;
  return b?.trim() || undefined;
}

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
    const bucket = bucketName();
    if (!bucket) {
      if (process.env.NODE_ENV === 'development') {
        this.logger.warn('[S3 dev bypass] AWS_S3_BUCKET / S3_BUCKET_NAME unset — returning placeholder URL');
        return { url: `https://images.unsplash.com/photo-1600596542815-ffad4b1533a9?w=1200&q=80`, key: 'dev' };
      }
      throw new InternalServerErrorException('AWS_S3_BUCKET or S3_BUCKET_NAME is not set');
    }
    const key = `${keyPrefix}/${randomUUID()}`;
    const region = process.env.AWS_REGION || 'ap-south-1';
    const base = {
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    } as const;

    const client = this.getClient();
    const tryPublicAcl =
      process.env.S3_PUBLIC_READ !== '0' && process.env.S3_PUBLIC_READ !== 'false';

    if (tryPublicAcl) {
      try {
        await client.send(new PutObjectCommand({ ...base, ACL: 'public-read' }));
      } catch (e) {
        const msg = String((e as Error)?.message || e);
        const aclUnsupported =
          /AccessControlListNotSupported|InvalidBucketAclWithObjectOwnership|does not allow ACLs|Bucket owner enforced/i.test(
            msg,
          );
        if (aclUnsupported) {
          this.logger.warn(
            'S3 bucket does not support object ACLs; uploaded without ACL. Add a bucket policy allowing s3:GetObject on infra/property/* for public reads if images must load in the browser.',
          );
          await client.send(new PutObjectCommand(base));
        } else {
          throw e;
        }
      }
    } else {
      await client.send(new PutObjectCommand(base));
    }

    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    return { url, key };
  }
}
