import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Collection, Connection } from 'mongoose';
import axios from 'axios';
import {
  FipeServiceInterface,
  IFindBrandsReturn,
  IFindModelsReturn,
  IFindYearsReturn,
} from './interface/fipe.interface';

const URL_BASE = 'https://veiculos.fipe.org.br/api/veiculos/';
const cacheEnabled = Boolean(process.env.CACHE_ENABLED === 'true') || false;
const dataTable = process.env.FIPE_TABLE || 317; // Janeiro/2025;

@Injectable()
export class FipeService implements FipeServiceInterface {
  constructor(@InjectConnection() private connection: Connection) {}

  findTypes() {
    const types = [
      { value: 1, name: 'carros' },
      { value: 2, name: 'motos' },
      { value: 3, name: 'caminhoes' },
    ];
    return types;
  }

  async findBrands(type: string): Promise<IFindBrandsReturn[]> {
    const tableName = 'brands';
    let dataCached: IFindBrandsReturn[] = [];
    let data: IFindBrandsReturn[] = [];

    try {
      const payload = {
        codigoTabelaReferencia: dataTable,
        codigoTipoVeiculo: type,
      };

      if (cacheEnabled) {
        const collection: Collection<IFindBrandsReturn> =
          this.connection.collection(tableName);
        dataCached = await collection
          .find({ codigoTipoVeiculo: type })
          .toArray();

        if (dataCached.length > 0) {
          return dataCached;
        }
      }

      const resp = await axios.post(URL_BASE + 'ConsultarMarcas', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      data = resp.data.map((item: { label: string; value: string }) => ({
        ...item,
        codigoTipoVeiculo: type, // Adiciona o campo codigoTipoVeiculo
      }));

      // Atualiza o cache, se habilitado
      if (cacheEnabled && data.length > 0) {
        try {
          const collection: Collection<IFindBrandsReturn> =
            this.connection.collection(tableName);
          await collection.deleteMany({ codigoTipoVeiculo: type }); // Remove apenas os dados do tipo especificado
          await collection.insertMany(data); // Insere os novos dados
        } catch (error) {
          console.error('Erro ao atualizar o cache:', error);
          throw new Error('Erro ao cadastrar as marcas no MongoDB');
        }
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar marcas:', error);
      throw new Error('Erro ao lidar com as marcas');
    }
  }

  async findModels(type: string, brand: string): Promise<IFindModelsReturn[]> {
    const tableName = 'models';

    try {
      const payload = {
        codigoTabelaReferencia: dataTable,
        codigoTipoVeiculo: type,
        codigoMarca: brand,
      };

      let dataCached: IFindModelsReturn[] = [];
      let data: IFindModelsReturn[] = [];

      // Verifica o cache, se habilitado
      if (cacheEnabled) {
        const collection: Collection<IFindModelsReturn> =
          this.connection.collection(tableName);
        dataCached = await collection
          .find({ codigoTipoVeiculo: type, codigoMarca: brand })
          .toArray();

        if (dataCached.length > 0) {
          return dataCached; // Retorna dados em cache se existirem
        }
      }

      // Busca dados da API externa
      const resp = await axios.post(URL_BASE + 'ConsultarModelos', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      data = resp.data.Modelos.map(
        (item: { label: string; value: string }) => ({
          ...item,
          codigoTipoVeiculo: type, // Adiciona o campo codigoTipoVeiculo
          codigoMarcaVeiculo: brand, // Adiciona o campo codigoTipoVeiculo
        }),
      );

      // Atualiza o cache, se habilitado
      if (cacheEnabled && data.length > 0) {
        try {
          const collection: Collection<IFindModelsReturn> =
            this.connection.collection(tableName);
          await collection.deleteMany({
            codigoTipoVeiculo: type,
            codigoMarcaVeiculo: brand,
          }); // Remove apenas os dados relevantes
          await collection.insertMany(data); // Insere os novos dados
        } catch (error) {
          console.error('Erro ao atualizar o cache:', error);
          throw new Error('Erro ao cadastrar os modelos no MongoDB');
        }
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar modelos:', error);
      throw new Error('Erro ao lidar com os modelos');
    }
  }

  async findYears(
    type: string,
    brand: string,
    model: string,
  ): Promise<IFindYearsReturn[]> {
    const tableName = 'years';

    try {
      // Payload
      const payload = {
        codigoTabelaReferencia: dataTable,
        codigoTipoVeiculo: type,
        codigoMarca: brand,
        codigoModelo: model,
      };

      let dataCached: IFindYearsReturn[] = [];
      let data: IFindYearsReturn[] = [];

      // Verifica o cache, se habilitado
      if (cacheEnabled) {
        const collection: Collection<IFindYearsReturn> =
          this.connection.collection(tableName);
        dataCached = await collection
          .find({
            codigoTipoVeiculo: type,
            codigoMarcaVeiculo: brand,
            codigoModeloVeiculo: model,
          })
          .toArray();

        if (dataCached.length > 0) {
          return dataCached; // Retorna dados em cache se existirem
        }
      }

      // Busca dados da API externa
      const resp = await axios.post(URL_BASE + 'ConsultarAnoModelo', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      data = resp.data.map((item: { label: string; value: string }) => ({
        ...item,
        codigoTipoVeiculo: type, // Adiciona o campo codigoTipoVeiculo
        codigoMarcaVeiculo: brand, // Adiciona o campo codigoTipoVeiculo
        codigoModeloVeiculo: model, // Adiciona o campo codigoTipoVeiculo
      }));

      // Atualiza o cache, se habilitado
      if (cacheEnabled && data.length > 0) {
        try {
          const collection: Collection<IFindYearsReturn> =
            this.connection.collection(tableName);
          await collection.deleteMany({
            codigoTipoVeiculo: type,
            codigoMarcaVeiculo: brand,
            codigoModeloVeiculo: model,
          }); // Remove apenas os dados relevantes
          await collection.insertMany(data); // Insere os novos dados
        } catch (error) {
          console.error('Erro ao atualizar o cache:', error);
          throw new Error('Erro ao cadastrar os anos no MongoDB');
        }
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar anos:', error);
      throw new Error('Erro ao lidar com os anos');
    }
  }
}
