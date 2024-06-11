import { Router, type Request, type Response } from 'express'
import { stripe } from '../utils/stripe'

export const Paymentsrouter = Router()

Paymentsrouter.post('/pay', async (req: Request, res: Response) => {
  try {
    const { customer, price } = req.body.data
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer },
      { apiVersion: '2022-11-15' },
    )

    const subscription = await stripe.subscriptions.create({
      customer,
      items: [
        {
          plan: price,
        },
      ],
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    })

    res.json({
      // @ts-expect-error
      paymentIntent: subscription.latest_invoice?.payment_intent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer,
      publishableKey:
        'pk_test_51Mi6N6A20bcBSMLHuQ14FBUdFo51V5og4QoWR3dvwz25CA1NeaYgEByWhvXzOqWLDWCnmDpihjkXugE5lXEZxebj00TqYFXNfF',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

Paymentsrouter.get(
  '/payments/:customer',
  async (req: Request, res: Response) => {
    try {
      const { customer } = req.params
      const { data } = await stripe.paymentMethods.list({
        customer,
        type: 'card',
      })

      return res.status(200).json(data)
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Error payments route' })
    }
  },
)

Paymentsrouter.delete(
  '/payments/:paymentId',
  async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params
      await stripe.paymentMethods.detach(paymentId)

      return res.status(200)
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Error payments route' })
    }
  },
)
