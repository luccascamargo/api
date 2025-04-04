import { IsNotEmpty } from 'class-validator';

export class BrandDto {
  @IsNotEmpty({ message: 'Informe o tipo de veiculo' })
  type: string;
}

export class ModelDto extends BrandDto {
  @IsNotEmpty({ message: 'Informe a marca do veiculo' })
  brand: string;
}
