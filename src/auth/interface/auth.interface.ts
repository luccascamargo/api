import { User } from '@prisma/client';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { SigninAuthDto } from '../dto/signin-auth.dto';

type IGetMeReponse = Pick<
  User,
  'nome' | 'sobrenome' | 'email' | 'imagem' | 'plano' | 'telefone'
>;

export interface IAuthService {
  login(
    signinAuthDto: SigninAuthDto,
  ): Promise<{ accessToken: string; refreshToken: string }>;
  register(
    CreateAuthDto: CreateAuthDto,
  ): Promise<{ accessToken: string; refreshToken: string }>;
  getMe(id: string): Promise<IGetMeReponse>;
}
