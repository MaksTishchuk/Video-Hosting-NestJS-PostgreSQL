import VideoElasticSearchBodyInterface from './videoElasticSearchBody.interface';

interface VideoElasticSearchResultInterface {
  hits: {
    total: number
    hits: Array<{_source: VideoElasticSearchBodyInterface}>
  }
}

export default VideoElasticSearchResultInterface