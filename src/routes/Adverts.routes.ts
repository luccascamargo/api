import { Router } from 'express'
import { AdvertController } from '../controllers/AdvertController'
import { getCep } from '../middlewares/cep'

const advertController = new AdvertController()

export const AdvertsRouter = Router()

AdvertsRouter.get('/adverts', advertController.List)
AdvertsRouter.get('/adverts/:slug', advertController.IndexWithId)
AdvertsRouter.get(
  '/advertPerUser/:user/:condition',
  advertController.IndexPerUser,
)
AdvertsRouter.post('/filtered', advertController.filtered)
AdvertsRouter.put('/publish', advertController.publishAdvert)
AdvertsRouter.post('/create-advert', getCep, advertController.store)

AdvertsRouter.put('/update-advert', getCep, advertController.update)

AdvertsRouter.delete('/delete-advert/:id', advertController.delete)

AdvertsRouter.get(
  '/validateAdvertWhithUser/:user_id/:advert_slug',
  advertController.ValidateAdvertWithUser,
)
