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
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly stripeService: StripeService,
    private readonly s3Service: S3Service,
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

  async update(
    UpdateUserDto: UpdateUserDto,
    id: string,
    file: Express.Multer.File,
  ): Promise<User> {
    const userAlreadyExists = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!userAlreadyExists) {
      throw new BadRequestException();
    }

    let urlImage: string;
    if (file) {
      urlImage = await this.s3Service.uploadFile(file);
    }

    const user = await this.prismaService.user.update({
      where: {
        id: userAlreadyExists.id,
      },
      data: {
        nome: UpdateUserDto.nome || userAlreadyExists.nome,
        sobrenome: UpdateUserDto.sobrenome || userAlreadyExists.sobrenome,
        telefone: UpdateUserDto.telefone || userAlreadyExists.telefone,
        imagem: urlImage || userAlreadyExists.imagem,
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

    await this.prismaService.adverts.updateMany({
      where: {
        usuario_id: user.id,
      },
      data: {
        status: 'INATIVO',
      },
    });

    return user;
  }
}
