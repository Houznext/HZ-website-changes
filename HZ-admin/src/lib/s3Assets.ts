const DEFAULT_BUCKET_HOST = "houznext-prod-assets.s3.ap-south-1.amazonaws.com";

export const S3_ASSETS_BASE_URL = (
  process.env.NEXT_PUBLIC_S3_ASSETS_BASE_URL?.trim() ||
  `https://${process.env.NEXT_PUBLIC_S3_BUCKET_HOST?.trim() || DEFAULT_BUCKET_HOST}`
).replace(/\/$/, "");

export function s3AssetUrl(key: string): string {
  return `${S3_ASSETS_BASE_URL}/${key.replace(/^\//, "")}`;
}

export const S3_BUCKET_HOST =
  process.env.NEXT_PUBLIC_S3_BUCKET_HOST?.trim() ||
  "houznext-prod-assets.s3.ap-south-1.amazonaws.com";
