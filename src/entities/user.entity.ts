import {Column, Entity, JoinColumn, ManyToMany, OneToMany} from "typeorm";
import {VideoEntity} from "./video.entity";
import {Base} from "./base.entity";
import {SubscriptionEntity} from "./subscribtions.entity";
import {CommentEntity} from "./comment.entity";

@Entity('user')
export class UserEntity extends Base {

  @Column({unique: true})
  email: string

  @Column({select: false})
  password: string

  @Column({default: ''})
  name: string

  @Column({default: true, name: 'is_verified'})
  isVerified: boolean

  @Column({default: 0, name: 'subscribers_count'})
  subscribersCount: number

  @Column({default: '', type: 'text'})
  description: string

  @Column({default: '', name: 'avatar_path'})
  avatarPath: string

  @OneToMany(() => VideoEntity, video => video.user)
  videos: VideoEntity[]

  @OneToMany(() => SubscriptionEntity, sub => sub.fromUser)
  subscriptions: SubscriptionEntity[]

  @OneToMany(() => SubscriptionEntity, sub => sub.toChannel)
  subscribers: SubscriptionEntity[]

  @OneToMany(() => CommentEntity, comment => comment.user)
  comments: CommentEntity[]

  @ManyToMany(type => VideoEntity, video => video.likedByUsers)
  likeVideos: VideoEntity[]
}