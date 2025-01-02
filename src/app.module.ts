import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdvertModule } from './advert/advert.module';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [AuthModule, PrismaModule, AdvertModule, StripeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
