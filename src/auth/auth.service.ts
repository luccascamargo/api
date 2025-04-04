import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SigninAuthDto } from './dto/signin-auth.dto';
import { IAuthService } from './interface/auth.interface';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    createAuthDto: CreateAuthDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const userAlreadyExists = await this.prismaService.user.findUnique({
      where: {
        email: createAuthDto.email,
      },
    });

    if (userAlreadyExists) {
      throw new BadRequestException('Usuário já existe');
    }

    const passwordHash = await bcrypt.hash(createAuthDto.senha, 10);

    const user = await this.prismaService.user.create({
      data: {
        ativo: true,
        email: createAuthDto.email,
        nome: createAuthDto.nome,
        sobrenome: createAuthDto.sobrenome,
        senha: passwordHash,
      },
    });

    const payload = {
      sub: user.id,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async login(
    signinAuthDto: SigninAuthDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const userAlreadyExists = await this.prismaService.user.findUnique({
      where: {
        email: signinAuthDto.email,
      },
    });

    if (!userAlreadyExists) {
      throw new BadRequestException('Usuário não existe');
    }

    if (userAlreadyExists.ativo === false) {
      throw new BadRequestException('Usuário desativado');
    }

    const comparePassword = await bcrypt.compare(
      signinAuthDto.senha,
      userAlreadyExists.senha,
    );

    if (!comparePassword) {
      throw new UnauthorizedException();
    }

    const payload = {
      sub: userAlreadyExists.id,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15d',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async getMe(id: string) {
    const userAlreadyExists = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        nome: true,
        sobrenome: true,
        email: true,
        imagem: true,
        telefone: true,
        plano: true,
        id: true,
        inscricoes: {
          where: {
            status: 'active',
          },
          select: {
            periodo_final: true,
            inscricao_id: true,
            status: true,
            ciclo: true,
            cancelar_ao_final_do_periodo: true,
          },
        },
      },
    });

    if (!userAlreadyExists) {
      throw new BadRequestException();
    }

    return userAlreadyExists;
  }
}
