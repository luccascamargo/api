import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';
import * as bcrypt from 'bcrypt';
import { IUserService } from './interface/user.interface';
import { User } from '@prisma/client';
import { UpdatePasswordDto } from './dto/update-password';

@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly stripeService: StripeService,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    const userAlreadyExists = await this.prismaService.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (userAlreadyExists) {
      throw new BadRequestException('Usuário já existe');
    }

    const customer = await this.stripeService.stripe.customers.create({
      name: `${createUserDto.nome} ${createUserDto.sobrenome}`,
      email: createUserDto.email,
    });

    if (!customer) {
      throw new BadRequestException('Erro ao criar o cliente no Stripe');
    }

    const passwordHash = await bcrypt.hash(createUserDto.senha, 10);

    const user = await this.prismaService.user.create({
      data: {
        ativo: true,
        email: createUserDto.email,
        nome: createUserDto.nome,
        sobrenome: createUserDto.sobrenome,
        senha: passwordHash,
        stripe_id: customer.id,
      },
    });

    return user;
  }

  async findAll(): Promise<User[] | []> {
    const users = await this.prismaService.user.findMany();
    return users;
  }

  async update(UpdateUserDto: UpdateUserDto): Promise<User> {
    let newPasswordHash: string;
    const userAlreadyExists = await this.prismaService.user.findUnique({
      where: {
        email: UpdateUserDto.email,
      },
    });

    if (!userAlreadyExists) {
      throw new BadRequestException();
    }

    const comparePassword = await bcrypt.compare(
      UpdateUserDto.senha,
      userAlreadyExists.senha,
    );

    if (!comparePassword) {
      throw new UnauthorizedException();
    }

    if (UpdateUserDto.novaSenha) {
      newPasswordHash = await bcrypt.hash(UpdateUserDto.novaSenha, 10);
    }

    const user = await this.prismaService.user.update({
      where: {
        id: userAlreadyExists.id,
      },
      data: {
        nome: UpdateUserDto.nome,
        sobrenome: UpdateUserDto.sobrenome,
        senha: newPasswordHash ? newPasswordHash : userAlreadyExists.senha,
        telefone: UpdateUserDto.telefone,
      },
    });

    return user;
  }

  async updatePassword(updatePasswordDto: UpdatePasswordDto): Promise<User> {
    let newPasswordHash: string;
    const userAlreadyExists = await this.prismaService.user.findUnique({
      where: {
        email: updatePasswordDto.email,
      },
    });

    if (!userAlreadyExists) {
      throw new BadRequestException();
    }

    const comparePassword = await bcrypt.compare(
      updatePasswordDto.senha,
      userAlreadyExists.senha,
    );

    if (!comparePassword) {
      throw new UnauthorizedException();
    }

    if (updatePasswordDto.novaSenha) {
      newPasswordHash = await bcrypt.hash(updatePasswordDto.novaSenha, 10);
    }

    const user = await this.prismaService.user.update({
      where: {
        id: userAlreadyExists.id,
      },
      data: {
        senha: newPasswordHash,
      },
    });

    return user;
  }

  async delete(email: string): Promise<{ message: string }> {
    const userAlreadyExists = await this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!userAlreadyExists) {
      throw new BadRequestException();
    }

    await this.prismaService.user.update({
      where: {
        id: userAlreadyExists.id,
      },
      data: {
        ativo: false,
      },
    });

    return { message: 'Usuário deletado com sucesso' };
  }

  async active(email: string): Promise<User> {
    const userAlreadyExists = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!userAlreadyExists) {
      throw new BadRequestException();
    }

    const user = await this.prismaService.user.update({
      where: {
        email,
      },
      data: {
        ativo: true,
      },
    });

    return user;
  }

  async desactive(email: string): Promise<User> {
    const userAlreadyExists = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!userAlreadyExists) {
      throw new BadRequestException();
    }

    const user = await this.prismaService.user.update({
      where: {
        email,
      },
      data: {
        ativo: false,
      },
    });

    return user;
  }
}
