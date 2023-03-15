import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "../entities/user.entity";
import {SubscriptionEntity} from "../entities/subscribtions.entity";
import {FilesService} from "../files/files.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, SubscriptionEntity])
  ],
  controllers: [UserController],
  providers: [UserService, FilesService]
})
export class UserModule {}
