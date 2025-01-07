import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { SigninAuthDto } from './dto/sigin-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  signup(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signup(createAuthDto);
  }

  @Post('/signin')
  signin(@Body() siginAuthDto: SigninAuthDto) {
    return this.authService.signin(siginAuthDto);
  }

  @Patch('/update')
  update(@Param('email') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(updateAuthDto);
  }

  @Patch('/delete/:email')
  delete(@Param('email') email: string) {
    return this.authService.delete(email);
  }
}
