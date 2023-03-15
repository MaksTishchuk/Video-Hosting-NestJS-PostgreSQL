import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, UploadedFiles,
  UseGuards, UseInterceptors
} from '@nestjs/common';
import { VideoService } from './video.service';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {GetUser} from "../auth/decorators/get-user.decorator";
import {CreateVideoDto} from "./dto/create-video.dto";
import {UpdateVideoDto} from "./dto/update-video.dto";
import {FileFieldsInterceptor} from "@nestjs/platform-express";
import {UserEntity} from "../entities/user.entity";

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]))
  createVideo(
    @GetUser('id') id: number,
    @Body() dto: CreateVideoDto,
    @UploadedFiles() files
  ) {
    const {video, thumbnail} = files
    return this.videoService.createVideo(id, dto, video, thumbnail)
  }

  @Get('')
  getAllVideos(@Query('search') search?: string) {
    return this.videoService.getAllVideos(search)
  }

  @Get('most-popular')
  getMostPopularByViews() {
    return this.videoService.getMostPopularByViews()
  }

  @Get('private/:id')
  getPrivateVideoById(@Param('id', ParseIntPipe) id: number) {
    return this.videoService.getVideoById(id)
  }

  @Get(':id')
  getVideoById(@Param('id', ParseIntPipe) id: number) {
    return this.videoService.getVideoById(id, true)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]))
  updateVideo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVideoDto,
    @UploadedFiles() files
  ) {
    const {video, thumbnail} = files
    return this.videoService.updateVideo(id, dto, video, thumbnail)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteVideo(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.videoService.deleteVideo(id)
  }

  @Patch(':id/views')
  updateCountViews(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.videoService.updateCountViews(id)
  }

  @Patch(':id/like')
  @UseGuards(JwtAuthGuard)
  updateLikeVideo(
    @GetUser() user: UserEntity,
    @Param('id', ParseIntPipe) videoId: number,
  ) {
    return this.videoService.updateLikeVideo(user, videoId)
  }
}
