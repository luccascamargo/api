import { IsNotEmpty } from 'class-validator';

export class CreateOptionalDto {
  @IsNotEmpty({ message: 'O campo name não pode ser vazio' })
  name: string;
}
