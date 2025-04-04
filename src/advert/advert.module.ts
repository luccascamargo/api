import { Module } from '@nestjs/common';
import { AdvertService } from './advert.service';
import { AdvertController } from './advert.controller';
import { S3Module } from 'src/s3/s3.module';

@Module({
  controllers: [AdvertController],
  providers: [AdvertService],
  imports: [S3Module],
})
export class AdvertModule {}
