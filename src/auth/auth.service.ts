import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SigninAuthDto } from './dto/sigin-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(createAuthDto: CreateAuthDto) {
    const userAlreadyExists = await this.prismaService.user.findUnique({
      where: {
        email: createAuthDto.email,
      },
    });

    if (userAlreadyExists) {
      return new BadRequestException();
    }

    const passwordHash = await bcrypt.hash(createAuthDto.senha, 10);

    const user = await this.prismaService.user.create({
      data: {
        ativo: true,
        email: createAuthDto.email,
        nome: createAuthDto.nome,
        sobrenome: createAuthDto.sobrenome,
        senha: passwordHash,
        stripe_id: Date.now().toString(),
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    await this.prismaService.refreshToken.create({
      data: {
        token: refreshToken,
        usuario_id: user.id,
      },
    });

    return { accessToken, refreshToken };
  }

  async signin(signinAuthDto: SigninAuthDto) {
    const userAlreadyExists = await this.prismaService.user.findUnique({
      where: {
        email: signinAuthDto.email,
      },
    });

    if (!userAlreadyExists) {
      return new BadRequestException();
    }

    const comparePassword = await bcrypt.compare(
      signinAuthDto.senha,
      userAlreadyExists.senha,
    );

    if (!comparePassword) {
      return new UnauthorizedException();
    }

    const payload = {
      sub: userAlreadyExists.id,
      email: userAlreadyExists.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    await this.prismaService.refreshToken.create({
      data: {
        token: refreshToken,
        usuario_id: userAlreadyExists.id,
      },
    });

    return { accessToken, refreshToken };
  }
}