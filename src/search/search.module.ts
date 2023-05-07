import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {ElasticsearchModule} from "@nestjs/elasticsearch";

@Module({
  imports: [
    ConfigModule,
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get('ELASTICSEARCH_NODE'),
        auth: {
          username: configService.get('ELASTICSEARCH_USERNAME'),
          password: configService.get('ELASTICSEARCH_PASSWORD'),
        }
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [ElasticsearchModule],
  controllers: [SearchController],
  providers: [SearchService]
})
export class SearchModule {}
