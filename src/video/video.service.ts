import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "../entities/user.entity";
import {FindOptionsWhereProperty, ILike, In, MoreThan, Repository} from "typeorm";
import {VideoEntity} from "../entities/video.entity";
import {UpdateVideoDto} from "./dto/update-video.dto";
import {CreateVideoDto} from "./dto/create-video.dto";
import {FilesService} from "../files/files.service";
import {Cache} from "cache-manager";
import VideoElasticSearchService from "./videoElasticSearch.service";
import VideoElasticSearchBodyInterface from "./types/videoElasticSearchBody.interface";

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(VideoEntity)
    private readonly videoRepository: Repository<VideoEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private fileService: FilesService,
    private videoElasticSearchService: VideoElasticSearchService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) {}

  async createVideo(userId: number, dto: CreateVideoDto, video, thumbnail) {
    try {
      if (!video || !thumbnail) {throw new BadRequestException('Video must contains video and thumbnail files!')}
      const videoPath = await this.fileService.saveFile(video[0], 'videos')
      const thumbnailPath = await this.fileService.saveFile(thumbnail[0], 'thumbnails')
      const newVideo = this.videoRepository.create({
        ...dto, videoPath: videoPath, thumbnailPath: thumbnailPath, user: {id: userId}
      })
      await this.videoRepository.save(newVideo)
      await this.videoElasticSearchService.indexVideo(newVideo)
      return newVideo
    } catch (err) {
      throw new BadRequestException(`Something went wrong! ${err.message}`)}
  }

  async getAllVideos(search?: string) {
    if (search) {
      const results = await this.videoElasticSearchService.search(search)
      const ids = results.map((result: VideoElasticSearchBodyInterface) => result.id);
      if (!ids.length) return []
      return this.videoRepository.find({
        where: {id: In(ids)},
        relations: {user: true, comments: {user: true}},
        select: {
          user: {
            id: true, name: true, avatarPath: true, isVerified: true, subscribersCount: true, subscriptions: true
          },
          comments: {
            id: true, message: true, user: {id: true, name: true, avatarPath: true, subscribersCount: true}
          }
        }
      })
    }
    const videosFound = await this.cacheManager.get('videos')
    if (videosFound) return videosFound
    const videos = await this.videoRepository.find({
      order: {createdAt: 'desc'},
      relations: {user: true, comments: {user: true}},
      select: {
        user: {id: true, name: true, avatarPath: true, isVerified: true, subscribersCount: true, subscriptions: true},
        comments: {
          id: true, message: true, user: {id: true, name: true, avatarPath: true, subscribersCount: true}
        }
      }
    })
    await this.cacheManager.set('videos', videos)
    return videos
  }

  // async getAllVideos(search?: string) {
  //   if (!search) {
  //     const videosFound = await this.cacheManager.get('videos')
  //     if (videosFound) return videosFound
  //   }
  //   let options: FindOptionsWhereProperty<VideoEntity> = {}
  //   if (search) {
  //     options = {
  //       name: ILike(`%${search}%`)
  //     }
  //   }
  //   const videos = await this.videoRepository.find({
  //     where: {...options, isPublic: true},
  //     order: {createdAt: 'desc'},
  //     relations: {user: true, comments: {user: true}},
  //     select: {
  //       user: {id: true, name: true, avatarPath: true, isVerified: true, subscribersCount: true, subscriptions: true},
  //       comments: {
  //         id: true, message: true, user: {id: true, name: true, avatarPath: true, subscribersCount: true}
  //       }
  //     }
  //   })
  //   if (!search) await this.cacheManager.set('videos', videos)
  //   return videos
  // }

  async getMostPopularByViews() {
    let popularVideos = await this.cacheManager.get('popularVideos')
    if (popularVideos) return popularVideos
    popularVideos = this.videoRepository.find({
      where: {views: MoreThan(0)},
      order: {views: 'desc'},
      relations: {user: true, comments: {user: true}},
      select: {
        user: {id: true, name: true, avatarPath: true, isVerified: true, subscribersCount: true, subscriptions: true},
        comments: {
          id: true, message: true, user: {id: true, name: true, avatarPath: true, subscribersCount: true}
        }
      }
    })
    await this.cacheManager.set('popularVideos', popularVideos)
    return popularVideos
  }

  async getVideoById(id: number, isPublic = false) {
    const video = await this.videoRepository.findOne({
      where: isPublic ? {id, isPublic: true} : {id},
      relations: {user: true, comments: {user: true}},
      select: {
        user: {id: true, name: true, avatarPath: true, isVerified: true, subscribersCount: true, subscriptions: true},
        comments: {
          id: true, message: true, user: {id: true, name: true, avatarPath: true, subscribersCount: true}
        }
      }
    })
    if (!video) throw new NotFoundException('Video was not found!')
    return video
  }

  async updateVideo(id: number, dto: UpdateVideoDto, video, thumbnail) {
    try {
      const findVideo = await this.getVideoById(id)
      if (video) {
        this.fileService.removeFile(findVideo.videoPath)
        video = await this.fileService.saveFile(video[0], 'videos')
      }
      if (thumbnail) {
        this.fileService.removeFile(findVideo.thumbnailPath)
        thumbnail = await this.fileService.saveFile(thumbnail[0], 'thumbnails')
      }
      const updatedVideo = await this.videoRepository.save({
        ...findVideo,
        ...dto,
        videoPath: typeof video !== 'undefined' ? video : findVideo.videoPath,
        thumbnailPath: typeof thumbnail !== 'undefined' ? thumbnail : findVideo.thumbnailPath
      })
      await this.videoElasticSearchService.update(updatedVideo)
      return updatedVideo
    } catch (err) {throw new BadRequestException(`Something went wrong! ${err.message}`)}
  }

  async deleteVideo(id: number) {
    try {
      const video = await this.getVideoById(id)
      const result = await this.videoRepository.delete(id)
      if (!result.affected) {
        throw new NotFoundException(`Video with id "${id}" was not deleted!`)
      }
      await this.videoElasticSearchService.remove(video.id)
      await this.fileService.removeFile(video.videoPath)
      await this.fileService.removeFile(video.thumbnailPath)
      return {success: true, message: 'Video has been deleted!'}
    } catch (err) {throw new BadRequestException(`Something went wrong! ${err.message}`)}
  }

  async updateCountViews(id: number) {
    const video = await this.getVideoById(id)
    video.views++
    return await this.videoRepository.save(video)
  }

  async updateLikeVideo(user: UserEntity, videoId: number) {
    const video = await this.getVideoById(videoId)
    if (video.likedByUsers.find(thisUser => thisUser.id === user.id)) {
      video.likedByUsers = video.likedByUsers.filter(thisUser => thisUser.id !== user.id)
    } else {
      video.likedByUsers.push(user)
    }
    return await this.videoRepository.save(video)
  }
}
