import { Router } from 'express'
import { OptionalController } from '../controllers/OptionalController'

const optionalController = new OptionalController()

export const OptionalRouter = Router()

OptionalRouter.get('/optionals', optionalController.index)
OptionalRouter.post('/create-optional', optionalController.store)
