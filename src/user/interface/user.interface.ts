import { User } from '@prisma/client';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdatePasswordDto } from '../dto/update-password';

export interface IUserService {
  create(user: CreateUserDto): Promise<User>;
  findAll(): Promise<User[] | []>;
  update(
    user: UpdateUserDto,
    id: string,
    file: Express.Multer.File,
  ): Promise<User>;
  updatePassword(values: UpdatePasswordDto): Promise<User>;
  delete(email: string): Promise<{ message: string }>;
  active(email: string): Promise<User>;
  desactive(email: string): Promise<User>;
}
