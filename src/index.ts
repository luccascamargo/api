import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'

import { router } from './routes'

export const app = express()

const port = process.env.PORT || 3000

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
app.use(router)
app.use('/', router)

app.listen(Number(port), () => {
  console.log(` Example app listening at http://localhost:${port}`)
})
