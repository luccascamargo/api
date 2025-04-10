import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAdvertDto } from './dto/create-advert.dto';
import { UpdateAdvertDto } from './dto/update-advert.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import { FilterAdvertsDto } from './dto/filter-advert.dto';
import { IAdvertService } from './interface/advert.interface';
import { UserPayload } from 'src/auth/types/userPayload';
import { normalizeText } from 'src/utils/formatedText';
import { S3Service } from 'src/s3/s3.service';
import { Item, transformToArray } from 'src/utils/transform-to-array';
import { ValidateAdvertUserDto } from './dto/validate-advert-user.dto';

@Injectable()
export class AdvertService implements IAdvertService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}
  async active(id: string, user: UserPayload): Promise<any> {
    await this.prismaService.adverts.update({
      where: { id, usuario_id: user.sub },
      data: {
        status: 'ATIVO',
      },
    });
  }
  async inactive(id: string, user: UserPayload): Promise<any> {
    await this.prismaService.adverts.update({
      where: { id, usuario_id: user.sub },
      data: {
        status: 'INATIVO',
      },
    });
  }

  async validateAdvertUser(
    ValidateAdvertUserDto: ValidateAdvertUserDto,
  ): Promise<any> {
    const { advert_id, user_id } = ValidateAdvertUserDto;

    const advert = await this.prismaService.adverts.findFirst({
      where: {
        id: advert_id,
        usuario_id: user_id,
      },
      include: {
        imagens: {
          select: {
            url: true,
            id: true,
          },
        },
        opcionais: {
          select: {
            id: true,
          },
        },
        marca: true,
        modelo: true,
      },
    });

    if (!advert) {
      throw new BadRequestException('Anuncio não encontrado');
    }

    return { advert };
  }

  async create(
    createAdvertDto: CreateAdvertDto,
    files: Array<Express.Multer.File>,
  ) {
    const userAlreadyHasAdvert = await this.prismaService.user.findFirst({
      where: {
        id: createAdvertDto.usuario_id,
      },
      include: {
        anuncios: true,
      },
    });

    if (!userAlreadyHasAdvert) {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (
      userAlreadyHasAdvert.plano === 'GRATIS' &&
      userAlreadyHasAdvert.anuncios.length >= 3
    ) {
      if (files.length > 6) {
        throw new BadRequestException(
          'Limite de imagens atingido. faça um upgrade no seu plano',
        );
      }
      throw new BadRequestException(
        'Limite de anuncios atingido. faça um upgrade no seu plano',
      );
    }

    if (
      userAlreadyHasAdvert.plano === 'BASICO' &&
      userAlreadyHasAdvert.anuncios.length >= 5
    ) {
      if (files.length > 12) {
        throw new BadRequestException(
          'Limite de imagens atingido. faça um upgrade no seu plano',
        );
      }
      throw new BadRequestException(
        'Limite de anuncios atingido. faça um upgrade no seu plano',
      );
    }

    const imagens = await Promise.all(
      files.map(async (file) => {
        const image = await this.s3Service.uploadFile(file);
        return image;
      }),
    );

    let optionals: Array<Item> = [];

    if (createAdvertDto.opcionais) {
      optionals = transformToArray(createAdvertDto.opcionais);
    }

    const formatedDescription = normalizeText(createAdvertDto.descricao);

    const formatedCity = normalizeText(createAdvertDto.cidade);

    const formatedState = normalizeText(createAdvertDto.estado);

    const slug = slugify(
      `${createAdvertDto.marca}-${createAdvertDto.modelo}
        -${createAdvertDto.ano_modelo}-${uuidv4()}
          -${createAdvertDto.cidade}
            -${createAdvertDto.estado}`,
      { lower: true, strict: true },
    );

    const advert = await this.prismaService.adverts.create({
      data: {
        ano_modelo: Number(createAdvertDto.ano_modelo.split('-')[0]),
        cambio: createAdvertDto.cambio,
        cidade: createAdvertDto.cidade,
        cidade_formatada: formatedCity,
        cor: createAdvertDto.cor,
        estado_formatado: formatedState,
        estado: createAdvertDto.estado,
        placa: createAdvertDto.placa,
        portas: createAdvertDto.portas,
        preco: parseInt(createAdvertDto.preco, 10),
        quilometragem: parseInt(createAdvertDto.quilometragem, 10),
        slug,
        tipo: createAdvertDto.tipo,
        data_atualizacao: new Date(),
        data_cricao: new Date(),
        descricao: createAdvertDto.descricao,
        descricao_formatada: formatedDescription,
        destaque: false,
        status: 'PENDENTE',
        marca: {
          connect: { id: parseInt(createAdvertDto.marca) },
        },
        modelo: {
          connect: { id: parseInt(createAdvertDto.modelo) },
        },
        imagens: {
          createMany: {
            data: imagens,
          },
        },
        opcionais: {
          connect: optionals.map((opcional) => ({
            id: opcional.id,
          })),
        },
        usuario: {
          connect: {
            id: createAdvertDto.usuario_id,
          },
        },
      },
      include: {
        imagens: true,
        opcionais: true,
      },
    });

    return advert;
  }

  async findOne(id: string) {
    const advert = await this.prismaService.adverts.findUnique({
      where: {
        id,
      },
      include: {
        imagens: true,
        opcionais: true,
        marca: true,
        modelo: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            sobrenome: true,
            email: true,
            telefone: true,
            data_criacao: true,
            imagem: true,
          },
        },
      },
    });

    if (!advert) {
      throw new BadRequestException('Anuncio não encontrado');
    }

    return advert;
  }

  async findManyWithId(id: string, queryStatus?: { status: string }) {
    const { status } = queryStatus;

    if (status === 'pendente') {
      const user = await this.prismaService.user.findFirst({
        where: {
          id,
        },
        select: {
          id: true,
          anuncios: {
            select: {
              preco: true,
              ano_modelo: true,
              cor: true,
              marca: true,
              modelo: true,
              imagens: true,
              cidade: true,
              quilometragem: true,
              id: true,
            },
            orderBy: {
              data_atualizacao: 'desc',
            },
            where: {
              status: 'PENDENTE',
            },
          },
          nome: true,
          sobrenome: true,
          telefone: true,
          email: true,
          imagem: true,
        },
      });

      if (!user) {
        throw new BadRequestException('Usuário não encontrado');
      }

      return user;
    }

    if (status === 'inativo') {
      const user = await this.prismaService.user.findFirst({
        where: {
          id,
        },
        select: {
          id: true,
          anuncios: {
            select: {
              preco: true,
              ano_modelo: true,
              cor: true,
              marca: true,
              modelo: true,
              imagens: true,
              cidade: true,
              quilometragem: true,
              id: true,
            },
            orderBy: {
              data_atualizacao: 'desc',
            },
            where: {
              status: 'INATIVO',
            },
          },
          nome: true,
          sobrenome: true,
          telefone: true,
          email: true,
          imagem: true,
        },
      });

      if (!user) {
        throw new BadRequestException('Usuário não encontrado');
      }

      return user;
    }

    const user = await this.prismaService.user.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        anuncios: {
          select: {
            preco: true,
            ano_modelo: true,
            cor: true,
            marca: true,
            modelo: true,
            imagens: true,
            cidade: true,
            quilometragem: true,
            id: true,
          },
          orderBy: {
            data_atualizacao: 'desc',
          },
          where: {
            status: 'ATIVO',
          },
        },
        nome: true,
        sobrenome: true,
        telefone: true,
        email: true,
        imagem: true,
        data_criacao: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    return user;
  }

  async update(
    id: string,
    updateAdvertDto: UpdateAdvertDto,
    files: Array<Express.Multer.File>,
  ) {
    const advert = await this.prismaService.adverts.findUnique({
      where: {
        id,
      },
      include: {
        imagens: true,
        opcionais: true,
        usuario: true,
      },
    });

    if (!advert) {
      throw new BadRequestException('Anuncio não encontrado');
    }

    if (
      !files &&
      updateAdvertDto.imagens_remover &&
      updateAdvertDto.imagens_remover.length === advert.imagens.length
    ) {
      throw new BadRequestException(
        'Você não pode remover todas as imagens do anuncio',
      );
    }

    if (
      files &&
      advert.usuario.plano === 'GRATIS' &&
      advert.imagens.length + files.length > 6
    ) {
      throw new BadRequestException(
        'Limite de imagens atingido. Faça um upgrade no seu plano',
      );
    }

    if (
      files &&
      advert.usuario.plano === 'BASICO' &&
      advert.imagens.length + files.length > 12
    ) {
      throw new BadRequestException(
        'Limite de imagens atingido. Faça um upgrade no seu plano',
      );
    }

    let newImages: Array<{ url: string; key: string }> = [];

    if (files && files.length > 0) {
      newImages = await Promise.all(
        files.map(async (file) => {
          const image = await this.s3Service.uploadFile(file);
          return image;
        }),
      );
    }

    if (updateAdvertDto.imagens_remover) {
      const images_to_remove = transformToArray(
        updateAdvertDto.imagens_remover,
      );

      if (images_to_remove.length > 0) {
        const imagesDeleted = await this.prismaService.photos.findMany({
          where: {
            id: {
              in: images_to_remove.map((image) => image.id),
            },
          },
        });

        await this.prismaService.photos.deleteMany({
          where: {
            anuncio_id: id,
            id: {
              in: images_to_remove.map((image) => image.id),
            },
          },
        });

        await this.s3Service.DeleteFiles(imagesDeleted);
      }
    }

    let optionalsRefactored: Array<string> = [];
    if (updateAdvertDto.opcionais) {
      optionalsRefactored = Array.isArray(updateAdvertDto.opcionais)
        ? updateAdvertDto.opcionais
        : [updateAdvertDto.opcionais];
    }

    const advertUpdate = await this.prismaService.adverts.update({
      where: {
        id: advert.id,
      },
      data: {
        status: 'PENDENTE',
        ano_modelo: parseInt(updateAdvertDto.ano_modelo) || advert.ano_modelo,
        cambio: updateAdvertDto.cambio || advert.cambio,
        cidade: updateAdvertDto.cidade || advert.cidade,
        cidade_formatada:
          normalizeText(updateAdvertDto.cidade) || advert.cidade_formatada,
        cor: updateAdvertDto.cor || advert.cor,
        descricao: updateAdvertDto.descricao || advert.descricao,
        descricao_formatada:
          normalizeText(updateAdvertDto.descricao) ||
          advert.descricao_formatada,
        estado: updateAdvertDto.estado || advert.estado,
        imagens: {
          createMany: {
            data: newImages.length > 0 ? newImages : [],
          },
        },
        opcionais:
          optionalsRefactored.length > 0
            ? {
                set: optionalsRefactored.map((opcional) => ({
                  id: opcional,
                })),
              }
            : undefined,
        portas: updateAdvertDto.portas || advert.portas,
        preco: Number(updateAdvertDto.preco) || advert.preco,
        quilometragem:
          Number(updateAdvertDto.quilometragem) || advert.quilometragem,
        data_atualizacao: new Date(),
      },
      include: {
        imagens: true,
        opcionais: true,
      },
    });

    return advertUpdate;
  }

  async remove(id: string, user: UserPayload) {
    const advert = await this.prismaService.adverts.findUnique({
      where: {
        id,
        usuario_id: user.sub,
      },
      include: {
        imagens: {
          select: {
            key: true,
          },
        },
        opcionais: true,
        usuario: true,
      },
    });

    if (!advert) {
      throw new BadRequestException('Anuncio não encontrado');
    }

    await this.prismaService.adverts.delete({
      where: {
        id,
      },
    });

    await this.s3Service.DeleteFiles(advert.imagens);

    return { message: 'Anuncio removido com sucesso' };
  }

  async filterByType(filterAdvertsDto: FilterAdvertsDto, type: string) {
    const {
      pageParam,
      ano_modelo_max,
      ano_modelo_min,
      cambio,
      busca,
      cidade,
      estado,
      modelo,
      cor,
      opcionais,
      portas,
      preco_max,
      preco_min,
      quilometragem_max,
      quilometragem_min,
      tipo,
      limit,
    } = filterAdvertsDto;

    if (!type) {
      throw new BadRequestException('Marca não encontrada');
    }

    const searchTerms = busca?.split(' ');

    const skip = (Number(pageParam) - 1) * Number(limit);

    let optionalsRefactored: Array<string> = [];
    if (opcionais) {
      optionalsRefactored = Array.isArray(opcionais) ? opcionais : [opcionais];
    }

    const adverts = await this.prismaService.adverts.findMany({
      skip,
      take: Number(limit),
      orderBy: { data_cricao: 'asc' },
      where: {
        AND: [
          { status: 'ATIVO' },
          searchTerms
            ? {
                OR: searchTerms.flatMap((term) => [
                  {
                    cor: { contains: normalizeText(term), mode: 'insensitive' },
                  },
                  {
                    cambio: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                  {
                    marca: {
                      slug: {
                        contains: normalizeText(term),
                        mode: 'insensitive',
                      },
                    },
                  },
                  {
                    modelo: {
                      slug: {
                        contains: normalizeText(term),
                        mode: 'insensitive',
                      },
                    },
                  },
                  {
                    cidade_formatada: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                  {
                    estado: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                  {
                    tipo: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                ]),
              }
            : {},
          {
            tipo: {
              equals: type,
            },
          },
          cidade
            ? { cidade_formatada: { contains: cidade, mode: 'insensitive' } }
            : {},
          estado
            ? { estado_formatado: { contains: estado, mode: 'insensitive' } }
            : {},
          modelo
            ? { modelo: { nome: { contains: modelo, mode: 'insensitive' } } }
            : {},
          tipo ? { tipo: { contains: tipo, mode: 'insensitive' } } : {},
          cor ? { cor: { contains: cor, mode: 'insensitive' } } : {},
          portas ? { portas: { contains: portas, mode: 'insensitive' } } : {},
          cambio ? { cambio: { contains: cambio, mode: 'insensitive' } } : {},
          preco_min ? { preco: { gte: parseInt(preco_min, 10) } } : {},
          preco_max
            ? {
                preco: {
                  lte:
                    parseInt(preco_max, 10) > 0
                      ? parseInt(preco_max, 10)
                      : 9999999,
                },
              }
            : {},
          quilometragem_max
            ? {
                quilometragem: {
                  lte:
                    parseInt(quilometragem_max, 10) > 0
                      ? parseInt(quilometragem_max, 10)
                      : 9999999,
                },
              }
            : {},
          quilometragem_min
            ? { quilometragem: { gte: parseInt(quilometragem_min, 10) } }
            : {},
          ano_modelo_max
            ? { ano_modelo: { lte: parseInt(ano_modelo_max) } }
            : {},
          ano_modelo_min
            ? { ano_modelo: { gte: parseInt(ano_modelo_min) } }
            : {},
          opcionais
            ? { opcionais: { some: { nome: { in: optionalsRefactored } } } }
            : {},
        ],
      },
      include: {
        marca: true,
        modelo: true,
        imagens: { select: { url: true, id: true } },
        opcionais: { select: { id: true, nome: true } },
        usuario: {
          select: {
            id: true,
            nome: true,
            sobrenome: true,
            imagem: true,
            email: true,
            telefone: true,
            data_criacao: true,
          },
        },
      },
    });

    const total = await this.prismaService.adverts.count({
      where: {
        AND: [
          { status: 'ATIVO' },
          searchTerms
            ? {
                OR: searchTerms.flatMap((term) => [
                  {
                    cor: { contains: normalizeText(term), mode: 'insensitive' },
                  },
                  {
                    cambio: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                  {
                    marca: {
                      slug: {
                        contains: normalizeText(term),
                        mode: 'insensitive',
                      },
                    },
                  },
                  {
                    modelo: {
                      slug: {
                        contains: normalizeText(term),
                        mode: 'insensitive',
                      },
                    },
                  },
                  {
                    cidade_formatada: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                  {
                    estado: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                  {
                    tipo: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                ]),
              }
            : {},
          {
            tipo: {
              equals: type,
            },
          },
          cidade
            ? { cidade_formatada: { contains: cidade, mode: 'insensitive' } }
            : {},
          estado
            ? { estado_formatado: { contains: estado, mode: 'insensitive' } }
            : {},
          modelo
            ? { modelo: { nome: { contains: modelo, mode: 'insensitive' } } }
            : {},
          tipo ? { tipo: { contains: tipo, mode: 'insensitive' } } : {},
          cor ? { cor: { contains: cor, mode: 'insensitive' } } : {},
          portas ? { portas: { contains: portas, mode: 'insensitive' } } : {},
          cambio ? { cambio: { contains: cambio, mode: 'insensitive' } } : {},
          preco_min ? { preco: { gte: parseInt(preco_min, 10) } } : {},
          preco_max
            ? {
                preco: {
                  lte:
                    parseInt(preco_max, 10) > 0
                      ? parseInt(preco_max, 10)
                      : 9999999,
                },
              }
            : {},
          quilometragem_max
            ? {
                quilometragem: {
                  lte:
                    parseInt(quilometragem_max, 10) > 0
                      ? parseInt(quilometragem_max, 10)
                      : 9999999,
                },
              }
            : {},
          quilometragem_min
            ? { quilometragem: { gte: parseInt(quilometragem_min, 10) } }
            : {},
          ano_modelo_max
            ? { ano_modelo: { lte: parseInt(ano_modelo_max) } }
            : {},
          ano_modelo_min
            ? { ano_modelo: { gte: parseInt(ano_modelo_min) } }
            : {},
          opcionais
            ? { opcionais: { some: { nome: { in: optionalsRefactored } } } }
            : {},
        ],
      },
    });

    const nextPage =
      skip + Number(limit) < total ? Number(pageParam) + 1 : null;

    return {
      data: adverts,
      currentPage: Number(pageParam),
      nextPage,
      total,
    };
  }

  async filterByBrand(filterAdvertsDto: FilterAdvertsDto, brand: string) {
    const {
      pageParam,
      ano_modelo_max,
      ano_modelo_min,
      cambio,
      modelo,
      cor,
      estado,
      cidade,
      opcionais,
      portas,
      preco_max,
      preco_min,
      quilometragem_max,
      quilometragem_min,
      busca,
      tipo,
      limit,
    } = filterAdvertsDto;

    if (!brand) {
      throw new BadRequestException('Marca não encontrada');
    }

    const searchTerms = busca?.split(' ');

    const skip = (Number(pageParam) - 1) * Number(limit);

    let optionalsRefactored: Array<string> = [];
    if (opcionais) {
      optionalsRefactored = Array.isArray(opcionais) ? opcionais : [opcionais];
    }

    const adverts = await this.prismaService.adverts.findMany({
      skip,
      take: Number(limit),
      orderBy: { data_cricao: 'asc' },
      where: {
        AND: [
          { status: 'ATIVO' },
          searchTerms
            ? {
                OR: searchTerms.flatMap((term) => [
                  {
                    cor: { contains: normalizeText(term), mode: 'insensitive' },
                  },
                  {
                    cambio: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                  {
                    marca: {
                      slug: {
                        contains: normalizeText(term),
                        mode: 'insensitive',
                      },
                    },
                  },
                  {
                    modelo: {
                      slug: {
                        contains: normalizeText(term),
                        mode: 'insensitive',
                      },
                    },
                  },
                  {
                    cidade_formatada: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                  {
                    estado: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                  {
                    tipo: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                ]),
              }
            : {},
          {
            marca: {
              slug: brand,
            },
          },
          cidade
            ? { cidade_formatada: { contains: cidade, mode: 'insensitive' } }
            : {},
          estado
            ? { estado_formatado: { contains: estado, mode: 'insensitive' } }
            : {},
          modelo
            ? { modelo: { nome: { contains: modelo, mode: 'insensitive' } } }
            : {},
          tipo ? { tipo: { contains: tipo, mode: 'insensitive' } } : {},
          cor ? { cor: { contains: cor, mode: 'insensitive' } } : {},
          portas ? { portas: { contains: portas, mode: 'insensitive' } } : {},
          cambio ? { cambio: { contains: cambio, mode: 'insensitive' } } : {},
          preco_min ? { preco: { gte: parseInt(preco_min, 10) } } : {},
          preco_max
            ? {
                preco: {
                  lte:
                    parseInt(preco_max, 10) > 0
                      ? parseInt(preco_max, 10)
                      : 9999999,
                },
              }
            : {},
          quilometragem_max
            ? {
                quilometragem: {
                  lte:
                    parseInt(quilometragem_max, 10) > 0
                      ? parseInt(quilometragem_max, 10)
                      : 9999999,
                },
              }
            : {},
          quilometragem_min
            ? { quilometragem: { gte: parseInt(quilometragem_min, 10) } }
            : {},
          ano_modelo_max
            ? { ano_modelo: { lte: parseInt(ano_modelo_max) } }
            : {},
          ano_modelo_min
            ? { ano_modelo: { gte: parseInt(ano_modelo_min) } }
            : {},
          opcionais
            ? { opcionais: { some: { nome: { in: optionalsRefactored } } } }
            : {},
        ],
      },
      include: {
        marca: true,
        modelo: true,
        imagens: { select: { url: true, id: true } },
        opcionais: { select: { id: true, nome: true } },
        usuario: {
          select: {
            id: true,
            nome: true,
            sobrenome: true,
            imagem: true,
            email: true,
            telefone: true,
            data_criacao: true,
          },
        },
      },
    });

    const total = await this.prismaService.adverts.count({
      where: {
        AND: [
          { status: 'ATIVO' },
          searchTerms
            ? {
                OR: searchTerms.flatMap((term) => [
                  {
                    cor: { contains: normalizeText(term), mode: 'insensitive' },
                  },
                  {
                    cambio: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                  {
                    marca: {
                      slug: {
                        contains: normalizeText(term),
                        mode: 'insensitive',
                      },
                    },
                  },
                  {
                    modelo: {
                      slug: {
                        contains: normalizeText(term),
                        mode: 'insensitive',
                      },
                    },
                  },
                  {
                    cidade_formatada: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                  {
                    estado: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                  {
                    tipo: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                ]),
              }
            : {},
          {
            marca: {
              slug: brand,
            },
          },
          cidade
            ? { cidade_formatada: { contains: cidade, mode: 'insensitive' } }
            : {},
          estado
            ? { estado_formatado: { contains: estado, mode: 'insensitive' } }
            : {},
          modelo
            ? { modelo: { nome: { contains: modelo, mode: 'insensitive' } } }
            : {},
          tipo ? { tipo: { contains: tipo, mode: 'insensitive' } } : {},
          cor ? { cor: { contains: cor, mode: 'insensitive' } } : {},
          portas ? { portas: { contains: portas, mode: 'insensitive' } } : {},
          cambio ? { cambio: { contains: cambio, mode: 'insensitive' } } : {},
          preco_min ? { preco: { gte: parseInt(preco_min, 10) } } : {},
          preco_max
            ? {
                preco: {
                  lte:
                    parseInt(preco_max, 10) > 0
                      ? parseInt(preco_max, 10)
                      : 9999999,
                },
              }
            : {},
          quilometragem_max
            ? {
                quilometragem: {
                  lte:
                    parseInt(quilometragem_max, 10) > 0
                      ? parseInt(quilometragem_max, 10)
                      : 9999999,
                },
              }
            : {},
          quilometragem_min
            ? { quilometragem: { gte: parseInt(quilometragem_min, 10) } }
            : {},
          ano_modelo_max
            ? { ano_modelo: { lte: parseInt(ano_modelo_max) } }
            : {},
          ano_modelo_min
            ? { ano_modelo: { gte: parseInt(ano_modelo_min) } }
            : {},
          opcionais
            ? { opcionais: { some: { nome: { in: optionalsRefactored } } } }
            : {},
        ],
      },
    });

    const nextPage =
      skip + Number(limit) < total ? Number(pageParam) + 1 : null;

    return {
      data: adverts,
      currentPage: Number(pageParam),
      nextPage,
      total,
    };
  }

  async filterByModel(filterAdvertsDto: FilterAdvertsDto, model: string) {
    const {
      pageParam,
      ano_modelo_max,
      ano_modelo_min,
      cambio,
      cor,
      estado,
      cidade,
      busca,
      opcionais,
      portas,
      preco_max,
      preco_min,
      quilometragem_max,
      quilometragem_min,
      tipo,
      limit,
    } = filterAdvertsDto;

    if (!model) {
      throw new BadRequestException('Marca não encontrada');
    }

    const searchTerms = busca?.split(' ');

    const skip = (Number(pageParam) - 1) * Number(limit);

    let optionalsRefactored: Array<string> = [];
    if (opcionais) {
      optionalsRefactored = Array.isArray(opcionais) ? opcionais : [opcionais];
    }

    const adverts = await this.prismaService.adverts.findMany({
      skip,
      take: Number(limit),
      orderBy: { data_cricao: 'asc' },
      where: {
        AND: [
          { status: 'ATIVO' },
          searchTerms
            ? {
                OR: searchTerms.flatMap((term) => [
                  {
                    cor: { contains: normalizeText(term), mode: 'insensitive' },
                  },
                  {
                    marca: {
                      slug: {
                        contains: normalizeText(term),
                        mode: 'insensitive',
                      },
                    },
                  },
                  {
                    modelo: {
                      slug: {
                        contains: normalizeText(term),
                        mode: 'insensitive',
                      },
                    },
                  },
                  {
                    cambio: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                  {
                    cidade_formatada: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                  {
                    estado: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                  {
                    tipo: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                ]),
              }
            : {},
          {
            modelo: {
              slug: model,
            },
          },
          cidade
            ? { cidade_formatada: { contains: cidade, mode: 'insensitive' } }
            : {},
          estado
            ? { estado_formatado: { contains: estado, mode: 'insensitive' } }
            : {},
          tipo ? { tipo: { contains: tipo, mode: 'insensitive' } } : {},
          cor ? { cor: { contains: cor, mode: 'insensitive' } } : {},
          portas ? { portas: { contains: portas, mode: 'insensitive' } } : {},
          cambio ? { cambio: { contains: cambio, mode: 'insensitive' } } : {},
          preco_min ? { preco: { gte: parseInt(preco_min, 10) } } : {},
          preco_max
            ? {
                preco: {
                  lte:
                    parseInt(preco_max, 10) > 0
                      ? parseInt(preco_max, 10)
                      : 9999999,
                },
              }
            : {},
          quilometragem_max
            ? {
                quilometragem: {
                  lte:
                    parseInt(quilometragem_max, 10) > 0
                      ? parseInt(quilometragem_max, 10)
                      : 9999999,
                },
              }
            : {},
          quilometragem_min
            ? { quilometragem: { gte: parseInt(quilometragem_min, 10) } }
            : {},
          ano_modelo_max
            ? { ano_modelo: { lte: parseInt(ano_modelo_max) } }
            : {},
          ano_modelo_min
            ? { ano_modelo: { gte: parseInt(ano_modelo_min) } }
            : {},
          opcionais
            ? { opcionais: { some: { nome: { in: optionalsRefactored } } } }
            : {},
        ],
      },
      include: {
        marca: true,
        modelo: true,
        imagens: { select: { url: true, id: true } },
        opcionais: { select: { id: true, nome: true } },
        usuario: {
          select: {
            id: true,
            nome: true,
            sobrenome: true,
            imagem: true,
            email: true,
            telefone: true,
            data_criacao: true,
          },
        },
      },
    });

    const total = await this.prismaService.adverts.count({
      where: {
        AND: [
          { status: 'ATIVO' },
          searchTerms
            ? {
                OR: searchTerms.flatMap((term) => [
                  {
                    cor: { contains: normalizeText(term), mode: 'insensitive' },
                  },
                  {
                    marca: {
                      slug: {
                        contains: normalizeText(term),
                        mode: 'insensitive',
                      },
                    },
                  },
                  {
                    modelo: {
                      slug: {
                        contains: normalizeText(term),
                        mode: 'insensitive',
                      },
                    },
                  },
                  {
                    cambio: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                  {
                    cidade_formatada: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                  {
                    estado: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                  {
                    tipo: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                ]),
              }
            : {},
          {
            modelo: {
              slug: model,
            },
          },
          cidade
            ? { cidade_formatada: { contains: cidade, mode: 'insensitive' } }
            : {},
          estado
            ? { estado_formatado: { contains: estado, mode: 'insensitive' } }
            : {},
          tipo ? { tipo: { contains: tipo, mode: 'insensitive' } } : {},
          cor ? { cor: { contains: cor, mode: 'insensitive' } } : {},
          portas ? { portas: { contains: portas, mode: 'insensitive' } } : {},
          cambio ? { cambio: { contains: cambio, mode: 'insensitive' } } : {},
          preco_min ? { preco: { gte: parseInt(preco_min, 10) } } : {},
          preco_max
            ? {
                preco: {
                  lte:
                    parseInt(preco_max, 10) > 0
                      ? parseInt(preco_max, 10)
                      : 9999999,
                },
              }
            : {},
          quilometragem_max
            ? {
                quilometragem: {
                  lte:
                    parseInt(quilometragem_max, 10) > 0
                      ? parseInt(quilometragem_max, 10)
                      : 9999999,
                },
              }
            : {},
          quilometragem_min
            ? { quilometragem: { gte: parseInt(quilometragem_min, 10) } }
            : {},
          ano_modelo_max
            ? { ano_modelo: { lte: parseInt(ano_modelo_max) } }
            : {},
          ano_modelo_min
            ? { ano_modelo: { gte: parseInt(ano_modelo_min) } }
            : {},
          opcionais
            ? { opcionais: { some: { nome: { in: optionalsRefactored } } } }
            : {},
        ],
      },
    });

    const nextPage =
      skip + Number(limit) < total ? Number(pageParam) + 1 : null;

    return {
      data: adverts,
      currentPage: Number(pageParam),
      nextPage,
      total,
    };
  }
}
