import { IsOptional, IsString } from 'class-validator';
export class FilterAdvertsDto {
  @IsOptional()
  @IsString({ message: 'O campo busca deve ser uma string' })
  busca?: string;

  @IsOptional()
  @IsString({ message: 'O campo tipo deve ser uma string' })
  tipo?: string;

  @IsOptional()
  @IsString({ message: 'O campo marca deve ser uma string' })
  marca?: string;

  @IsOptional()
  @IsString({ message: 'O campo modelo deve ser uma string' })
  modelo?: string;

  @IsOptional()
  @IsString({ message: 'O campo ano_modelo_min deve ser uma string' })
  ano_modelo_min?: string;

  @IsOptional()
  @IsString({ message: 'O campo ano_modelo_max deve ser uma string' })
  ano_modelo_max?: string;

  @IsOptional()
  @IsString({ message: 'O campo cor deve ser uma string' })
  cor?: string;

  @IsOptional()
  @IsString({ message: 'O campo cidade deve ser uma string' })
  cidade?: string;

  @IsOptional()
  @IsString({ message: 'O campo preco_min deve ser uma string' })
  preco_min?: string;

  @IsOptional()
  @IsString({ message: 'O campo preco_max deve ser uma string' })
  preco_max?: string;

  @IsOptional()
  @IsString({ message: 'O campo portas deve ser uma string' })
  portas?: string;

  @IsOptional()
  @IsString({ message: 'O campo estado deve ser uma string' })
  estado?: string;

  @IsOptional()
  @IsString({ message: 'O campo quilometragem_min deve ser uma string' })
  quilometragem_min?: string;

  @IsOptional()
  @IsString({ message: 'O campo quilometragem_max deve ser uma string' })
  quilometragem_max?: string;

  @IsOptional()
  @IsString({ message: 'O campo cambio deve ser uma string' })
  cambio?: string;

  @IsOptional()
  @IsString({
    each: true,
    message: 'Cada item do campo opcionais deve ser uma string',
  })
  opcionais?: string;
  page?: string = '1';
  limit?: string = '12';
}
