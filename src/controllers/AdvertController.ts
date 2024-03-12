/* eslint-disable @typescript-eslint/no-explicit-any */
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
        return res.json({ message: 'Anuncio nao encontrado', status: false })
      }

      return res.status(200).json({ advert })
    } catch (err) {
      console.log(err)
      return res.status(404).send('Advert not found')
    }
  }

  async IndexWithId(req: Request, res: Response) {
    const { id } = req.params
    try {
      const advert = await prisma.adverts.findUnique({
        where: {
          condicao: 'ACTIVE',
          id,
        },
        include: {
          photos: true,
          Users: true,
          optionals: true,
        },
      })

      return res.status(200).json(advert)
    } catch (err) {
      console.log(err)
      return res.status(404).send('Advert not found')
    }
  }

  async List(req: Request, res: Response) {
    try {
      const adverts = await prisma.adverts.findMany({
        where: {
          condicao: 'ACTIVE',
        },
        include: {
          photos: true,
          Users: true,
          optionals: true,
        },
      })

      return res.status(200).json({ adverts, status: true })
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
                condicao: 'ACTIVE',
              },
              include: {
                photos: true,
                optionals: true,
              },
            },
          },
        })

        if (!advert) {
          return res.status(200).json({ message: 'Usuario nao encontrado' })
        }

        return res.status(200).json(advert.adverts)
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
                condicao: 'REQUESTED',
              },
              include: {
                photos: true,
                optionals: true,
              },
            },
          },
        })

        if (!advert) {
          return res.status(200).json({ message: 'Usuario nao encontrado' })
        }

        return res.status(200).json(advert.adverts)
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
                condicao: 'INACTIVE',
              },
              include: {
                photos: true,
                optionals: true,
              },
            },
          },
        })

        if (!advert) {
          return res.status(200).json({ message: 'Usuario nao encontrado' })
        }

        return res.status(200).json(advert.adverts)
      } catch (err) {
        return res.status(404).send('Advert not found')
      }
    }
  }

  async store(req: Request, res: Response) {
    const {
      marca,
      cep,
      cidade,
      cor,
      portas,
      quilometragem,
      modelo,
      descricao,
      placa,
      preco,
      estado,
      cambio,
      tipo,
      user_id,
      opcionais,
      ano_modelo,
    } = req.body

    const photos: any = req.files
    const addPhotos: any = []

    const optionalsFormated = JSON.parse(opcionais)

    const optinalsData = optionalsFormated.map((id: string) => {
      return { id }
    })

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
        include: { adverts: { where: { condicao: { not: 'INACTIVE' } } } },
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
          marca,
          cep,
          cidade,
          cor,
          portas,
          quilometragem: parseInt(quilometragem),
          modelo,
          descricao,
          placa,
          preco: parseInt(preco),
          estado,
          cambio,
          tipo,
          ano_modelo: parseInt(ano_modelo),
          photos: {
            createMany: {
              data: addPhotos,
            },
          },
          optionals: {
            connect: optinalsData ? optinalsData : [],
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
        include: { adverts: { where: { condicao: { not: 'INACTIVE' } } } },
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
          condicao: 'REQUESTED',
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
          cep: cep,
          cidade: city,
          cor: color,
          portas: doors,
          quilometragem: parseInt(mileage),
          descricao: description,
          placa: plate,
          preco: parseInt(price),
          estado: state,
          cambio: transmission,
          condicao: 'REQUESTED',
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
    const { id } = req.params

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
    const filters = req.body
    try {
      if (filters?.optionals?.length > 0) {
        const optinalsData = filters.optionals.map((id: string) => {
          return { id }
        })
        const advertsFiltered = await prisma.adverts.findMany({
          include: {
            photos: true,
            Users: true,
            optionals: true,
          },
          orderBy: [
            {
              preco: 'asc',
            },
            {
              quilometragem: 'asc',
            },
          ],
          where: {
            condicao: {
              equals: 'ACTIVE',
            },
            AND: [
              {
                optionals: {
                  some: {
                    AND: optinalsData,
                  },
                },
              },
              filters.cidade ? { cidade: filters.cidade } : {},
              filters.tipo ? { tipo: filters.tipo } : {},
              filters.marca ? { marca: filters.marca } : {},
              filters.modelo ? { modelo: filters.modelo } : {},
              filters.cor ? { cor: filters.cor } : {},
              filters.portas ? { portas: filters.portas } : {},
              filters.cambio ? { cambio: filters.cambio } : {},
              filters.precoMinimo
                ? { preco: { gte: filters.precoMinimo } }
                : {},
              filters.precoMaximo
                ? { preco: { lte: filters.precoMaximo } }
                : {},
              filters.kmMaximo
                ? { quilometragem: { lte: filters.kmMaximo } }
                : {},
              filters.kmMinimo
                ? { quilometragem: { gte: filters.kmMinimo } }
                : {},
              filters.anoMaximo
                ? { ano_modelo: { lte: filters.anoMaximo } }
                : {},
              filters.anoMinimo
                ? { ano_modelo: { gte: filters.anoMinimo } }
                : {},
            ],
          },
        })

        return res.json(advertsFiltered)
      }

      const advertsFiltered = await prisma.adverts.findMany({
        include: {
          photos: true,
          Users: true,
          optionals: true,
        },
        orderBy: [
          {
            preco: 'asc',
          },
          {
            quilometragem: 'asc',
          },
        ],
        where: {
          condicao: {
            equals: 'ACTIVE',
          },
          AND: [
            filters.cidade ? { cidade: filters.cidade } : {},
            filters.tipo ? { tipo: filters.tipo } : {},
            filters.marca ? { marca: filters.marca } : {},
            filters.modelo ? { modelo: filters.modelo } : {},
            filters.cor ? { cor: filters.cor } : {},
            filters.portas ? { portas: filters.portas } : {},
            filters.cambio ? { cambio: filters.cambio } : {},
            filters.precoMinimo ? { preco: { gte: filters.precoMinimo } } : {},
            filters.precoMaximo ? { preco: { lte: filters.precoMaximo } } : {},
            filters.kmMaximo
              ? { quilometragem: { lte: filters.kmMaximo } }
              : {},
            filters.kmMinimo
              ? { quilometragem: { gte: filters.kmMinimo } }
              : {},
            filters.anoMaximo ? { ano_modelo: { lte: filters.anoMaximo } } : {},
            filters.anoMinimo ? { ano_modelo: { gte: filters.anoMinimo } } : {},
          ],
        },
      })

      return res.json(advertsFiltered)
    } catch (err) {
      console.log(err)
      return res.status(404).json({
        message:
          'Algo de errado aconteceu, verifique os dados enviados e tente novamente',
      })
    }
  }
}
