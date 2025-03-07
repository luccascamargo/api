import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AdvertService } from './advert.service';
import { CreateAdvertDto } from './dto/create-advert.dto';
import { UpdateAdvertDto } from './dto/update-advert.dto';
import { User } from 'src/decorators/user.decorator';
import { UserPayload } from 'src/auth/types/userPayload';
import { AuthGuard } from 'src/auth/auth.guard';
import { FilterAdvertsDto } from './dto/filter-advert.dto';

@Controller('adverts')
export class AdvertController {
  constructor(private readonly advertService: AdvertService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createAdvertDto: CreateAdvertDto) {
    return this.advertService.create(createAdvertDto);
  }

  @Get('/find/:id')
  findOne(@Param('id') id: string) {
    return this.advertService.findOne(id);
  }

  @Get('/advertsWithEmail/:email')
  findManyWithEmail(@Param('email') email: string) {
    return this.advertService.findManyWithEmail(email);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @User() user: UserPayload,
    @Param('id') id: string,
    @Body() updateAdvertDto: UpdateAdvertDto,
  ) {
    return this.advertService.update(user, id, updateAdvertDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@User() user: UserPayload, @Param('id') id: string) {
    return this.advertService.remove(id, user);
  }

  @Get('/filter')
  filter(@Query() filterAdvertsDto: FilterAdvertsDto) {
    return this.advertService.filterAdverts(filterAdvertsDto);
  }
}
