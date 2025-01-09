import { CreateAuthDto } from '../dto/create-auth.dto';
import { SigninAuthDto } from '../dto/signin-auth.dto';

export interface IAuthService {
  login(
    signinAuthDto: SigninAuthDto,
  ): Promise<{ accessToken: string; refreshToken: string }>;
  register(
    CreateAuthDto: CreateAuthDto,
  ): Promise<{ accessToken: string; refreshToken: string }>;
}
