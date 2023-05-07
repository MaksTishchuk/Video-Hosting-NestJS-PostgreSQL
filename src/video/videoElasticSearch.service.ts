import {Injectable} from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import VideoElasticSearchResultInterface from "./types/videoElasticSearchResult.interface";
import VideoElasticSearchBodyInterface from "./types/videoElasticSearchBody.interface";
import {VideoEntity} from "../entities/video.entity";


@Injectable()
export default class VideoElasticSearchService {
  index = 'videos'

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async indexVideo(video: VideoEntity) {
    return this.elasticsearchService.index<VideoElasticSearchResultInterface, VideoElasticSearchBodyInterface>({
      index: this.index,
      body: {
        id: video.id,
        name: video.name,
        description: video.description,
        userId: video.user.id
      }
    });
  }

  async search(search: string) {
    const {body} = await this.elasticsearchService.search<VideoElasticSearchResultInterface>({
      index: this.index,
      body: {
        query: {
          multi_match: {
            query: search,
            fields: ['name', 'description']
          }
        }
      }
    })
    const hits = body.hits.hits;
    return hits.map((item) => item._source);
  }

  async remove(videoId: number) {
    this.elasticsearchService.deleteByQuery({
      index: this.index,
      body: {
        query: {
          match: {
            id: videoId,
          }
        }
      }
    })
  }

  async update(video: VideoEntity) {
    const newBody: VideoElasticSearchBodyInterface = {
      id: video.id,
      name: video.name,
      description: video.description,
      userId: video.user.id
    }

    const script = Object.entries(newBody).reduce((result, [key, value]) => {
      return `${result} ctx._source.${key}='${value}';`;
    }, '');

    return this.elasticsearchService.updateByQuery({
      index: this.index,
      body: {
        query: {
          match: {
            id: video.id
          }
        },
        script: {
          inline: script
        }
      }
    })
  }

}