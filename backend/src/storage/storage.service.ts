import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string | undefined;

  constructor() {
    this.bucket = process.env.S3_BUCKET || 'villshop';
    this.endpoint = process.env.S3_ENDPOINT;

    this.client = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      ...(this.endpoint ? { endpoint: this.endpoint, forcePathStyle: true } : {}),
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || '',
      },
    });
  }

  async uploadFile(key: string, buffer: Buffer, contentType: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
    return this.getPublicUrl(key);
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch (err) {
      this.logger.warn(`Failed to delete file ${key}`, err);
    }
  }

  async getSignedUrl(key: string, expiresIn = 86400): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  getPublicUrl(key: string): string {
    const publicBase = process.env.S3_PUBLIC_URL?.replace(/\/+$/, '');
    if (publicBase) {
      return `${publicBase}/${this.bucket}/${key}`;
    }
    if (this.endpoint) {
      return `${this.endpoint}/${this.bucket}/${key}`;
    }
    return `https://${this.bucket}.s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  }

  /**
   * Rewrites stored media URLs that use the internal Docker endpoint (e.g.
   * http://minio:9000) to the browser-reachable S3_PUBLIC_URL base.
   */
  resolvePublicUrl(url: string | null | undefined): string | null | undefined {
    if (!url) return url;

    const publicBase = process.env.S3_PUBLIC_URL?.replace(/\/+$/, '');
    if (!publicBase) return url;

    const internalPrefixes = [
      this.endpoint,
      process.env.S3_ENDPOINT,
      'http://minio:9000',
      'http://localhost:9000',
      'http://127.0.0.1:19000',
    ]
      .filter((p): p is string => Boolean(p))
      .map((p) => p.replace(/\/+$/, ''));

    for (const prefix of internalPrefixes) {
      if (url.startsWith(prefix)) {
        return `${publicBase}${url.slice(prefix.length)}`;
      }
    }

    return url;
  }
}
