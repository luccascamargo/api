import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdvertModule } from './advert/advert.module';
import { StripeModule } from './stripe/stripe.module';
import { MongooseModule } from '@nestjs/mongoose';
import { FipeModule } from './fipe/fipe.module';
import { UserModule } from './user/user.module';
import { OptionalsModule } from './optionals/optionals.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    AdvertModule,
    StripeModule,
    MongooseModule.forRoot('mongodb://localhost:27017/igarageapp', {
      autoCreate: true,
      dbName: 'igarageapp',
    }),
    FipeModule,
    UserModule,
    OptionalsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
