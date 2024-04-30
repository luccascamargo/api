import { Request, Response } from 'express'
import Stripe from 'stripe'
import { prisma } from '../utils/prisma'
import { stripe } from '../utils/stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export default class StripeController {
  async createSession(req: Request, res: Response) {
    try {
      const { customerId, key } = req.body.data

      const user = await prisma.users.findFirst({
        where: {
          customer_id: customerId,
        },
      })

      if (!user) {
        return res.status(200).json({ message: 'Usuario nao encontrado' })
      }

      const customer = await stripe.customers.retrieve(user.customer_id)

      const subscriptionAlreadyExists = await prisma.subscriptions.findFirst({
        where: {
          customer_id: customer.id,
          AND: {
            status: true,
          },
        },
      })

      if (subscriptionAlreadyExists) {
        const session = await stripe.billingPortal.sessions.create({
          customer: subscriptionAlreadyExists.customer_id,
          return_url: 'https://iserra.app/mobile',
        })
        return res.status(200).json(session.url)
      }

      if (key) {
        const session = await stripe.checkout.sessions.create({
          billing_address_collection: 'auto',
          customer: customer.id,
          line_items: [
            {
              price: key,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `https://iserra.app/mobile`,
          cancel_url: `https://iserra.app/mobile`,
        })

        return res.status(200).json(session.url)
      }
    } catch (err) {
      console.log(err)

      return res.status(400).json({ message: 'error' })
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const { firstName, email } = req.body.data

      const customerAlreadyExists = await stripe.customers.search({
        query: `email:"${email}"`,
      })

      if (customerAlreadyExists.data.length !== 0) {
        return res.json({ message: 'Customer ja existe' })
      }

      await stripe.customers.create({
        email,
        name: `${firstName}`,
      })

      return res.json({ message: 'Criou um customer' })
    } catch (err) {
      console.log(err)

      return res.status(200).json({ message: 'Erro ao criar um customer' })
    }
  }

  async syncUser(req: Request, res: Response) {
    try {
      const { email } = req.body.data

      const user = await prisma.users.findFirst({
        where: {
          email,
        },
      })

      if (!user) {
        return res.status(400).json({ message: 'Usuário nao existe' })
      }

      return res.status(200).json({
        user,
      })
    } catch (err) {
      console.log(err)
      return res.status(404)
    }
  }

  async retrieveSubstriptions(req: Request, res: Response) {
    try {
      const { customer } = req.body

      const getCustomer = await stripe.customers.retrieve(customer)

      const { data } = await stripe.subscriptions.list({
        customer: getCustomer.id,
        status: 'all',
      })

      return res.json({ data })
    } catch (err) {
      console.log(err)

      return res
        .status(200)
        .json({ message: 'Erro ao buscar as subscriptions' })
    }
  }

  async webhook(req: Request, res: Response) {
    const signature = req.headers['stripe-signature']

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature as string,
        webhookSecret as string,
      )
    } catch (err) {
      //@ts-ignore
      console.log(`⚠️  Webhook signature falhou.`, err.message)
      return res.sendStatus(400)
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        //@ts-ignore
        const stripeSubscriptionId = event.data.object.id
        // @ts-ignore
        const status = event.data.object.status
        // @ts-ignore
        const stripeCustomerId = event.data.object.customer
        // @ts-ignore
        const stripeProductId = event.data.object.plan.id
        // @ts-ignore
        const stripeSubscriptionCurrentPeriodStart = new Date(
          // @ts-ignore
          event.data.object.current_period_start * 1000,
        )
        // @ts-ignore
        const stripeSubscriptionCurrentPeriodEnd = new Date(
          // @ts-ignore
          event.data.object.current_period_end * 1000,
        )

        const user = await prisma.users.findFirst({
          where: {
            customer_id: stripeCustomerId,
          },
        })

        if (!user) {
          return
        }

        const subscription = await prisma.subscriptions.findFirst({
          where: {
            customer_id: stripeCustomerId,
            subscription_id: stripeSubscriptionId,
            status: true,
          },
        })

        if (subscription) {
          // update
          await prisma.subscriptions.update({
            where: {
              id: subscription.id,
            },
            data: {
              status: status === 'active',
              stripe_product_id: stripeProductId,
              current_period_end: subscription.current_period_end,
              current_period_start: subscription.current_period_start,
            },
          })

          if (stripeProductId === 'price_1MleilA20bcBSMLHTkAivkja') {
            await prisma.users.update({
              where: {
                clerk_id: user.clerk_id,
              },
              data: {
                plan: 'ECO',
              },
            })
          }

          if (stripeProductId === 'price_1MlejPA20bcBSMLH7qwaUVCO') {
            await prisma.users.update({
              where: {
                clerk_id: user.clerk_id,
              },
              data: {
                plan: 'BASICO',
              },
            })
          }

          if (stripeProductId === 'price_1MlejmA20bcBSMLHlggB9LKF') {
            await prisma.users.update({
              where: {
                clerk_id: user.clerk_id,
              },
              data: {
                plan: 'PRO',
              },
            })
          }

          // await sendEmail.run({
          //   name: user?.name as string,
          //   email: user?.email as string,
          //   template: 'update-subscription',
          // })

          await prisma.adverts.updateMany({
            where: {
              Users: {
                id: user?.id,
              },
            },
            data: {
              condicao: 'INACTIVE',
            },
          })

          if (status === 'canceled') {
            await prisma.users.update({
              where: {
                clerk_id: user.clerk_id,
              },
              data: {
                plan: 'GRATIS',
              },
            })

            await prisma.adverts.updateMany({
              where: {
                Users: {
                  id: user?.id,
                },
              },
              data: {
                condicao: 'INACTIVE',
              },
            })

            // await sendEmail.run({
            //   name: user?.name as string,
            //   email: user?.email as string,
            //   template: 'delete-subscription',
            // })
          }
        } else {
          // create
          await prisma.subscriptions.create({
            data: {
              customer_id: stripeCustomerId,
              status: true,
              user_id: user?.id,
              stripe_product_id: stripeProductId,
              subscription_id: stripeSubscriptionId,
              current_period_end: stripeSubscriptionCurrentPeriodEnd,
              current_period_start: stripeSubscriptionCurrentPeriodStart,
            },
          })

          if (stripeProductId === 'price_1MleilA20bcBSMLHTkAivkja') {
            await prisma.users.update({
              where: {
                clerk_id: user.clerk_id,
              },
              data: {
                plan: 'ECO',
              },
            })
          }
          if (stripeProductId === 'price_1MlejPA20bcBSMLH7qwaUVCO') {
            await prisma.users.update({
              where: {
                clerk_id: user.clerk_id,
              },
              data: {
                plan: 'BASICO',
              },
            })
          }
          if (stripeProductId === 'price_1MlejmA20bcBSMLHlggB9LKF') {
            await prisma.users.update({
              where: {
                clerk_id: user.clerk_id,
              },
              data: {
                plan: 'PRO',
              },
            })
          }
        }
        break
      }
      default:
        console.log(`Eventos nao ouvidos ${event.type}`)
        return res.status(200)
    }

    return res.status(200).send()
  }
}
