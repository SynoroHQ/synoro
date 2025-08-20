import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Endpoint = process.env.AWS_S3_ENDPOINT;
const s3ForcePathStyle =
  process.env.AWS_S3_FORCE_PATH_STYLE === "false" ? false : true;

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  ...(s3Endpoint
    ? {
        endpoint: s3Endpoint,
        forcePathStyle: s3ForcePathStyle, // MinIO-friendly by default when endpoint provided
      }
    : {}),
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "synoro-bucket";

export async function createPresignedUrl(key: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: "application/octet-stream",
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
}

export function generateS3Key(
  originalKey: string,
  temporary: boolean = false,
): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const prefix = temporary ? "temp" : "uploads";

  return `${prefix}/${timestamp}-${randomId}-${originalKey}`;
}

export async function uploadBufferToS3(
  key: string,
  body: Buffer | Uint8Array,
  contentType?: string,
): Promise<{ key: string; bucket: string; etag?: string }> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType ?? "application/octet-stream",
  });
  const res = await s3Client.send(command);
  return { key, bucket: BUCKET_NAME, etag: res.ETag };
}

export async function getDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
}
