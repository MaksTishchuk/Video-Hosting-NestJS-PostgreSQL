import {
  Body, Controller, Get, Param, ParseIntPipe, Patch, Put, UploadedFile, UseGuards, UseInterceptors
} from '@nestjs/common';
import { UserService } from './user.service';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {GetUser} from "../auth/decorators/get-user.decorator";
import {UpdateUserDto} from "./dto/update-user.dto";
import {FileInterceptor} from "@nestjs/platform-express";

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  getAllUsers() {
    return this.userService.getAllUsers()
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@GetUser('id') id: number) {
    return this.userService.getUserById(id)
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  updateProfile(
    @GetUser('id') id: number,
    @Body() dto: UpdateUserDto,
    @UploadedFile() avatar?
  ) {
    return this.userService.updateProfile(id, dto, avatar)
  }

  @Get(':id')
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @UploadedFile() avatar?
  ) {
    return this.userService.updateProfile(id, dto, avatar)
  }

  @Patch(':channelId/subscribe')
  @UseGuards(JwtAuthGuard)
  subscribeToChannel(
    @GetUser('id') id: number,
    @Param('channelId', ParseIntPipe) channelId: number,
  ) {
    return this.userService.subscribeToChannel(id, channelId)
  }
}
