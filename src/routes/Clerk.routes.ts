import { Router, raw } from 'express'
import ClerkController from '../controllers/ClerkController'

const clerkController = new ClerkController()

export const ClerkRoutes = Router()

ClerkRoutes.post(
  '/clerk-webhooks',
  raw({ type: 'application/json' }),
  clerkController.webhook,
)
