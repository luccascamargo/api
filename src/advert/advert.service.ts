import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAdvertDto } from './dto/create-advert.dto';
import { UpdateAdvertDto } from './dto/update-advert.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import { FilterAdvertsDto } from './dto/filter-advert.dto';
import { IAdvertService } from './interface/advert.interface';

@Injectable()
export class AdvertService implements IAdvertService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createAdvertDto: CreateAdvertDto) {
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
      userAlreadyHasAdvert.anuncios.length >= 1
    ) {
      throw new BadRequestException(
        'Limite de anuncios atingido. faça um upgrade no seu plano',
      );
    }

    if (
      userAlreadyHasAdvert.plano === 'BASICO' &&
      userAlreadyHasAdvert.anuncios.length >= 5
    ) {
      throw new BadRequestException(
        'Limite de anuncios atingido. faça um upgrade no seu plano',
      );
    }

    const imagens = createAdvertDto.imagens.map((imagem) => ({
      url: imagem,
    }));

    const slug = slugify(
      `${createAdvertDto.marca}-${createAdvertDto.modelo}
        -${createAdvertDto.ano_modelo}-${uuidv4()}
          -${createAdvertDto.cidade}
            -${createAdvertDto.estado}`,
      { lower: true, strict: true },
    );

    const advert = await this.prismaService.adverts.create({
      data: {
        ano_modelo: createAdvertDto.ano_modelo,
        marca: createAdvertDto.marca,
        modelo: createAdvertDto.modelo,
        cambio: createAdvertDto.cambio,
        cep: createAdvertDto.cep,
        cidade: createAdvertDto.cidade,
        cor: createAdvertDto.cor,
        estado: createAdvertDto.estado,
        placa: createAdvertDto.placa,
        portas: createAdvertDto.portas,
        preco: createAdvertDto.preco,
        quilometragem: createAdvertDto.quilometragem,
        slug,
        tipo: createAdvertDto.tipo,
        data_atualizacao: new Date(),
        data_cricao: new Date(),
        descricao: createAdvertDto.descricao,
        destaque: false,
        status: 'PENDENTE',
        imagens: {
          createMany: {
            data: imagens,
          },
        },
        opcionais: {
          connect: createAdvertDto.opcionais.map((opcional) => ({
            id: opcional,
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
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            data_criacao: true,
          },
        },
      },
    });

    if (!advert) {
      throw new BadRequestException('Anuncio não encontrado');
    }

    return advert;
  }

  async findManyWithEmail(email: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email,
      },
      include: {
        anuncios: {
          where: {
            status: 'ATIVO',
          },
          include: {
            imagens: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    return user.anuncios;
  }

  async update(id: string, updateAdvertDto: UpdateAdvertDto) {
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

    const imagens = updateAdvertDto.imagens?.map((imagem) => ({
      url: imagem,
    }));

    const advertUpdate = await this.prismaService.adverts.update({
      where: {
        id: advert.id,
      },
      data: {
        cambio: updateAdvertDto.cambio || advert.cambio,
        cep: updateAdvertDto.cep || advert.cep,
        cidade: updateAdvertDto.cidade || advert.cidade,
        cor: updateAdvertDto.cor || advert.cor,
        descricao: updateAdvertDto.descricao || advert.descricao,
        estado: updateAdvertDto.estado || advert.estado,
        imagens: {
          deleteMany: {},
          createMany: {
            data: imagens,
          },
        },
        opcionais: updateAdvertDto.opcionais
          ? {
              set: updateAdvertDto.opcionais.map((opcional) => ({
                id: opcional,
              })),
            }
          : undefined,
        placa: updateAdvertDto.placa || advert.placa,
        portas: updateAdvertDto.portas || advert.portas,
        preco: updateAdvertDto.preco || advert.preco,
        quilometragem: updateAdvertDto.quilometragem || advert.quilometragem,
        data_atualizacao: new Date(),
      },
    });

    return advertUpdate;
  }

  async remove(id: string) {
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

    await this.prismaService.adverts.delete({
      where: {
        id,
      },
    });

    return { message: 'Anuncio removido com sucesso' };
  }

  async filterAdverts(filter: FilterAdvertsDto) {
    const adverts = await this.prismaService.adverts.findMany({
      orderBy: [
        {
          preco: 'asc',
        },
        {
          quilometragem: 'asc',
        },
      ],
      where: {
        status: {
          equals: 'ATIVO',
        },
        AND: [
          {
            opcionais: {
              some: {
                AND:
                  filter.opcionais.length > 0
                    ? filter.opcionais.map((id) => ({ id }))
                    : [],
              },
            },
          },
          filter.cidade
            ? {
                cidade: {
                  equals: filter.cidade,
                  mode: 'insensitive',
                },
              }
            : {},
          filter.tipo
            ? {
                tipo: {
                  contains: filter.tipo,
                  mode: 'insensitive',
                },
              }
            : {},
          filter.marca
            ? {
                marca: {
                  contains: filter.marca,
                  mode: 'insensitive',
                },
              }
            : {},
          filter.modelo
            ? {
                modelo: {
                  contains: filter.modelo,
                  mode: 'insensitive',
                },
              }
            : {},
          filter.cor
            ? {
                cor: {
                  contains: filter.cor,
                  mode: 'insensitive',
                },
              }
            : {},
          filter.portas ? { portas: filter.portas } : {},
          filter.cambio
            ? {
                cambio: {
                  contains: filter.cambio,
                  mode: 'insensitive',
                },
              }
            : {},
          filter.preco_min ? { preco: { gte: Number(filter.preco_min) } } : {},
          filter.preco_max ? { preco: { lte: Number(filter.preco_max) } } : {},
          filter.quilometragem_max
            ? { quilometragem: { lte: Number(filter.quilometragem_max) } }
            : {},
          filter.quilometragem_min
            ? { quilometragem: { gte: Number(filter.quilometragem_min) } }
            : {},
          filter.ano_modelo_max
            ? { ano_modelo: { lte: Number(filter.ano_modelo_max) } }
            : {},
          filter.ano_modelo_min
            ? { ano_modelo: { gte: Number(filter.ano_modelo_min) } }
            : {},
        ],
      },
      include: {
        imagens: true,
        opcionais: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            data_criacao: true,
          },
        },
      },
    });

    return adverts;
  }
}
