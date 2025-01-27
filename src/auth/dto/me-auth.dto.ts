import { IsNotEmpty, IsString } from 'class-validator';

export class MeAuthDto {
  @IsNotEmpty({ message: 'O valor id não pode ser nulo.' })
  @IsString({ message: 'O valor de id precisa ser uma string' })
  id: string;
}
