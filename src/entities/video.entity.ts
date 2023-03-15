import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
  RelationCount
} from "typeorm";
import {UserEntity} from "./user.entity";
import {Base} from "./base.entity";
import {CommentEntity} from "./comment.entity";

@Entity('video')
export class VideoEntity extends Base {

  @Column()
  name: string

  @Column({default: false, name: 'is_public'})
  isPublic: boolean

  @Column({default: '', type: 'text'})
  description: string

  @Column({default: 0})
  views: number

  @ManyToMany(
    type => UserEntity,
    user => user.likeVideos,
    {eager: true},

  )
  @JoinTable()
  likedByUsers: UserEntity[]

  @RelationCount((news: VideoEntity) => news.likedByUsers )
  likesCount: number

  @Column({default: 0})
  duration: number

  @Column({default: '', name: 'video_path'})
  videoPath: string

  @Column({default: '', name: 'thumbnail_path'})
  thumbnailPath: string

  @ManyToOne(
    () => UserEntity,
    user => user.videos,
    {onDelete: 'CASCADE'})
  @JoinColumn({name: 'user_id'})
  user: UserEntity

  @OneToMany(() => CommentEntity, comment => comment.video)
  comments: CommentEntity[]

}