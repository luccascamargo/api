import { Adverts } from '@prisma/client';
import { CreateAdvertDto } from '../dto/create-advert.dto';
import { UpdateAdvertDto } from '../dto/update-advert.dto';

export interface IAdvertService {
  create(createAdvertDto: CreateAdvertDto): Promise<Adverts>;
  findOne(id: string): Promise<Adverts>;
  findManyWithEmail(email: string): Promise<Adverts[]>;
  update(id: string, updateAdvertDto: UpdateAdvertDto): Promise<Adverts>;
  remove(id: string): Promise<{ message: string }>;
  filterAdverts(filter: any): Promise<Adverts[]>;
}
