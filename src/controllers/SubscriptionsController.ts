import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'

export default class SubscriptionsController {
  async getSubscriptionPerId(req: Request, res: Response) {
    try {
      const { id } = req.params

      const subscriptions = await prisma.subscriptions.findMany({
        where: {
          user_id: id,
        },
      })

      return res.status(200).json(subscriptions)
    } catch (err) {
      console.log(err)
      return res.status(400)
    }
  }
}
