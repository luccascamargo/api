import { Adverts } from '@prisma/client';
import { CreateAdvertDto } from '../dto/create-advert.dto';
import { UpdateAdvertDto } from '../dto/update-advert.dto';
import { UserPayload } from 'src/auth/types/userPayload';
import { ValidateAdvertUserDto } from '../dto/validate-advert-user.dto';

interface IFilterAdverts {
  data: Adverts[];
  currentPage: number;
  nextPage: number;
}

export interface IAdvertService {
  create(
    createAdvertDto: CreateAdvertDto,
    files: Array<Express.Multer.File>,
  ): Promise<Adverts>;
  validateAdvertUser(
    ValidateAdvertUserDto: ValidateAdvertUserDto,
  ): Promise<Adverts>;
  findOne(id: string): Promise<Adverts>;
  findManyWithId(email: string, status?: { status: string }): Promise<any>;
  update(
    id: string,
    updateAdvertDto: UpdateAdvertDto,
    files: Array<Express.Multer.File>,
  ): Promise<Adverts>;
  active(id: string, user: UserPayload): Promise<any>;
  inactive(id: string, user: UserPayload): Promise<any>;
  remove(id: string, user: UserPayload): Promise<{ message: string }>;
  filterAdverts(filter: any): Promise<IFilterAdverts>;
  filterByType(filter: any, type: string): Promise<IFilterAdverts>;
  filterByBrand(filter: any, brand: string): Promise<IFilterAdverts>;
  filterByModel(filter: any, model: string): Promise<IFilterAdverts>;
}
