import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('data')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Body() updateUserDto: UpdateUserDto,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.update(updateUserDto, id, file);
  }

  @Patch('/update-password')
  updatePassword(@Body('data') updatePasswordDto: UpdatePasswordDto) {
    return this.userService.updatePassword(updatePasswordDto);
  }

  @Patch('/active/:email')
  active(@Param('email') email: string) {
    return this.userService.active(email);
  }

  @Patch('/desactive/:email')
  desactive(@Param('email') email: string) {
    return this.userService.desactive(email);
  }
}
