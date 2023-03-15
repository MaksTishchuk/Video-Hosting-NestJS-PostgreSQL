import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {JwtStrategy} from "./strategies/jwt.strategy";
import {JwtModule, JwtService} from "@nestjs/jwt";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {getJwtConfig} from "../config/jwt.config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "../entities/user.entity";
import {PassportModule} from "@nestjs/passport";
import {UserService} from "../user/user.service";
import {UserModule} from "../user/user.module";
import {SubscriptionEntity} from "../entities/subscribtions.entity";
import {FilesModule} from "../files/files.module";
import {FilesService} from "../files/files.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, SubscriptionEntity]),
    ConfigModule.forRoot(),
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
    UserModule
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, FilesService, JwtService, JwtStrategy]
})
export class AuthModule {}
