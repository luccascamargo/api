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
import { StripeService } from 'src/stripe/stripe.service';
import { IAuthService } from './interface/auth.interface';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly stripeService: StripeService,
  ) {}

  async register(
    createAuthDto: CreateAuthDto,
  ): Promise<{ accessToken: string }> {
    const userAlreadyExists = await this.prismaService.user.findUnique({
      where: {
        email: createAuthDto.email,
      },
    });

    if (userAlreadyExists) {
      throw new BadRequestException('Usuário já existe');
    }

    const customer = await this.stripeService.stripe.customers.create({
      name: `${createAuthDto.nome} ${createAuthDto.sobrenome}`,
      email: createAuthDto.email,
    });

    if (!customer) {
      throw new BadRequestException('Erro ao criar o cliente no Stripe');
    }

    const passwordHash = await bcrypt.hash(createAuthDto.senha, 10);

    const user = await this.prismaService.user.create({
      data: {
        ativo: true,
        email: createAuthDto.email,
        nome: createAuthDto.nome,
        sobrenome: createAuthDto.sobrenome,
        senha: passwordHash,
        stripe_id: customer.id,
      },
    });

    const payload = {
      sub: user.id,
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

    return { accessToken };
  }

  async login(signinAuthDto: SigninAuthDto): Promise<{ accessToken: string }> {
    const userAlreadyExists = await this.prismaService.user.findUnique({
      where: {
        email: signinAuthDto.email,
      },
    });

    if (!userAlreadyExists) {
      throw new BadRequestException();
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

    return { accessToken };
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
      },
    });

    if (!userAlreadyExists) {
      throw new BadRequestException();
    }

    return userAlreadyExists;
  }
}
