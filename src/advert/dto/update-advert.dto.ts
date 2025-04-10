import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAdvertDto {
  @IsOptional()
  @IsNotEmpty({ message: 'O campo cambio não pode ser vazio' })
  @IsString({ message: 'O campo cambio deve ser uma string' })
  cambio: string;

  @IsOptional()
  @IsNotEmpty({ message: 'O campo ano_modelo não pode ser vazio' })
  @IsString({ message: 'O campo ano_modelo deve ser uma string' })
  ano_modelo: string;

  @IsOptional()
  @IsNotEmpty({ message: 'O campo cidade não pode ser vazio' })
  @IsString({ message: 'O campo cidade deve ser uma string' })
  cidade: string;

  @IsOptional()
  @IsNotEmpty({ message: 'O campo cor não pode ser vazio' })
  @IsString({ message: 'O campo cor deve ser uma string' })
  cor: string;

  @IsOptional()
  @IsNotEmpty({ message: 'O campo descricao não pode ser vazio' })
  @IsString({ message: 'O campo descricao deve ser uma string' })
  descricao: string;

  @IsOptional()
  @IsNotEmpty({ message: 'O campo estado não pode ser vazio' })
  @IsString({ message: 'O campo estado deve ser uma string' })
  estado: string;

  @IsOptional()
  @IsString({
    message: 'Cada item do campo opcionais deve ser separado por uma virgula',
  })
  opcionais: string;

  @IsOptional()
  @IsNotEmpty({ message: 'O campo portas não pode ser vazio' })
  @IsString({ message: 'O campo portas deve ser uma string' })
  portas: string;

  @IsOptional()
  @IsNotEmpty({ message: 'O campo preco não pode ser vazio' })
  @IsString({ message: 'O campo preco deve ser uma string' })
  preco: string;

  @IsOptional()
  @IsNotEmpty({ message: 'O campo quilometragem não pode ser vazio' })
  @IsString({ message: 'O campo quilometragem deve ser um número' })
  quilometragem: string;

  @IsOptional()
  @IsString({
    message:
      'Cada item do campo imagens_remover deve ser separado por uma virgula',
  })
  imagens_remover: string;
}
