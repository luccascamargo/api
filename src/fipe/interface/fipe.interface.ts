type ResponseBrands = {
  nome: string;
  id: number;
};

type ResponseModels = {
  nome: string;
  id: number;
};

export interface FipeServiceInterface {
  sync(type: string): Promise<{ message: string }>;
  findBrands(type: string): Promise<ResponseBrands[]>;
  findModels(brand: string): Promise<ResponseModels[]>;
}
