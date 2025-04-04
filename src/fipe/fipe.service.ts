import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { FipeServiceInterface } from './interface/fipe.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category } from '@prisma/client';
import slugify from 'slugify';

interface ICategory {
  CARROS: string;
  CAMINHOES: string;
  MOTOS: string;
}

const categories: ICategory = {
  CARROS: 'https://brasilapi.com.br/api/fipe/marcas/v1/carros',
  CAMINHOES: 'https://brasilapi.com.br/api/fipe/marcas/v1/caminhoes',
  MOTOS: 'https://brasilapi.com.br/api/fipe/marcas/v1/motos',
};

@Injectable()
export class FipeService implements FipeServiceInterface {
  constructor(private readonly prismaService: PrismaService) {}

  async findBrands(type: string): Promise<{ nome: string; id: number }[]> {
    if (
      !type ||
      !['CARROS', 'CAMINHOES', 'MOTOS'].includes(type.toUpperCase())
    ) {
      throw new Error(
        'Categoria inválida. Escolha entre carro, caminhao ou moto.',
      );
    }
    try {
      const brands = await this.prismaService.brands.findMany({
        where: { categoria: type.toUpperCase() as Category },
        select: {
          id: true,
          nome: true,
          slug: true,
        },
      });

      return brands;
    } catch (error) {
      console.log(error);
      throw new Error('Method not implemented.');
    }
  }

  async findModels(brand: string): Promise<{ nome: string; id: number }[]> {
    try {
      const models = await this.prismaService.models.findMany({
        where: {
          OR: [
            parseInt(brand)
              ? {
                  Brands: {
                    id: parseInt(brand),
                  },
                }
              : {},
            {
              Brands: {
                slug: brand,
              },
            },
          ],
        },
        select: {
          id: true,
          nome: true,
          slug: true,
        },
      });

      return models;
    } catch (error) {
      console.log(error);
      throw new Error('Method not implemented.');
    }
  }

  async sync(): Promise<{ message: string }> {
    for (const [category, url] of Object.entries(categories)) {
      console.log(`🔄 Sincronizando dados para: ${category}...`);

      // Buscar marcas da BrasilAPI
      const { data: brands } = await axios.get(url, {
        headers: { 'Content-Type': 'application/json' },
      });

      for (const brand of brands) {
        // Criar ou atualizar marca
        const slug = slugify(brand.nome, { lower: true, strict: true });
        await this.prismaService.brands.upsert({
          where: { id: parseInt(brand.valor) },
          update: { nome: brand.nome, slug, categoria: category as Category },
          create: {
            id: parseInt(brand.valor),
            nome: brand.nome,
            slug,
            categoria: category as Category,
          },
        });

        // Buscar modelos da marca
        const { data: models } = await axios.get(
          `https://brasilapi.com.br/api/fipe/veiculos/v1/${category.toLowerCase()}/${brand.valor}`,
          { headers: { 'Content-Type': 'application/json' } },
        );

        for (const model of models) {
          const slug = slugify(model.modelo, { lower: true, strict: true });
          await this.prismaService.models.upsert({
            where: { nome: model.modelo },
            update: {
              nome: model.modelo,
              categoria: category as Category,
              slug,
            },
            create: {
              nome: model.modelo,
              slug,
              brandsId: parseInt(brand.valor),
              categoria: category as Category,
            },
          });
        }
      }
      console.log(`✅ Sincronização de ${category} concluída.`);
    }
    return { message: 'Sincronização concluída.' };
  }
}
