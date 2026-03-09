



module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: '@strapi/provider-upload-aws-s3',
      providerOptions: {
        s3Options: {
          credentials: {
            accessKeyId: env('AWS_ACCESS_KEY_ID'),
            secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
          },
          region: env('AWS_REGION'),
          params: {
            Bucket: env('AWS_BUCKET_NAME', env('S3_BUCKET_NAME')),
            // Buckets with Object Ownership = "Bucket owner enforced" reject ACL headers.
            // Keep ACL null by default (header omitted), but allow explicit override via AWS_ACL.
            ACL: env('AWS_ACL') || null,
          },
        },
      },
    },
  },
});
