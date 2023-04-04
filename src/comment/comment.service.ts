import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CommentEntity} from "../entities/comment.entity";
import {CommentDto} from "./dto/comment.dto";
import {Cache} from "cache-manager";

@Injectable()
export class CommentService {

  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async createComment(userId: number, dto: CommentDto) {
    try {
      const comment = this.commentRepository.create({
        message: dto.message, video: {id: dto.videoId}, user: {id: userId}
      })
      return await this.commentRepository.save(comment)
    } catch (err) {throw new BadRequestException(`Something went wrong! ${err.message}`)}
  }

  async getAllComments() {
    let comments = await this.cacheManager.get('comments')
    if (comments) return comments
    comments = await this.commentRepository.find({
      order: {createdAt: 'desc'},
      relations: {user: true, video: {user: true}},
      select: {
        user: {id: true, name: true, avatarPath: true, isVerified: true, subscribersCount: true, subscriptions: true},
        video: {
          id: true, name: true, user: {id: true, name: true, avatarPath: true, subscribersCount: true}
        }
      }
    })
    await this.cacheManager.set('comments', comments)
    return comments
  }

  async getCommentById(id: number) {
    const comment = await this.commentRepository.findOne({
      where: {id},
      relations: {user: true, video: {user: true}},
      select: {
        user: {id: true, name: true, avatarPath: true, isVerified: true, subscribersCount: true, subscriptions: true},
        video: {
          id: true, name: true, user: {id: true, name: true, avatarPath: true, subscribersCount: true}
        }
      }
    })
    if (!comment) throw new NotFoundException('Comment was not found!')
    return comment
  }

  async updateComment(id: number, dto: CommentDto) {
    try {
      const comment = await this.getCommentById(id)
      return await this.commentRepository.save({...comment, ...dto})
    } catch (err) {throw new BadRequestException(`Something went wrong! ${err.message}`)}
  }

  async deleteComment(id: number) {
    try {
      const comment = await this.getCommentById(id)
      const result = await this.commentRepository.delete(id)
      if (!result.affected) {
        throw new NotFoundException(`Comment with id "${id}" was not deleted!`)
      }
      return {success: true, message: 'Comment has been deleted!'}
    } catch (err) {throw new BadRequestException(`Something went wrong! ${err.message}`)}
  }

}
