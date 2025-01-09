import { Module } from '@nestjs/common';
import { OptionalsService } from './optionals.service';
import { OptionalsController } from './optionals.controller';

@Module({
  controllers: [OptionalsController],
  providers: [OptionalsService],
})
export class OptionalsModule {}
