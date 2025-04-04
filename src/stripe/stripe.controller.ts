import {
  Controller,
  Post,
  Headers,
  Req,
  HttpCode,
  RawBodyRequest,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { FastifyRequest } from 'fastify';
import { StripeCreateDto } from './dtos/stripeCreateDto.dto';
import { User } from 'src/decorators/user.decorator';
import { UserPayload } from 'src/auth/types/userPayload';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('/webhook')
  @HttpCode(200)
  webhook(
    @Req() request: RawBodyRequest<FastifyRequest>,
    @Headers('stripe-signature') stripeSignature: string,
  ) {
    return this.stripeService.listen(request, stripeSignature);
  }

  @Get('/portal')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  portal(@User() user: UserPayload) {
    return this.stripeService.portal(user);
  }

  @Get('/create')
  @UseGuards(AuthGuard)
  create(@Query() stripeCreateDto: StripeCreateDto, @User() user: UserPayload) {
    return this.stripeService.create(stripeCreateDto, user);
  }
}
