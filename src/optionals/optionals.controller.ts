import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { OptionalsService } from './optionals.service';
import { CreateOptionalDto } from './dto/create-optional.dto';

@Controller('optionals')
export class OptionalsController {
  constructor(private readonly optionalsService: OptionalsService) {}

  @Post()
  create(@Body() createOptionalDto: CreateOptionalDto) {
    return this.optionalsService.create(createOptionalDto);
  }

  @Get()
  findAll() {
    return this.optionalsService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.optionalsService.remove(id);
  }
}
