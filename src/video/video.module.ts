import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {VideoEntity} from "../entities/video.entity";
import {CommentEntity} from "../entities/comment.entity";
import {UserEntity} from "../entities/user.entity";
import {FilesService} from "../files/files.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoEntity, CommentEntity, UserEntity]),
  ],
  controllers: [VideoController],
  providers: [VideoService, FilesService]
})
export class VideoModule {}
