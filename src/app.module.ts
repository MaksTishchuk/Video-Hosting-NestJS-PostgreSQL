import {CacheModule, Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {getTypeOrmConfig} from "./config/typeorm.config";
import { UserModule } from './user/user.module';
import { VideoModule } from './video/video.module';
import { CommentModule } from './comment/comment.module';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import {ServeStaticModule} from "@nestjs/serve-static";
import * as path from 'path'
import {configSchemaValidation} from "./config/schema.config";
import {getRedisConfig} from "./config/redis.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `stage.${process.env.NODE_ENV}.env`,
      validationSchema: configSchemaValidation
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getRedisConfig,
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig
    }),
    ServeStaticModule.forRoot({serveRoot: '/files', rootPath: path.resolve(__dirname, 'static')}),
    UserModule,
    VideoModule,
    CommentModule,
    AuthModule,
    FilesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
