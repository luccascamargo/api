import { Request, Response, Router } from 'express'
import { Resend } from 'resend'

const resend = new Resend('re_GfoNMvqU_MteZG9cDpxn5Yfmfxxc2XpcX')

export const EmailRoutes = Router()

EmailRoutes.get('/send', async (req: Request, res: Response) => {
  const { data, error } = await resend.emails.send({
    from: 'Lucas Resend <onboarding@resend.dev>',
    to: ['lucascamargo.dev@gmail.com'],
    subject: 'hello world',
    html: '<strong>it works!</strong>',
  })

  if (error) {
    return res.status(400).json({ error })
  }

  return res.status(200).json({ data })
})
