import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
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

    let dataCached: any = [];
    let data: IFindBrandsReturn[] = [];

    try {
      const payload = {
        codigoTabelaReferencia: dataTable,
        codigoTipoVeiculo: type,
      };

      if (cacheEnabled) {
        dataCached = await this.connection
          .collection(tableName)
          .find()
          .toArray();
      }

      if (dataCached && dataCached?.length > 0 && cacheEnabled) {
        data = dataCached;
      } else {
        const resp = await axios.post(URL_BASE + 'ConsultarMarcas', payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        data = resp.data;

        if (cacheEnabled && data?.length > 0) {
          try {
            const collection = this.connection.collection(tableName);
            await collection.deleteMany({});
            const newCollection =
              await this.connection.createCollection(tableName);

            newCollection.insertMany(data);
          } catch {
            throw new Error('Erro ao cadastrar as marcas no mongodb');
          }
        }
      }
      return data;
    } catch {
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

      let dataCached: any = [];
      let data: IFindModelsReturn[] = [];

      if (cacheEnabled) {
        dataCached = await this.connection
          .collection(tableName)
          .find()
          .toArray();
      } else {
        dataCached = [];
      }

      if (dataCached?.length > 0 && cacheEnabled) {
        data = dataCached;
      } else {
        const resp = await axios.post(URL_BASE + 'ConsultarModelos', payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        data = resp.data.Modelos;

        if (cacheEnabled && data?.length > 0) {
          try {
            const collection = this.connection.collection(tableName);
            await collection.deleteMany({});
            const newCollection =
              await this.connection.createCollection(tableName);

            newCollection.insertMany(data);
          } catch {
            throw new Error('Erro ao cadastrar os modelos no mongodb');
          }
        }
      }

      return data;
    } catch (error) {
      console.log(error);
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

      let dataCached: any = [];
      let data: IFindYearsReturn[] = [];

      if (cacheEnabled) {
        dataCached = await this.connection
          .collection(tableName)
          .find()
          .toArray();
      } else {
        dataCached = [];
      }

      if (dataCached?.length > 0 && cacheEnabled) {
        data = dataCached;
      } else {
        const resp = await axios.post(
          URL_BASE + 'ConsultarAnoModelo',
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        data = resp.data;

        if (cacheEnabled && data?.length > 0) {
          try {
            const collection = this.connection.collection(tableName);
            await collection.deleteMany({});
            const newCollection =
              await this.connection.createCollection(tableName);

            newCollection.insertMany(data);
          } catch {
            throw new Error('Erro ao cadastrar os anos no mongodb');
          }
        }
      }

      return data;
    } catch (error) {
      console.log(error);
      throw new Error('Erro ao lidar com os anos');
    }
  }
}
