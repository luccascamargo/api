import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

export class FilterAdvertsDto {
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
  @IsNumber({}, { message: 'O campo ano_modelo deve ser um número' })
  ano_modelo?: number;

  @IsOptional()
  @IsString({ message: 'O campo cor deve ser uma string' })
  cor?: string;

  @IsOptional()
  @IsString({ message: 'O campo cidade deve ser uma string' })
  cidade?: string;

  @IsOptional()
  @IsNumber({}, { message: 'O campo preco deve ser um número' })
  preco_min?: number;

  @IsOptional()
  @IsNumber({}, { message: 'O campo preco deve ser um número' })
  preco_max?: number;

  @IsOptional()
  @IsString({ message: 'O campo portas deve ser uma string' })
  portas?: string;

  @IsOptional()
  @IsNumber({}, { message: 'O campo quilometragem deve ser um número' })
  quilometragem_min?: number;

  @IsOptional()
  @IsNumber({}, { message: 'O campo quilometragem deve ser um número' })
  quilometragem_max?: number;

  @IsOptional()
  @IsString({ message: 'O campo cambio deve ser uma string' })
  cambio?: string;

  @IsOptional()
  @IsArray({ message: 'O campo opcionais deve ser um array' })
  @IsString({
    each: true,
    message: 'Cada item do campo opcionais deve ser uma string',
  })
  opcionais?: string[];
}
