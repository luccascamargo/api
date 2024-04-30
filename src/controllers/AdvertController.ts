/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable camelcase */
import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { DeleteExistingPhotos } from '../services/DeleteExistingPhotos'

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

  async ValidateAdvertWithUser(req: Request, res: Response) {
    const { user_id, advert_id } = req.params
    const advert = await prisma.adverts.findUnique({
      where: {
        id: advert_id,
      },
      include: {
        Users: true,
        optionals: {
          select: {
            id: true,
          },
        },
        photos: {
          select: {
            key: true,
            uri: true,
          },
        },
      },
    })

    if (!advert) {
      return res.status(404).json({ error: 'Anúncio não encontrado' })
    }

    if (advert.Users?.clerk_id !== user_id) {
      return res
        .status(403)
        .json({ error: 'Você não tem permissão para acessar este anúncio' })
    }

    return res.status(200).json(advert)
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
      imagens,
    } = req.body

    let optinalsData

    if (opcionais) {
      optinalsData = opcionais.map((id: string) => {
        return { id }
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
              data: imagens,
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

  async update(req: Request, res: Response) {
    const {
      id,
      cep,
      cidade,
      cor,
      portas,
      quilometragem,
      descricao,
      placa,
      preco,
      estado,
      cambio,
      opcionais,
      imagens,
    } = req.body

    let optinalsData

    if (opcionais) {
      optinalsData = opcionais.map((id: string) => {
        return { id }
      })
    }

    try {
      const findAdvert = await prisma.adverts.findFirst({
        where: {
          id,
        },
        include: {
          photos: {
            select: {
              key: true,
            },
          },
        },
      })

      if (!findAdvert) {
        return res.status(404).json({ error: 'Anuncio nao cadastrado' })
      }

      await prisma.photos.deleteMany({
        where: {
          advert_id: findAdvert.id,
        },
      })

      const advert = await prisma.adverts.update({
        where: {
          id: findAdvert.id,
        },
        data: {
          cep,
          cidade,
          cor,
          portas,
          quilometragem: parseInt(quilometragem),
          descricao,
          placa,
          preco: parseInt(preco),
          estado,
          cambio,
          condicao: 'REQUESTED',
          optionals: {
            connect: optinalsData ? optinalsData : [],
          },
          photos: {
            createMany: {
              data: imagens,
            },
          },
        },
      })

      return res.status(200).json({ advert })
    } catch (err) {
      console.log(err)
      return res.status(404).json({ error: 'Erro no update' })
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params

    try {
      const advert = await prisma.adverts.delete({
        where: {
          id,
        },
        include: {
          photos: {
            select: {
              key: true,
            },
          },
        },
      })

      await DeleteExistingPhotos(advert.photos)

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
              filters.cidade
                ? {
                    cidade: {
                      equals: filters.cidade,
                      mode: 'insensitive',
                    },
                  }
                : {},
              filters.tipo
                ? {
                    tipo: {
                      contains: filters.tipo,
                      mode: 'insensitive',
                    },
                  }
                : {},
              filters.marca
                ? {
                    marca: {
                      contains: filters.marca,
                      mode: 'insensitive',
                    },
                  }
                : {},
              filters.modelo
                ? {
                    modelo: {
                      contains: filters.modelo,
                      mode: 'insensitive',
                    },
                  }
                : {},
              filters.cor
                ? {
                    cor: {
                      contains: filters.cor,
                      mode: 'insensitive',
                    },
                  }
                : {},
              filters.portas ? { portas: filters.portas } : {},
              filters.cambio
                ? {
                    cambio: {
                      contains: filters.cambio,
                      mode: 'insensitive',
                    },
                  }
                : {},
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
            filters.busca
              ? {
                  OR: [
                    {
                      cidade: { contains: filters.busca, mode: 'insensitive' },
                    },
                    {
                      tipo: { contains: filters.busca, mode: 'insensitive' },
                    },
                    {
                      modelo: { contains: filters.busca, mode: 'insensitive' },
                    },
                    {
                      marca: { contains: filters.busca, mode: 'insensitive' },
                    },
                  ],
                }
              : {},
            filters.cidade
              ? {
                  cidade: {
                    contains: filters.cidade,
                    mode: 'insensitive',
                  },
                }
              : {},
            filters.tipo
              ? {
                  tipo: {
                    contains: filters.tipo,
                    mode: 'insensitive',
                  },
                }
              : {},
            filters.marca
              ? {
                  marca: {
                    contains: filters.marca,
                    mode: 'insensitive',
                  },
                }
              : {},
            filters.modelo
              ? {
                  modelo: {
                    contains: filters.modelo,
                    mode: 'insensitive',
                  },
                }
              : {},
            filters.cor
              ? {
                  cor: {
                    contains: filters.cor,
                    mode: 'insensitive',
                  },
                }
              : {},
            filters.portas ? { portas: filters.portas } : {},
            filters.cambio
              ? {
                  cambio: {
                    contains: filters.cambio,
                    mode: 'insensitive',
                  },
                }
              : {},
            filters.precoMinimo ? { preco: { gte: filters.precoMinimo } } : {},
            filters.precoMaximo ? { preco: { lte: filters.precoMaximo } } : {},
            filters.kmMaximo
              ? { quilometragem: { lte: filters.kmMaximo / 100 } }
              : {},
            filters.kmMinimo
              ? { quilometragem: { gte: filters.kmMinimo / 100 } }
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
