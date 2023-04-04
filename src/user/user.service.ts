import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "../entities/user.entity";
import {Repository} from "typeorm";
import {SubscriptionEntity} from "../entities/subscribtions.entity";
import {UpdateUserDto} from "./dto/update-user.dto";
import {FilesService} from "../files/files.service";
import { Cache } from 'cache-manager'

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepository: Repository<SubscriptionEntity>,
    private fileService: FilesService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getAllUsers() {
    let users = await this.cacheManager.get('users')
    if (users) return users
    users = await this.userRepository.find({order: {createdAt: 'desc'}})
    await this.cacheManager.set('users', users)
    return users
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: {id},
      relations: {videos: true, subscriptions: {toChannel: true}}
    })
    if (!user) throw new NotFoundException('User was not found!')
    return user
  }

  async updateProfile(id: number, dto: UpdateUserDto, avatar) {
    try {
      const user = await this.getUserById(id)
      if (avatar) {
        this.fileService.removeFile(user.avatarPath)
        avatar = await this.fileService.saveFile(avatar, 'avatars')
      }
      const updatedUser = await this.userRepository.update(
        {id},
        {
          ...dto,
          avatarPath: typeof avatar !== 'undefined' ? avatar : user.avatarPath
        }
      )
      if (!updatedUser.affected) {
        throw new NotFoundException(`User with id "${user.id}" has not been updated!`)
      }
      return await this.getUserById(user.id)
    } catch (err) {throw new BadRequestException(`Something went wrong! ${err.message}`)}
  }

  async subscribeToChannel(id: number, channelId: number) {
    try {
      const data = {
        toChannel: {id: channelId},
        fromUser: {id}
      }
      const isSubscribed = await this.subscriptionRepository.findOneBy(data)
      if (!isSubscribed) {
        const newSubscription = await this.subscriptionRepository.create(data)
        await this.subscriptionRepository.save(newSubscription)
        return {isSubscribedOnChannel: true}
      }
      await this.subscriptionRepository.delete(data)
      return {isSubscribedOnChannel: false}
    } catch (err) {throw new BadRequestException(`Something went wrong! ${err.message}`)}
  }

}
