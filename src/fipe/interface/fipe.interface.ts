export interface IFindBrandsReturn {
  label: string;
  value: string;
  codigoTipoVeiculo: string;
}

export interface IFindModelsReturn {
  label: string;
  value: string;
  codigoTipoVeiculo: string;
  codigoMarcaVeiculo: string;
}

export interface IFindYearsReturn {
  label: string;
  value: string;
  codigoTipoVeiculo: string;
  codigoMarcaVeiculo: string;
  codigoModeloVeiculo: string;
}

export interface FipeServiceInterface {
  findTypes(): { value: number; name: string }[];
  findBrands(type: string): Promise<IFindBrandsReturn[]>;
  findModels(type: string, brand: string): Promise<IFindModelsReturn[]>;
  findYears(
    type: string,
    brand: string,
    model: string,
  ): Promise<IFindYearsReturn[]>;
}
