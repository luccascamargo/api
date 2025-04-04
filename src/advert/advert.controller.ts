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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AdvertService } from './advert.service';
import { CreateAdvertDto } from './dto/create-advert.dto';
import { UpdateAdvertDto } from './dto/update-advert.dto';
import { User } from 'src/decorators/user.decorator';
import { UserPayload } from 'src/auth/types/userPayload';
import { AuthGuard } from 'src/auth/auth.guard';
import { FilterAdvertsDto } from './dto/filter-advert.dto';
import { ValidateAdvertUserDto } from './dto/validate-advert-user.dto';

@Controller('adverts')
export class AdvertController {
  constructor(private readonly advertService: AdvertService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('file'))
  create(
    @UploadedFiles()
    files: Array<Express.Multer.File>,
    @Body() createAdvertDto: CreateAdvertDto,
  ) {
    return this.advertService.create(createAdvertDto, files);
  }

  @Post('/validateAdvert')
  @UseGuards(AuthGuard)
  validateAdvertUser(@Body('data') createAdvertDto: ValidateAdvertUserDto) {
    return this.advertService.validateAdvertUser(createAdvertDto);
  }

  @Get('/find/:id')
  findOne(@Param('id') id: string) {
    return this.advertService.findOne(id);
  }

  @Get('/advertsWithId/:id')
  findManyWithId(
    @Param('id') id: string,
    @Query() queryStatus?: { status: string },
  ) {
    return this.advertService.findManyWithId(id, queryStatus);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('file'))
  update(
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body('data') updateAdvertDto: UpdateAdvertDto,
  ) {
    return this.advertService.update(id, updateAdvertDto, files);
  }

  @Patch('/active/:id')
  @UseGuards(AuthGuard)
  active(@Param('id') id: string, @User() user: UserPayload) {
    return this.advertService.active(id, user);
  }

  @Patch('/inactive/:id')
  @UseGuards(AuthGuard)
  inactive(@Param('id') id: string, @User() user: UserPayload) {
    return this.advertService.inactive(id, user);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  remove(@User() user: UserPayload, @Param('id') id: string) {
    return this.advertService.remove(id, user);
  }

  @Get('/filter')
  filter(@Query() filterAdvertsDto: FilterAdvertsDto) {
    return this.advertService.filterAdverts(filterAdvertsDto);
  }

  @Get('/filterbytype/:type')
  filterType(
    @Query() filterAdvertsDto: FilterAdvertsDto,
    @Param('type') type: string,
  ) {
    return this.advertService.filterByType(filterAdvertsDto, type);
  }

  @Get('/filterbybrand/:brand')
  filterBrands(
    @Query() filterAdvertsDto: FilterAdvertsDto,
    @Param('brand') brand: string,
  ) {
    return this.advertService.filterByBrand(filterAdvertsDto, brand);
  }

  @Get('/filterbymodel/:model')
  filterModels(
    @Query() filterAdvertsDto: FilterAdvertsDto,
    @Param('model') model: string,
  ) {
    return this.advertService.filterByModel(filterAdvertsDto, model);
  }
}
