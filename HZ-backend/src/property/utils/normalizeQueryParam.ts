export function normalizeQueryParam(param: string | string[] | undefined): string[] | undefined {
    if (param && param !== '') {
      return typeof param === 'string' ? [param] : param;
    }
    return undefined;
  }

  export function extractS3KeyFromUrl(url: string): string | null {
    try {
      const bucketName = process.env.S3_BUCKET_NAME;
      const region = process.env.AWS_REGION;
      if (!bucketName || !region) {
        console.error('Missing S3_BUCKET_NAME or AWS_REGION environment variables');
        return null;
      }
  
      const s3BaseUrl = `https://${bucketName}.s3.${region}.amazonaws.com/`;
  
      if (url.startsWith(s3BaseUrl)) {
        return url.replace(s3BaseUrl, '');
      }
      return null;
    } catch (error) {
      console.error('Failed to extract key from URL:', error);
      return null;
    }
  }
  