import { Adverts } from '@prisma/client';
import { CreateAdvertDto } from '../dto/create-advert.dto';
import { UpdateAdvertDto } from '../dto/update-advert.dto';
import { UserPayload } from 'src/auth/types/userPayload';

interface IFilterAdverts {
  adverts: Adverts[];
  total: number;
  page: number;
  totalPages: number;
}

export interface IAdvertService {
  create(createAdvertDto: CreateAdvertDto): Promise<Adverts>;
  findOne(id: string): Promise<Adverts>;
  findManyWithEmail(email: string): Promise<Adverts[]>;
  update(
    user: UserPayload,
    id: string,
    updateAdvertDto: UpdateAdvertDto,
  ): Promise<Adverts>;
  remove(id: string, user: UserPayload): Promise<{ message: string }>;
  filterAdverts(filter: any): Promise<IFilterAdverts>;
}
