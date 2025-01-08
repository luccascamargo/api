import {
  MinLength,
  IsEmail,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';

export class UpdateUserDto {
  @MinLength(3, { message: 'O valor nome precisa ter no mímino 3 digitos.' })
  @IsOptional()
  nome: string;

  @IsOptional()
  sobrenome: string;

  @IsOptional()
  @IsEmail({}, { message: 'O valor email precisa de um e-mail válido.' })
  email: string;

  @IsOptional()
  @IsString({ message: 'O valor telefone precisa ser um texto.' })
  telefone: string;

  @IsOptional()
  @IsBoolean({ message: 'O valor telefone precisa ser um texto.' })
  ativo: boolean;
}
