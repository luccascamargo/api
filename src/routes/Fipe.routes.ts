import { Router } from 'express'
import { FipeController } from '../controllers/FipeController'

const VERSION = 'v1'

const fipeController = new FipeController()

export const FipeRoutes = Router()

FipeRoutes.get('/' + VERSION + '/types', fipeController.types)
FipeRoutes.get('/' + VERSION + '/brands/:type', fipeController.brands)
FipeRoutes.get('/' + VERSION + '/models/:type/:brand', fipeController.models)
FipeRoutes.get(
  '/' + VERSION + '/years/:type/:brand/:model',
  fipeController.years,
)
FipeRoutes.get(
  '/' + VERSION + '/details/:type/:brand/:model/:year',
  fipeController.details,
)
