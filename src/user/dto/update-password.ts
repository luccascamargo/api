import { MinLength, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdatePasswordDto {
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
}
