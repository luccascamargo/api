import { IsNotEmpty, IsNumberString } from 'class-validator';

export class BrandDto {
  @IsNotEmpty({ message: 'Informe o tipo de veiculo' })
  type: string;
}

export class ModelDto extends BrandDto {
  @IsNotEmpty({ message: 'Informe a marca do veiculo' })
  @IsNumberString()
  brand: number;
}

export class YearDto extends ModelDto {
  @IsNotEmpty({ message: 'Informe o modelo do veiculo' })
  @IsNumberString()
  model: number;
}
