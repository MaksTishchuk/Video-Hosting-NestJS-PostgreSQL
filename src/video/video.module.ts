import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {VideoEntity} from "../entities/video.entity";
import {CommentEntity} from "../entities/comment.entity";
import {UserEntity} from "../entities/user.entity";
import {FilesService} from "../files/files.service";
import {SearchModule} from "../search/search.module";
import VideoElasticSearchService from "./videoElasticSearch.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoEntity, CommentEntity, UserEntity]),
    SearchModule
  ],
  controllers: [VideoController],
  providers: [VideoService, VideoElasticSearchService, FilesService]
})
export class VideoModule {}
