import { Upload } from '@aws-sdk/lib-storage';
import { S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadFile = async (file: File, folder: string, onProgress: (progress: number) => void) => {
  const fileStream = file.stream();
  const fileKey = `${folder}/${uuidv4()}`;

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileKey,
    Body: fileStream,
    ContentType: file.type,
  };

  const upload = new Upload({
    client: s3Client,
    params: uploadParams,
    leavePartsOnError: false, // This will ensure the parts are cleaned up on error.
  });

  upload.on('httpUploadProgress', (progress: any) => {
    const percentage = Math.round((progress.loaded / progress.total) * 100);
    onProgress(percentage);
  });

  await upload.done();

  return {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileKey,
    Location: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
  };
};
