import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import axios from 'axios';

const URL_BASE = 'https://veiculos.fipe.org.br/api/veiculos/';
const cacheEnabled = Boolean(process.env.CACHE_ENABLED === 'true') || false;
const dataTable = process.env.FIPE_TABLE || 317; // Janeiro/2025;

@Injectable()
export class FipeService {
  constructor(@InjectConnection() private connection: Connection) {}

  findTypes() {
    const types = [
      { value: 1, name: 'carros' },
      { value: 2, name: 'motos' },
      { value: 3, name: 'caminhoes' },
    ];
    return types;
  }

  async findBrands(type: string) {
    const tableName = 'marcas';

    let dataCached: any = [];
    let data: any = {};

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

        if (data.length > 0) {
          data.forEach(function (element: any) {
            Object.assign(element, {
              ...payload,
              updatedAt: new Date(),
            });
          });
          if (cacheEnabled) {
            try {
              (await this.connection.createCollection(tableName)).insertMany(
                data,
              );
            } catch {
              throw new Error('Erro ao cadastrar as marcas no mongodb');
            }
          }
        }
      }
      return data;
    } catch {
      throw new Error('Erro ao lidar com as marcas');
    }
  }

  async findModels(type: string, brand: string) {
    const tableName = 'models';

    try {
      const payload = {
        codigoTabelaReferencia: dataTable,
        codigoTipoVeiculo: type,
        codigoMarca: brand,
      };

      let dataCached: any = [];
      let data: any = {};

      if (cacheEnabled) {
        dataCached = await this.connection
          .collection(tableName)
          .find()
          .toArray();
      } else {
        dataCached = [];
      }

      if (dataCached?.length > 0 && cacheEnabled) {
        data.Modelos = dataCached;
      } else {
        const resp = await axios.post(URL_BASE + 'ConsultarModelos', payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        data = resp.data;

        if (data?.Modelos?.length > 0) {
          data?.Modelos.forEach(function (element: any) {
            Object.assign(element, { ...payload, updatedAt: new Date() });
          });
          if (cacheEnabled) {
            try {
              const newCollection =
                await this.connection.createCollection(tableName);

              newCollection.insertMany(data.Modelos);
            } catch {
              throw new Error('Erro ao cadastrar os modelos no mongodb');
            }
          }
        }
      }

      const ret = {
        type: type,
        brand: brand,
        data: data.Modelos,
      };
      return ret;
    } catch (error) {
      console.log(error);
      const ret = { success: false, error };
      return ret;
    }
  }

  async findYears(type: string, brand: string, model: string) {
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
      let data: any = {};

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

        if (data?.length > 0) {
          data.forEach(function (element: any) {
            Object.assign(element, { ...payload, updatedAt: new Date() });
          });
          if (cacheEnabled) {
            try {
              const newCollection =
                await this.connection.createCollection(tableName);

              newCollection.insertMany(data);
            } catch {
              throw new Error('Erro ao cadastrar os anos no mongodb');
            }
          }
        }
      }

      const ret = {
        success: true,
        updatedAt: new Date(),
        type: type,
        brand,
        model,
        data,
      };
      return ret;
    } catch (error) {
      const ret = { success: false, error };
      return ret;
    }
  }
}
