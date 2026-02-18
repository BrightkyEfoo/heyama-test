import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MinioService implements OnModuleInit {
  private client: Minio.Client;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.MINIO_BUCKET || 'objects';
    this.client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });
  }

  async onModuleInit() {
    const exists = await this.client.bucketExists(this.bucketName);
    if (!exists) {
      await this.client.makeBucket(this.bucketName);
    }
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucketName}/*`],
        },
      ],
    };
    await this.client.setBucketPolicy(this.bucketName, JSON.stringify(policy));
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const ext = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${ext}`;
    await this.client.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      },
    );
    return `/${this.bucketName}/${fileName}`;
  }

  async deleteFile(imagePath: string): Promise<void> {
    const parts = imagePath.split('/');
    const fileName = parts[parts.length - 1];
    await this.client.removeObject(this.bucketName, fileName);
  }
}
