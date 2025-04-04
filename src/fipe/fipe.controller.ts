import { Controller, Get, Param } from '@nestjs/common';
import { FipeService } from './fipe.service';

@Controller('fipe')
export class FipeController {
  constructor(private readonly fipeService: FipeService) {}

  @Get('/sync')
  sync() {
    return this.fipeService.sync();
  }

  @Get('/brands/:type')
  getBrands(@Param('type') type: string) {
    return this.fipeService.findBrands(type);
  }

  @Get('/models/:brand')
  getModels(@Param('brand') brand: string) {
    return this.fipeService.findModels(brand);
  }
}
