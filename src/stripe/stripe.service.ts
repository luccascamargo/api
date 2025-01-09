import {
  BadRequestException,
  Injectable,
  RawBodyRequest,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { PrismaService } from 'src/prisma/prisma.service';
import { Stripe } from 'stripe';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET_KEY;

@Injectable()
export class StripeService {
  public stripe: Stripe;

  constructor(private readonly prismaService: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });
  }

  async listen(
    request: RawBodyRequest<FastifyRequest>,
    stripeSignature: string,
  ) {
    let event: any;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
      // Get the signature sent by Stripe
      if (!stripeSignature) {
        return { error: 'Webhook signature missing' };
      }
      try {
        event = this.stripe.webhooks.constructEvent(
          request.rawBody,
          stripeSignature,
          endpointSecret,
        );
      } catch (err) {
        console.log(`Verificação webhook signature falhou.`, err.message);
        return { error: 'Verificação Webhook signature falhou' };
      }
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
      case 'customer.subscription.updated':
        const subscriptionCreatedMethod = event.data.object;

        const user = await this.prismaService.user.findFirst({
          where: {
            stripe_id: subscriptionCreatedMethod.customer,
          },
        });

        if (!user) {
          throw new BadRequestException('Usuário não encontrado');
        }

        if (subscriptionCreatedMethod.status === 'canceled') {
          await this.prismaService.subscription.update({
            where: {
              inscricao_id: subscriptionCreatedMethod.id,
            },
            data: {
              status: false,
              data_atualizacao: new Date(),
            },
          });

          await this.prismaService.user.update({
            where: {
              id: user.id,
            },
            data: {
              plano: 'GRATIS',
            },
          });
          break;
        }

        if (subscriptionCreatedMethod.status === 'active') {
          await this.prismaService.subscription.create({
            data: {
              periodo_final: new Date(
                subscriptionCreatedMethod.current_period_end * 1000,
              ),
              periodo_inicial: new Date(
                subscriptionCreatedMethod.current_period_start * 1000,
              ),
              status: true,
              data_atualizacao: new Date(),
              data_criacao: new Date(),
              stripe_produto_id:
                subscriptionCreatedMethod.items.data[0].plan.id,
              inscricao_id: subscriptionCreatedMethod.id,
              usuario_id: user.id,
            },
          });

          if (
            subscriptionCreatedMethod.items.data[0].plan.id ===
            'price_1QcsDlA20bcBSMLH6U1zAB0t'
          ) {
            await this.prismaService.user.update({
              where: {
                id: user.id,
              },
              data: {
                plano: 'PRO',
              },
            });
          }

          await this.prismaService.user.update({
            where: {
              id: user.id,
            },
            data: {
              plano: 'BASICO',
            },
          });
        }

        if (subscriptionCreatedMethod.status === 'paused') {
          await this.prismaService.subscription.update({
            where: {
              inscricao_id: subscriptionCreatedMethod.id,
              status: true,
            },
            data: {
              status: false,
              data_atualizacao: new Date(),
            },
          });

          await this.prismaService.user.update({
            where: {
              id: user.id,
            },
            data: {
              plano: 'GRATIS',
            },
          });
        }
        break;

      default:
        console.log(`Tipo de evento desconhecido ${event.type}.`);
    }
  }
}
