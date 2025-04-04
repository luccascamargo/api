import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateAdvertUserDto {
  @IsNotEmpty({ message: 'O campo cambio não pode ser vazio' })
  @IsString({ message: 'O campo cambio deve ser uma string' })
  user_id: string;

  @IsNotEmpty({ message: 'O campo cep não pode ser vazio' })
  @IsString({ message: 'O campo cep deve ser uma string' })
  advert_id: string;
}
