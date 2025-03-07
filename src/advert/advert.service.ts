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
        ano_modelo: createAdvertDto.ano_modelo,
        marca: createAdvertDto.marca,
        modelo: createAdvertDto.modelo,
        cambio: createAdvertDto.cambio,
        cep: createAdvertDto.cep,
        cidade: createAdvertDto.cidade,
        cidade_formatada: formatedCity,
        cor: createAdvertDto.cor,
        estado_formatado: formatedState,
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
        descricao_formatada: formatedDescription,
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

  async update(
    user: UserPayload,
    id: string,
    updateAdvertDto: UpdateAdvertDto,
  ) {
    const advert = await this.prismaService.adverts.findUnique({
      where: {
        id,
        usuario_id: user.sub,
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

    const formatedDescription = normalizeText(updateAdvertDto.descricao);

    const formatedCity = normalizeText(updateAdvertDto.cidade);

    const advertUpdate = await this.prismaService.adverts.update({
      where: {
        id: advert.id,
      },
      data: {
        cambio: updateAdvertDto.cambio || advert.cambio,
        cep: updateAdvertDto.cep || advert.cep,
        cidade: updateAdvertDto.cidade || advert.cidade,
        cidade_formatada: formatedCity,
        cor: updateAdvertDto.cor || advert.cor,
        descricao: updateAdvertDto.descricao || advert.descricao,
        descricao_formatada: formatedDescription,
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

  async filterAdverts(filterAdvertsDto: FilterAdvertsDto) {
    const {
      busca,
      page = 1,
      limit = 10,
      ano_modelo_max,
      ano_modelo_min,
      cambio,
      cidade,
      cor,
      marca,
      estado,
      modelo,
      opcionais,
      portas,
      preco_max,
      preco_min,
      quilometragem_max,
      quilometragem_min,
      tipo,
    } = filterAdvertsDto;

    let optionalsRefactored: Array<string> = [];

    if (opcionais) {
      optionalsRefactored = opcionais.split(',').map((opc) => opc);
    }
    const skip = (Number(page) - 1) * Number(limit);

    const searchTerms = busca?.split(' ');

    const adverts = await this.prismaService.adverts.findMany({
      skip,
      take: Number(limit),
      orderBy: { data_cricao: 'desc' },
      where: {
        AND: [
          { status: 'ATIVO' },
          searchTerms
            ? {
                OR: searchTerms.flatMap((term) => [
                  {
                    modelo: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
                  {
                    marca: {
                      contains: normalizeText(term),
                      mode: 'insensitive',
                    },
                  },
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
          cidade
            ? {
                cidade_formatada: {
                  equals: normalizeText(cidade),
                  mode: 'insensitive',
                },
              }
            : {},
          estado
            ? {
                estado_formatado: {
                  equals: normalizeText(estado),
                  mode: 'insensitive',
                },
              }
            : {},
          tipo ? { tipo: { contains: tipo, mode: 'insensitive' } } : {},
          marca ? { marca: { contains: marca, mode: 'insensitive' } } : {},
          modelo ? { modelo: { contains: modelo, mode: 'insensitive' } } : {},
          cor ? { cor: { contains: cor, mode: 'insensitive' } } : {},
          portas ? { portas: { contains: portas, mode: 'insensitive' } } : {},
          cambio ? { cambio: { contains: cambio, mode: 'insensitive' } } : {},
          preco_min ? { preco: { gte: Number(preco_min) } } : {},
          preco_max ? { preco: { lte: Number(preco_max) } } : {},
          quilometragem_max
            ? { quilometragem: { lte: Number(quilometragem_max) } }
            : {},
          quilometragem_min
            ? { quilometragem: { gte: Number(quilometragem_min) } }
            : {},
          ano_modelo_max ? { ano_modelo: { lte: Number(ano_modelo_max) } } : {},
          ano_modelo_min ? { ano_modelo: { gte: Number(ano_modelo_min) } } : {},
          opcionais
            ? { opcionais: { some: { id: { in: optionalsRefactored } } } }
            : {},
        ],
      },
      include: {
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

    console.log(filterAdvertsDto);

    const total = await this.prismaService.adverts.count();

    return {
      adverts,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }
}
