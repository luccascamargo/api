import { Router, raw } from 'express'
import StripeController from '../controllers/StripeController'

const stripeController = new StripeController()

export const StripeRoutes = Router()

StripeRoutes.post('/create-checkout-session', stripeController.createSession)
StripeRoutes.post('/subscriptions', stripeController.retrieveSubstriptions)

StripeRoutes.post('/create-customer', stripeController.createUser)

StripeRoutes.post(
  '/stripe_webhooks',
  raw({ type: 'application/json' }),
  stripeController.webhook,
)

StripeRoutes.post('/sync-user', stripeController.syncUser)
