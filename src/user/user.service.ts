import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly stripeService: StripeService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const userAlreadyExists = await this.prismaService.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (userAlreadyExists) {
      return new BadRequestException('Usuário já existe');
    }

    const customer = await this.stripeService.stripe.customers.create({
      name: `${createUserDto.nome} ${createUserDto.sobrenome}`,
      email: createUserDto.email,
    });

    if (!customer) {
      return new BadRequestException('Erro ao criar o cliente no Stripe');
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

  async findAll() {
    const users = await this.prismaService.user.findMany();
    return users;
  }

  async update(updateUserDto: UpdateUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: updateUserDto.email,
      },
    });

    if (!user) {
      return new BadRequestException('Usuário não encontrado');
    }

    const updatedUser = await this.prismaService.user.update({
      where: {
        email: updateUserDto.email,
      },
      data: {
        nome: updateUserDto.nome || user.nome,
        sobrenome: updateUserDto.sobrenome || user.sobrenome,
        telefone: updateUserDto.telefone || user.telefone,
        ativo: updateUserDto.ativo || user.ativo,
      },
    });

    return updatedUser;
  }
}
