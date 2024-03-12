import { Router, raw, type Request, type Response } from 'express'

import { OptionalController } from './controllers/OptionalController'
import { AdvertController } from './controllers/AdvertController'
import { UsersController } from './controllers/UsersController'
import { getCep } from './middlewares/cep'
import { upload } from './middlewares/cloudS3'
import { deletePhotos } from './middlewares/deleteExistingPhotos'
import { getPhotosInAdvert } from './middlewares/getPhotosInAdvert'
import SendEmail from './services/SendEmail'
import StripeController from './controllers/StripeController'
import SubscriptionsController from './controllers/SubscriptionsController'
import ClerkController from './controllers/ClerkController'
import { stripe } from './utils/stripe'
import { FipeController } from './controllers/FipeController'

const VERSION = 'v1'

const advertController = new AdvertController()
const userController = new UsersController()
const optionalController = new OptionalController()
const stripeController = new StripeController()
const subscriptionsController = new SubscriptionsController()
const clerkController = new ClerkController()
const fipeController = new FipeController()

export const router = Router()

router.get('/users', userController.index)
router.get('/user/:id', userController.findUserPerId)
router.put('/user/:id', userController.deleteUser)
router.put('/user/phone/:id', userController.phoneUpdate)
router.delete('/user/:id', userController.deleteUser)

router.get('/advert/:id', advertController.IndexPerId) // get ads with user id
router.get('/adverts/', advertController.List) // get ads with ad id
router.get('/adverts/:id', advertController.IndexWithId) // get ads with ad id
router.get('/advertPerUser/:user/:condition', advertController.IndexPerUser)
router.post('/filtered', advertController.filtered)
router.put('/publish', advertController.publishAdvert)

router.get('/optionals', optionalController.index)
router.post('/create-optional', optionalController.store)

router.get('/' + VERSION + '/types', fipeController.types)
router.get('/' + VERSION + '/brands/:type', fipeController.brands)
router.get('/' + VERSION + '/models/:type/:brand', fipeController.models)
router.get('/' + VERSION + '/years/:type/:brand/:model', fipeController.years)
router.get(
  '/' + VERSION + '/details/:type/:brand/:model/:year',
  fipeController.details,
)

router.post(
  '/create-advert',
  upload.array('image-create'),
  getCep,
  advertController.store,
)

router.put(
  '/update-advert',
  upload.array('image-update'),
  getCep,
  getPhotosInAdvert,
  advertController.deleteExistingPhotos,
  deletePhotos,
  advertController.update,
)

router.delete(
  '/delete-advert/:id',
  getPhotosInAdvert,
  deletePhotos,
  advertController.delete,
)

router.post('/create-checkout-session', stripeController.createSession)

router.post('/create-customer', stripeController.createUser)

router.post(
  '/stripe_webhooks',
  raw({ type: 'application/json' }),
  stripeController.webhook,
)

router.post('/send', async (req: Request, res: Response) => {
  const sendEmail = new SendEmail()
  await sendEmail.run({
    name: 'Lucas Camargo',
    email: 'lucascamargo.dev@gmail.com',
    template: 'create-customer',
  })
  return res.json({ ok: true })
})

router.post('/sync-user', stripeController.syncUser)

router.get(
  '/get-subscriptions/:id',
  subscriptionsController.getSubscriptionPerId,
)

router.post(
  '/clerk-webhooks',
  raw({ type: 'application/json' }),
  clerkController.webhook,
)

router.post('/pay', async (req: Request, res: Response) => {
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

router.post(
  '/associate-payment-method',
  async (req: Request, res: Response) => {
    try {
      const { stripeCustomerId, stripePaymentMethodId } = req.body.data

      await stripe.paymentMethods.attach(stripePaymentMethodId, {
        customer: stripeCustomerId,
      })

      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: { default_payment_method: stripePaymentMethodId },
      })

      return res.json({ ok: true })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  },
)

router.get('/payments/:customer', async (req: Request, res: Response) => {
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
})

router.delete('/payments/:paymentId', async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params
    await stripe.paymentMethods.detach(paymentId)

    return res.status(200)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error payments route' })
  }
})

router.get('/subscriptions/:customer', async (req: Request, res: Response) => {
  try {
    const { customer } = req.params
    const { data } = await stripe.subscriptions.list({
      customer,
      status: 'active',
    })

    return res.status(200).json(data)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error subscriptions list route' })
  }
})
