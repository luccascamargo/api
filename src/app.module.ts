import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
    MongooseModule.forRoot('mongodb://admin:admin@localhost:27017/', {
      autoCreate: true,
      dbName: 'igarageapp',
    }),
    FipeModule,
    UserModule,
    OptionalsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
