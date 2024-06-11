import { Router } from 'express'
import { UsersController } from '../controllers/UsersController'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'

const userController = new UsersController()

export const UserRouter = Router()

UserRouter.get(
  '/user/:id',
  ClerkExpressWithAuth(),
  userController.findUserPerClerkId,
)
UserRouter.put('/user/:id', userController.updateUSer)
UserRouter.delete('/user/:id', userController.deleteUser)
