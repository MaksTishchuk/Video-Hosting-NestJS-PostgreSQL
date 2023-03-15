import {Column, Entity, ManyToOne, OneToMany, JoinColumn} from "typeorm";
import {UserEntity} from "./user.entity";
import {Base} from "./base.entity";
import {VideoEntity} from "./video.entity";

@Entity('comment')
export class CommentEntity extends Base {

  @Column()
  message: string

  @ManyToOne(
    () => UserEntity,
    user => user.comments,
    {onDelete: 'CASCADE'})
  @JoinColumn({name: 'user_id'})
  user: UserEntity

  @ManyToOne(
    () => VideoEntity,
    video => video.comments,
    {onDelete: 'CASCADE'})
  @JoinColumn({name: 'video_id'})
  video: VideoEntity

}