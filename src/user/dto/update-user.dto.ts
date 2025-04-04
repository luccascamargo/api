import { MinLength, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty({ message: 'O valor nome não pode ser nulo.' })
  @MinLength(3, { message: 'O valor nome precisa ter no mímino 3 digitos.' })
  nome: string;

  @IsNotEmpty({ message: 'O valor sobrenome não pode ser nulo.' })
  sobrenome: string;

  @IsOptional()
  @IsString({ message: 'O valor telefone precisa ser um texto.' })
  telefone: string;
}
