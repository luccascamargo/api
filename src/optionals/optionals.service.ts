import { Injectable } from '@nestjs/common';
import { CreateOptionalDto } from './dto/create-optional.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { IOptionalService } from './interface/optional.interface';

@Injectable()
export class OptionalsService implements IOptionalService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createOptionalDto: CreateOptionalDto) {
    const optional = await this.prismaService.optional.create({
      data: {
        nome: createOptionalDto.name,
      },
    });

    return optional;
  }

  async findAll() {
    const optionals = await this.prismaService.optional.findMany();

    return optionals;
  }

  async remove(id: string): Promise<void> {
    await this.prismaService.optional.delete({
      where: {
        id,
      },
    });
  }
}
