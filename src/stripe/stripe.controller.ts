import {
  Controller,
  Post,
  Headers,
  Req,
  HttpCode,
  RawBodyRequest,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { FastifyRequest } from 'fastify';

@Controller('')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('/stripe-webhook')
  @HttpCode(200)
  webhook(
    @Req() request: RawBodyRequest<FastifyRequest>,
    @Headers('stripe-signature') stripeSignature: string,
  ) {
    return this.stripeService.listen(request, stripeSignature);
  }
}
