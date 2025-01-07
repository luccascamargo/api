import {
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAuthDto {
  @IsNotEmpty({ message: 'O valor nome não pode ser nulo.' })
  @MinLength(3, { message: 'O valor nome precisa ter no mímino 3 digitos.' })
  nome: string;

  @IsNotEmpty({ message: 'O valor sobrenome não pode ser nulo.' })
  sobrenome: string;
  @IsNotEmpty({ message: 'O valor email não pode ser nulo.' })
  @IsEmail({}, { message: 'O valor email precisa de um e-mail válido.' })
  email: string;
  @IsNotEmpty({ message: 'O valor senha não pode ser nulo.' })
  @MinLength(8, {
    message: 'O valor senha precisa ter no mímino 8 digitos.',
  })
  senha: string;
  @MinLength(8, {
    message: 'O valor senha precisa ter no mímino 8 digitos.',
  })
  @IsOptional()
  novaSenha: string;
  @IsOptional()
  @IsString({ message: 'O valor telefone precisa ser um texto.' })
  telefone: string;
}
