import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'

import { StrictAuthProp } from '@clerk/clerk-sdk-node'
import { AdvertsRouter } from './routes/Adverts.routes'
import { UserRouter } from './routes/User.routes'
import { OptionalRouter } from './routes/Optional.routes'
import { FipeRoutes } from './routes/Fipe.routes'
import { StripeRoutes } from './routes/Stripe.routes'
import { ClerkRoutes } from './routes/Clerk.routes'
import { EmailRoutes } from './routes/Email.routes'
import { Paymentsrouter } from './routes/Payments.routes'

export const app = express()

const port = process.env.PORT || 3000

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request extends StrictAuthProp {}
  }
}

app.use(cors())
app.use((req: Request, res: Response, next: NextFunction): void => {
  if (
    req.originalUrl === '/stripe_webhooks' ||
    req.originalUrl === '/clerk-webhooks'
  ) {
    next()
  } else {
    express.json()(req, res, next)
  }
})
app.use(AdvertsRouter)
app.use(UserRouter)
app.use(OptionalRouter)
app.use(FipeRoutes)
app.use(StripeRoutes)
app.use(ClerkRoutes)
app.use(EmailRoutes)
app.use(Paymentsrouter)

app.listen(Number(port), () => {
  console.log(`🚀 Server is running in http://localhost:${port}`)
})
