import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdvertModule } from './advert/advert.module';
import { StripeModule } from './stripe/stripe.module';
import { FipeModule } from './fipe/fipe.module';
import { UserModule } from './user/user.module';
import { OptionalsModule } from './optionals/optionals.module';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    AdvertModule,
    StripeModule,
    FipeModule,
    UserModule,
    OptionalsModule,
    S3Module,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
