/* eslint-disable camelcase */
import { type NextFunction, type Request, type Response } from 'express'
import { prisma } from '../utils/prisma'

export class AdvertController {
  async IndexPerId(req: Request, res: Response) {
    const { id } = req.params

    try {
      const advert = await prisma.adverts.findUnique({
        where: {
          id,
        },
        include: {
          photos: true,
          Users: true,
          optionals: true,
        },
      })

      if (advert === null) {
        return res.json({ message: 'Anuncio nao encontrado' })
      }

      return res.status(200).json({ advert })
    } catch (err) {
      console.log(err)
      return res.status(404).send('Advert not found')
    }
  }

  async IndexPerUser(req: Request, res: Response) {
    const { user, condition } = req.params

    if (condition === 'active') {
      try {
        const advert = await prisma.users.findFirst({
          where: {
            clerk_id: user,
          },
          include: {
            adverts: {
              where: {
                condition: 'ACTIVE',
              },
              include: {
                photos: true,
                optionals: true,
                Users: true,
              },
            },
          },
        })

        if (!advert) {
          return res.status(200).json({ message: 'Usuario nao encontrado' })
        }

        return res.status(200).json(advert)
      } catch (err) {
        return res.status(404).send('Advert not found')
      }
    }

    if (condition === 'requested') {
      try {
        const advert = await prisma.users.findFirst({
          where: {
            clerk_id: user,
          },
          include: {
            adverts: {
              where: {
                condition: 'REQUESTED',
              },
              include: {
                photos: true,
                optionals: true,
                Users: true,
              },
            },
          },
        })

        if (!advert) {
          return res.status(200).json({ message: 'Usuario nao encontrado' })
        }

        return res.status(200).json(advert)
      } catch (err) {
        return res.status(404).send('Advert not found')
      }
    }

    if (condition === 'inactive') {
      try {
        const advert = await prisma.users.findFirst({
          where: {
            clerk_id: user,
          },
          include: {
            adverts: {
              where: {
                condition: 'INACTIVE',
              },
              include: {
                photos: true,
                optionals: true,
                Users: true,
              },
            },
          },
        })

        if (!advert) {
          return res.status(200).json({ message: 'Usuario nao encontrado' })
        }

        return res.status(200).json(advert)
      } catch (err) {
        return res.status(404).send('Advert not found')
      }
    }

    try {
      const advert = await prisma.users.findFirst({
        where: {
          clerk_id: user,
        },
        include: {
          adverts: {
            include: {
              optionals: true,
              photos: true,
            },
          },
        },
      })

      if (!advert) {
        return res.status(200).json({ message: 'Usuario nao encontrado' })
      }

      return res.status(200).json(advert)
    } catch (err) {
      return res.status(404).send('Advert not found')
    }
  }

  async store(req: Request, res: Response) {
    const {
      board,
      board_value,
      cep,
      city,
      color,
      doors,
      mileage,
      model,
      model_value,
      description,
      plate,
      price,
      state,
      transmission,
      type,
      user_id,
      type_value,
      year_model,
      year_model_value,
      optionals,
    } = req.body

    const photos: any = req.files
    const addPhotos: any = []

    if (photos) {
      photos.map((photo: any) => {
        return addPhotos.push({
          field_name: photo.key,
          uri: photo.Location,
          version_id: photo.VersionId,
        })
      })
    }

    try {
      const user = await prisma.users.findFirst({
        where: {
          clerk_id: user_id,
        },
        include: { adverts: { where: { condition: { not: 'INACTIVE' } } } },
      })

      if (!user) {
        return res.status(404).send('Usuario nao encontrado')
      }

      if (user.plan === 'ECO') {
        if (user?.adverts.length === 1) {
          return res.status(200).json({
            code: 'ATPLAN',
            message:
              'Limite de anúncios atingido, faca um upgrade no seu plano',
          })
        }
      }
      if (user.plan === 'BASICO') {
        if (user.adverts.length === 5) {
          return res.status(200).json({
            code: 'ATPLAN',
            message:
              'Limite de anúncios atingido, faca um upgrade no seu plano',
          })
        }
      }
      const advert = await prisma.adverts.create({
        data: {
          Users: {
            connect: {
              id: user.id,
            },
          },
          board,
          board_value,
          cep,
          city,
          color,
          doors,
          mileage: parseInt(mileage),
          model,
          model_value,
          description,
          plate,
          price: parseInt(price),
          state,
          transmission,
          type,
          type_value,
          year_model: parseInt(year_model),
          year_model_value,
          photos: {
            createMany: {
              data: addPhotos,
            },
          },
          optionals: {
            connect: optionals ? JSON.parse(optionals) : [],
          },
        },
      })

      return res.status(201).json({ advert, message: 'Anuncio cadastrado' })
    } catch (err) {
      console.log(err)

      return res.status(404).json({ error: 'Anuncio nao cadastrado' })
    }
  }

  async publishAdvert(req: Request, res: Response) {
    try {
      const { id, user_id } = req.body.data

      const user = await prisma.users.findFirst({
        where: {
          clerk_id: user_id,
        },
        include: { adverts: { where: { condition: { not: 'INACTIVE' } } } },
      })

      if (!user) {
        return res.status(200).json({
          message: 'Usuario nao encontrado',
        })
      }

      if (user.plan === 'ECO') {
        if (user.adverts.length === 5) {
          return res.status(200).json({
            code: 'ATPLAN',
            message:
              'Limite de anúncios atingido, faca um upgrade no seu plano',
          })
        }
      }
      if (user.plan === 'BASICO') {
        if (user.adverts.length === 10) {
          return res.status(200).json({
            code: 'ATPLAN',
            message:
              'Limite de anúncios atingido, faca um upgrade no seu plano',
          })
        }
      }

      await prisma.adverts.update({
        where: {
          id,
        },
        data: {
          condition: 'REQUESTED',
        },
      })

      return res.status(200).json({ message: 'Anuncio enviado para avaliacao' })
    } catch (e) {
      console.log(e)
      return res.status(400).json({ message: 'Algo de errado aconteceu' })
    }
  }

  async deleteExistingPhotos(req: Request, res: Response, next: NextFunction) {
    const { id } = req.body

    try {
      await prisma.adverts.update({
        where: {
          id,
        },
        data: {
          photos: {
            deleteMany: {},
          },
        },
      })

      next()
    } catch (err) {
      return res.status(404).json({ error: 'Anuncio nao encontrado' })
    }
  }

  async update(req: Request, res: Response) {
    const {
      id,
      cep,
      city,
      color,
      doors,
      mileage,
      description,
      plate,
      price,
      state,
      transmission,
      optionals,
    } = req.body

    const photos: any = req.files
    const addPhotos: any = []

    if (photos) {
      photos.map((photo: any) => {
        return addPhotos.push({
          field_name: photo.key,
          uri: photo.Location,
          version_id: photo.VersionId,
        })
      })
    }

    try {
      const advert = await prisma.adverts.update({
        where: {
          id,
        },
        data: {
          cep,
          city,
          color,
          doors,
          mileage: parseInt(mileage),
          description,
          plate,
          price: parseInt(price),
          state,
          transmission,
          condition: 'REQUESTED',
          optionals: {
            connect: optionals ? JSON.parse(optionals) : [],
          },
          photos: {
            createMany: {
              data: addPhotos,
            },
          },
        },
      })

      return res.status(200).json({ advert })
    } catch (err) {
      console.log(err)
      return res.status(404).json({ error: 'Anuncio nao cadastrado' })
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.body

    try {
      await prisma.adverts.delete({
        where: {
          id,
        },
      })

      return res.status(200).json({ message: 'Anuncio excluído com sucesso' })
    } catch (err) {
      console.log(err)
      return res.status(404).json({ error: 'Anuncio nao encontrado' })
    }
  }

  async filtered(req: Request, res: Response) {
    const {
      city,
      type,
      board,
      model,
      minYear,
      maxYear,
      color,
      minPrice,
      maxPrice,
      minMileage,
      maxMileage,
      doors,
      transmission,
      optionals: dataOptionals,
    } = req.body

    try {
      if (dataOptionals) {
        const advertsFiltered = await prisma.adverts.findMany({
          include: {
            photos: true,
            Users: true,
            optionals: true,
          },
          orderBy: [
            {
              price: 'asc',
            },
            {
              mileage: 'asc',
            },
          ],
          where: {
            condition: {
              equals: 'ACTIVE',
            },
            OR: [
              {
                optionals: {
                  some: {
                    AND: JSON.parse(dataOptionals),
                  },
                },
                city: {
                  contains: city,
                  mode: 'insensitive',
                },
                type: {
                  contains: type,
                  mode: 'insensitive',
                },
                board: {
                  contains: board,
                  mode: 'insensitive',
                },
                color: {
                  contains: color,
                  mode: 'insensitive',
                },
                transmission: {
                  contains: transmission,
                  mode: 'insensitive',
                },
                doors: {
                  contains: doors,
                  mode: 'insensitive',
                },
                model: {
                  contains: model,
                  mode: 'insensitive',
                },
                year_model: {
                  gte: minYear,
                  lte: maxYear,
                },
                price: {
                  gte: minPrice,
                  lte: maxPrice,
                },
                mileage: {
                  gte: minMileage,
                  lte: maxMileage,
                },
              },
            ],
          },
        })

        if (advertsFiltered.length > 0) {
          return res.json({ advertsFiltered })
        }

        return res.json({ message: 'Nenhum anuncio foi encontrado' })
      }

      const advertsFiltered = await prisma.adverts.findMany({
        include: {
          photos: true,
          Users: true,
          optionals: true,
        },
        orderBy: [
          {
            price: 'asc',
          },
          {
            mileage: 'asc',
          },
        ],
        where: {
          condition: {
            equals: 'ACTIVE',
          },
          OR: [
            {
              city: {
                contains: city,
                mode: 'insensitive',
              },
              type: {
                contains: type,
                mode: 'insensitive',
              },
              board: {
                contains: board,
                mode: 'insensitive',
              },
              color: {
                contains: color,
                mode: 'insensitive',
              },
              transmission: {
                contains: transmission,
                mode: 'insensitive',
              },
              doors: {
                contains: doors,
                mode: 'insensitive',
              },
              model: {
                contains: model,
                mode: 'insensitive',
              },
              year_model: {
                gte: minYear,
                lte: maxYear,
              },
              price: {
                gte: minPrice,
                lte: maxPrice,
              },
              mileage: {
                gte: minMileage,
                lte: maxMileage,
              },
            },
          ],
        },
      })

      if (advertsFiltered.length > 0) {
        return res.json({ advertsFiltered })
      }

      return res.json({ message: 'Nenhum anuncio foi encontrado' })
    } catch (err) {
      console.log(err)
      return res.status(404).json({
        message:
          'Algo de errado aconteceu, verifique os dados enviados e tente novamente',
      })
    }
  }
}
