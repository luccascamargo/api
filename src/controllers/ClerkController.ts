import { WebhookEvent } from '@clerk/clerk-sdk-node'
import { Request, Response } from 'express'
import { Webhook } from 'svix'
import { stripe } from '../utils/stripe'
import { UsersController } from './UsersController'
import { IncomingHttpHeaders } from 'http2'

const secret = process.env.CLERK_WEBHOOK_SECRET as string

export default class ClerkController {
  async webhook(req: Request, res: Response) {
    const payload = req.body
    const headers: IncomingHttpHeaders = req.headers

    const wh = new Webhook(secret)

    let evt: WebhookEvent
    try {
      //@ts-ignore
      evt = wh.verify(payload, headers)
    } catch (err) {
      console.log(err)
      return res.status(400).json({ message: 'Clerk webhook error' })
    }

    switch (evt.type) {
      case 'user.created':
        {
          const customerAlreadyExists = await stripe.customers.search({
            query: `email:"${evt.data.email_addresses[0].email_address}"`,
          })

          if (customerAlreadyExists.data.length !== 0) {
            return res.json({ message: 'Customer ja existe' })
          }

          const customer = await stripe.customers.create({
            email: evt.data.email_addresses[0].email_address,
            name: `${evt.data.first_name} ${evt.data.last_name}`,
          })

          const userController = new UsersController()
          await userController.create({
            firstName: evt.data.first_name,
            lastName: evt.data.last_name,
            email: evt.data.email_addresses[0].email_address,
            clerk_id: evt.data.id,
            customer_id: customer.id,
            plan: 'GRATIS',
            avatar: evt.data.image_url,
            payment_method: false,
          })
        }
        break
      default:
        console.log(`Eventos nao ouvidos ${evt.type}`)
        return res.status(200)
    }
  }
}
