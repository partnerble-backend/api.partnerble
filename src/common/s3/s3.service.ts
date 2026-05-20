import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import * as crypto from 'crypto';
import * as path from 'path';

export interface UploadableFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.getOrThrow<string>('AWS_REGION');
    this.bucket = this.configService.getOrThrow<string>('AWS_S3_BUCKET');
    this.client = new S3Client({ region: this.region });
  }

  async upload(
    file: UploadableFile,
    prefix: string,
  ): Promise<{ url: string; key: string }> {
    const ext = path.extname(file.originalname);
    const key = `${prefix}/${crypto.randomUUID()}${ext}`;

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch (error) {
      this.logger.error(
        `S3 upload failed for key "${key}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException('파일 업로드에 실패했습니다.');
    }

    const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    return { url, key };
  }

  async deleteObject(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      this.logger.error(
        `S3 delete failed for key "${key}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException('파일 삭제에 실패했습니다.');
    }
  }
}
