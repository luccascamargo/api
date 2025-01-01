import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class UpdateAdvertDto {
  @IsNotEmpty({ message: 'O campo cambio não pode ser vazio' })
  @IsString({ message: 'O campo cambio deve ser uma string' })
  cambio: string;

  @IsNotEmpty({ message: 'O campo cep não pode ser vazio' })
  @IsString({ message: 'O campo cep deve ser uma string' })
  cep: string;

  @IsNotEmpty({ message: 'O campo cidade não pode ser vazio' })
  @IsString({ message: 'O campo cidade deve ser uma string' })
  cidade: string;

  @IsNotEmpty({ message: 'O campo cor não pode ser vazio' })
  @IsString({ message: 'O campo cor deve ser uma string' })
  cor: string;

  @IsNotEmpty({ message: 'O campo descricao não pode ser vazio' })
  @IsString({ message: 'O campo descricao deve ser uma string' })
  descricao: string;

  @IsNotEmpty({ message: 'O campo estado não pode ser vazio' })
  @IsString({ message: 'O campo estado deve ser uma string' })
  estado: string;

  @IsNotEmpty({ message: 'O campo imagens não pode ser vazio' })
  @IsArray({ message: 'O campo imagens deve ser um array' })
  @ArrayNotEmpty({ message: 'O campo imagens deve ter pelo menos uma imagem' })
  @IsString({
    each: true,
    message: 'Cada item do campo imagens deve ser uma string',
  })
  imagens: string[];

  @IsNotEmpty({ message: 'O campo opcionais não pode ser vazio' })
  @IsArray({ message: 'O campo opcionais deve ser um array' })
  @IsString({
    each: true,
    message: 'Cada item do campo opcionais deve ser uma string',
  })
  opcionais: string[];

  @IsNotEmpty({ message: 'O campo placa não pode ser vazio' })
  @IsString({ message: 'O campo placa deve ser uma string' })
  placa: string;

  @IsNotEmpty({ message: 'O campo portas não pode ser vazio' })
  @IsString({ message: 'O campo portas deve ser uma string' })
  portas: string;

  @IsNotEmpty({ message: 'O campo preco não pode ser vazio' })
  @IsNumber({}, { message: 'O campo preco deve ser um número' })
  preco: number;

  @IsNotEmpty({ message: 'O campo quilometragem não pode ser vazio' })
  @IsNumber({}, { message: 'O campo quilometragem deve ser um número' })
  quilometragem: number;
}
