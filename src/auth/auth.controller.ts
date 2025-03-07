import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  HttpCode,
  Get,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { SigninAuthDto } from './dto/signin-auth.dto';
import { CookieInterceptor } from './auth.interceptor';

@Controller('auth')
@UseInterceptors(CookieInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @HttpCode(201)
  async signup(@Body() createAuthDto: CreateAuthDto) {
    const { accessToken, refreshToken } =
      await this.authService.register(createAuthDto);

    return { accessToken, refreshToken };
  }

  @Post('/signin')
  @HttpCode(200)
  async signin(@Body() siginAuthDto: SigninAuthDto) {
    const { accessToken, refreshToken } =
      await this.authService.login(siginAuthDto);

    return { accessToken, refreshToken };
  }

  @Get(`/me/:id`)
  @HttpCode(200)
  async me(@Param('id') id: string) {
    return this.authService.getMe(id);
  }
}
