import {
  BadRequestException,
  Injectable,
  RawBodyRequest,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { PrismaService } from 'src/prisma/prisma.service';
import { Stripe } from 'stripe';
import { StripeCreateDto } from './dtos/stripeCreateDto.dto';
import { UserPayload } from 'src/auth/types/userPayload';

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
      case 'customer.subscription.created': {
        const subscriptionCreatedMethod = event.data.object;

        const user = await this.prismaService.user.findFirst({
          where: {
            stripe_id: subscriptionCreatedMethod.customer,
          },
        });

        if (!user) {
          throw new BadRequestException('Usuário não encontrado');
        }

        await this.prismaService.subscription.create({
          data: {
            cancelar_ao_final_do_periodo:
              subscriptionCreatedMethod.cancel_at_period_end,
            periodo_final: new Date(
              subscriptionCreatedMethod.current_period_end * 1000,
            ).toISOString(),
            periodo_inicial: new Date(
              subscriptionCreatedMethod.current_period_start * 1000,
            ).toISOString(),
            status: 'incomplete',
            ciclo: subscriptionCreatedMethod.plan.interval,
            data_atualizacao: new Date(),
            data_criacao: new Date(),
            stripe_produto_id: subscriptionCreatedMethod.plan.id,
            inscricao_id: subscriptionCreatedMethod.id,
            usuario_id: user.id,
          },
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const subscriptionCreatedMethod = event.data.object;

        const user = await this.prismaService.user.findFirst({
          where: {
            stripe_id: subscriptionCreatedMethod.customer,
          },
        });

        if (!user) {
          throw new BadRequestException('Usuário não encontrado');
        }

        await this.prismaService.subscription.update({
          where: {
            inscricao_id: subscriptionCreatedMethod.id,
          },
          data: {
            status: subscriptionCreatedMethod.status,
            data_atualizacao: new Date(),
          },
        });

        await this.prismaService.adverts.updateMany({
          where: {
            usuario_id: user.id,
          },
          data: {
            status: 'INATIVO',
          },
        });
        break;
      }
      case 'customer.subscription.paused': {
        const subscriptionCreatedMethod = event.data.object;

        const user = await this.prismaService.user.findFirst({
          where: {
            stripe_id: subscriptionCreatedMethod.customer,
          },
        });

        if (!user) {
          throw new BadRequestException('Usuário não encontrado');
        }

        await this.prismaService.subscription.update({
          where: {
            inscricao_id: subscriptionCreatedMethod.id,
            status: 'active',
          },
          data: {
            status: 'paused',
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
      case 'customer.subscription.updated': {
        const subscriptionCreatedMethod = event.data.object;

        const user = await this.prismaService.user.findFirst({
          where: {
            stripe_id: subscriptionCreatedMethod.customer,
          },
        });

        if (!user) {
          throw new BadRequestException('Usuário não encontrado');
        }

        await this.prismaService.subscription.update({
          where: {
            inscricao_id: subscriptionCreatedMethod.id,
          },
          data: {
            ciclo: subscriptionCreatedMethod.plan.interval,
            cancelar_ao_final_do_periodo:
              subscriptionCreatedMethod.cancel_at_period_end,
            status: subscriptionCreatedMethod.status,
            periodo_inicial: new Date(
              subscriptionCreatedMethod.current_period_start * 1000,
            ),
            periodo_final: new Date(
              subscriptionCreatedMethod.current_period_end * 1000,
            ),
            stripe_produto_id: subscriptionCreatedMethod.plan.id,
            data_atualizacao: new Date(),
          },
        });

        switch (subscriptionCreatedMethod.plan.id) {
          case 'price_1QcsHDA20bcBSMLHiaI67GY8':
          case 'price_1QcsFIA20bcBSMLHzZTwiadO':
            await this.prismaService.user.update({
              where: {
                id: user.id,
              },
              data: {
                plano: 'BASICO',
              },
            });
            break;
          case 'price_1QcsDlA20bcBSMLH6U1zAB0t':
          case 'price_1QcsDNA20bcBSMLHleAyKwOj':
            await this.prismaService.user.update({
              where: {
                id: user.id,
              },
              data: {
                plano: 'PRO',
              },
            });
            break;
        }
        break;
      }
      default:
        console.log(`Tipo de evento desconhecido ${event.type}.`);
    }
  }

  async portal(user: UserPayload) {
    const userAllReadyExists = await this.prismaService.user.findFirst({
      where: { id: user.sub },
    });

    if (!userAllReadyExists) {
      throw new BadRequestException('Usuário não encontrado');
    }

    const portal = await this.stripe.billingPortal.sessions.create({
      customer: userAllReadyExists.stripe_id,
      return_url: 'http://localhost:3000/pricing',
    });

    if (!portal) {
      throw new BadRequestException('Falha ao buscar cliente');
    }

    return portal.url;
  }

  async create(stripeCreateDto: StripeCreateDto, user: UserPayload) {
    try {
      const plano = stripeCreateDto.plano;
      const ciclo = stripeCreateDto.ciclo;

      const userAllReadyExists = await this.prismaService.user.findFirst({
        where: {
          id: user.sub,
        },
      });

      if (!userAllReadyExists) {
        throw new Error('Usuario nao encontrado');
      }

      // Mapear planos para preços do Stripe
      // Estes IDs seriam seus price IDs reais do Stripe
      const precoIds: Record<string, Record<string, string>> = {
        BASICO: {
          month: 'price_1QcsHDA20bcBSMLHiaI67GY8',
          year: 'price_1QcsFIA20bcBSMLHzZTwiadO',
        },
        PRO: {
          month: 'price_1QcsDlA20bcBSMLH6U1zAB0t',
          year: 'price_1QcsDNA20bcBSMLHleAyKwOj',
        },
      };

      const precoId = precoIds[plano]?.[ciclo];

      if (!precoId) {
        throw new Error('Plano ou ciclo inválido');
      }

      // Obter ou criar cliente no Stripe
      let stripeCustomerId = userAllReadyExists.stripe_id;

      if (!stripeCustomerId) {
        // Criar novo cliente no Stripe
        const customer = await this.stripe.customers.create({
          email: userAllReadyExists.email || undefined,
          name: userAllReadyExists.nome || undefined,
          metadata: {
            userId: userAllReadyExists.id,
          },
        });

        stripeCustomerId = customer.id;

        await this.prismaService.user.update({
          where: { id: userAllReadyExists.id },
          data: { stripe_id: stripeCustomerId },
        });
      }

      // Criar sessão de checkout
      const checkoutSession = await this.stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        line_items: [
          {
            price: precoId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.CLIENT_APP_URL}/assinatura/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_APP_URL}/pricing`,
        subscription_data: {
          metadata: {
            userId: userAllReadyExists.id,
            plano,
            ciclo,
          },
        },
      });

      if (!checkoutSession.url) {
        throw new Error('Erro ao criar sessão de checkout');
      }

      return checkoutSession.url;
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      throw new Error('Erro ao processar a solicitação');
    }
  }
}
