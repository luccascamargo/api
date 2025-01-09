export interface IFindBrandsReturn {
  label: string;
  value: string;
}

export interface IFindModelsReturn {
  label: string;
  value: string;
}

export interface IFindYearsReturn {
  label: string;
  value: string;
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
