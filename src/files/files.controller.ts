import {
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FilesService } from './files.service';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {FileInterceptor} from "@nestjs/platform-express";
import { Express } from 'express'

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadMediaFile(
    @UploadedFile() mediaFile: Express.Multer.File,
    @Query('folder') folder?: string
  ) {
    return this.filesService.saveFile(mediaFile, folder)
  }
}
