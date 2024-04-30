import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { stripe } from '../utils/stripe'

interface iUser {
  email: string
  customer_id: string
  name: string
  clerk_id: string
  plan: 'GRATIS'
  avatar?: string
}

export class UsersController {
  async index(req: Request, res: Response) {
    try {
      const users = await prisma.users.findMany()

      return res.status(200).json(users)
    } catch (err) {
      console.log(err)

      return res.status(400).json({ message: 'Nenhum usuário encontrado' })
    }
  }

  async create(customer: iUser) {
    try {
      const user = await prisma.users.create({
        data: {
          email: customer.email,
          customer_id: customer.customer_id,
          name: customer.name,
          clerk_id: customer.clerk_id,
          avatar: customer.avatar,
        },
      })

      return user
    } catch (err) {
      console.log(err)
    }
  }

  async findUserPerClerkId(req: Request, res: Response) {
    try {
      const { id } = req.params

      const user = await prisma.users.findFirst({
        where: {
          clerk_id: id,
        },
        select: {
          id: true,
          customer_id: true,
          phone: true,
          plan: true,
          created_at: true,
          subscriptions: {
            select: {
              status: true,
              stripe_product_id: true,
              current_period_end: true,
              current_period_start: true,
            },
          },
        },
      })

      if (!user) {
        return res.status(400).json({ message: 'Usuario nao encontrado' })
      }

      return res.status(200).json(user)
    } catch (err) {
      console.log(err)

      return res.status(400).json({ message: 'Nenhum usuário encontrado' })
    }
  }

  async findUserPerId(req: Request, res: Response) {
    try {
      const { id } = req.params

      const user = await prisma.users.findFirst({
        where: {
          id: id,
        },
        include: {
          adverts: {
            include: {
              photos: true,
            },
          },
        },
      })

      if (!user) {
        return res.status(400).json({ message: 'Usuario nao encontrado' })
      }

      return res.status(200).json(user)
    } catch (err) {
      console.log(err)

      return res.status(400).json({ message: 'Nenhum usuário encontrado' })
    }
  }

  async updateUSer(req: Request, res: Response) {
    try {
      const { email, phone } = req.body.data
      const user = await prisma.users.update({
        where: {
          email,
        },
        data: {
          phone,
        },
      })

      return res.status(200).json(user)
    } catch (err) {
      console.log(err)
      return res.status(400).json({ message: 'Usuario nao econtrado' })
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params

      const userAlreadyExists = await prisma.users.findUnique({
        where: {
          id,
        },
      })

      if (!userAlreadyExists) {
        return res.json({ message: 'Não existe usuário com este id' })
      }

      await stripe.customers.del(userAlreadyExists.customer_id)
      await prisma.users.delete({
        where: {
          clerk_id: id,
        },
      })

      return res.json({ message: 'Usuário excluído com sucesso' })
    } catch (error) {
      console.log(error)
      return res.status(404).json({ message: 'Usuário excluído com sucesso' })
    }
  }

  async phoneUpdate(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { data } = req.body

      const userUpdate = await prisma.users.update({
        where: {
          clerk_id: id,
        },
        data: {
          phone: data.phone,
        },
      })

      return res.status(204).json({ user: userUpdate })
    } catch (error) {
      console.log(error)
      return res.status(404).json({ message: 'Não existe usuário com esse id' })
    }
  }
}
