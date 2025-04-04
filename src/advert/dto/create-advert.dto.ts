import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAdvertDto {
  @IsNotEmpty({ message: 'O campo tipo não pode ser vazio' })
  @IsString({ message: 'O campo tipo deve ser uma string' })
  tipo: string;

  @IsNotEmpty({ message: 'O campo marca não pode ser vazio' })
  @IsString({ message: 'O campo marca deve ser uma string' })
  marca: string;

  @IsNotEmpty({ message: 'O campo modelo não pode ser vazio' })
  @IsString({ message: 'O campo modelo deve ser uma string' })
  modelo: string;

  @IsNotEmpty({ message: 'O campo ano_modelo não pode ser vazio' })
  @IsString({ message: 'O campo ano_modelo deve ser uma string' })
  ano_modelo: string;

  @IsNotEmpty({ message: 'O campo cor não pode ser vazio' })
  @IsString({ message: 'O campo cor deve ser uma string' })
  cor: string;

  @IsNotEmpty({ message: 'O campo cidade não pode ser vazio' })
  @IsString({ message: 'O campo cidade deve ser uma string' })
  cidade: string;

  @IsNotEmpty({ message: 'O campo estado não pode ser vazio' })
  @IsString({ message: 'O campo estado deve ser uma string' })
  estado: string;

  @IsNotEmpty({ message: 'O campo preco não pode ser vazio' })
  @IsString({ message: 'O campo preco deve ser uma string' })
  preco: string;

  @IsNotEmpty({ message: 'O campo portas não pode ser vazio' })
  @IsString({ message: 'O campo portas deve ser uma string' })
  portas: string;

  @IsNotEmpty({ message: 'O campo quilometragem não pode ser vazio' })
  @IsString({ message: 'O campo quilometragem deve ser uma string' })
  quilometragem: string;

  @IsNotEmpty({ message: 'O campo descricao não pode ser vazio' })
  @IsString({ message: 'O campo descricao deve ser uma string' })
  descricao: string;

  @IsNotEmpty({ message: 'O campo placa não pode ser vazio' })
  @IsString({ message: 'O campo placa deve ser uma string' })
  placa: string;

  @IsNotEmpty({ message: 'O campo cambio não pode ser vazio' })
  @IsString({ message: 'O campo cambio deve ser uma string' })
  cambio: string;

  @IsNotEmpty({ message: 'O campo usuario_id não pode ser vazio' })
  @IsString({ message: 'O campo usuario_id deve ser uma string' })
  usuario_id: string;

  @IsOptional()
  @IsString({
    message: 'Cada item do campo opcionais deve ser separado por uma virgula',
  })
  opcionais: string;
}
