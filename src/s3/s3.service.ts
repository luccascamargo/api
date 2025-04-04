import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new Error('Arquivo não encontrado');
    }
    const fileKey = `${uuidv4()}-${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
  }
}
