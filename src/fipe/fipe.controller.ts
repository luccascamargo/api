import { Controller, Get, Param } from '@nestjs/common';
import { FipeService } from './fipe.service';

@Controller('fipe')
export class FipeController {
  constructor(private readonly fipeService: FipeService) {}

  @Get('/types/')
  findTypes() {
    return this.fipeService.findTypes();
  }

  @Get('/brands/:type')
  findBrands(@Param('type') type: string) {
    return this.fipeService.findBrands(type);
  }

  @Get('/models/:type/:brand')
  findModels(@Param('type') type: string, @Param('brand') brand: string) {
    return this.fipeService.findModels(type, brand);
  }

  @Get('/years/:type/:brand/:model')
  findYears(
    @Param('type') type: string,
    @Param('brand') brand: string,
    @Param('model') model: string,
  ) {
    return this.fipeService.findYears(type, brand, model);
  }
}
