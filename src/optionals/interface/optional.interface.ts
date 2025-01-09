import { Optional } from '@prisma/client';
import { CreateOptionalDto } from '../dto/create-optional.dto';

export interface IOptionalService {
  create(createOptionalDto: CreateOptionalDto): Promise<Optional>;
  findAll(): Promise<Optional[]>;
  remove(id: string): Promise<void>;
}
