import { IsNotEmpty, IsString } from 'class-validator';

export class PortalDto {
  @IsNotEmpty({ message: 'O campo id não pode ser vazio' })
  @IsString({ message: 'O campo id deve ser uma string' })
  id: string;
}
