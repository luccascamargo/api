import { IsNotEmpty, IsString } from 'class-validator';

export class StripeCreateDto {
  @IsNotEmpty({ message: 'O campo plano não pode ser vazio' })
  @IsString({ message: 'O campo plano deve ser uma string' })
  plano: string;

  @IsNotEmpty({ message: 'O campo ciclo não pode ser vazio' })
  @IsString({ message: 'O campo ciclo deve ser uma string' })
  ciclo: string;
}
